"use client";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";

type PulseShape = "gaussian" | "drag" | "square" | "cosine";
type Axis = "X" | "Y";

interface PulseParams {
  shape: PulseShape;
  axis: Axis;
  amplitude: number;   // Ω₀ in MHz
  duration: number;    // σ or total duration in ns
  frequency: number;   // drive detuning Δ in MHz
  dragBeta: number;    // DRAG β coefficient
}

interface BlochState { x: number; y: number; z: number }

const NPOINTS = 256;
const DT = 1 / NPOINTS; // normalised time step

function gaussianEnvelope(t: number, sigma: number): number {
  const center = 0.5;
  return Math.exp(-((t - center) ** 2) / (2 * sigma ** 2));
}

function cosineEnvelope(t: number): number {
  return 0.5 * (1 - Math.cos(2 * Math.PI * t));
}

function buildEnvelope(shape: PulseShape, params: PulseParams): { I: number[]; Q: number[] } {
  const { amplitude, duration, dragBeta } = params;
  const sigma = 0.2; // relative sigma for gaussian/drag
  const I: number[] = [];
  const Q: number[] = [];

  for (let i = 0; i < NPOINTS; i++) {
    const t = i / NPOINTS;
    let env = 0;
    let denv = 0;

    switch (shape) {
      case "gaussian": {
        env = gaussianEnvelope(t, sigma);
        denv = env * (-(t - 0.5) / (sigma ** 2));
        break;
      }
      case "drag": {
        env = gaussianEnvelope(t, sigma);
        denv = env * (-(t - 0.5) / (sigma ** 2));
        break;
      }
      case "square": {
        const ramp = 0.05;
        if (t < ramp) env = t / ramp;
        else if (t > 1 - ramp) env = (1 - t) / ramp;
        else env = 1;
        denv = 0;
        break;
      }
      case "cosine": {
        env = cosineEnvelope(t);
        denv = Math.PI * Math.sin(2 * Math.PI * t);
        break;
      }
    }

    const scaledEnv = amplitude * env;
    const scaledDenv = amplitude * denv;

    if (shape === "drag") {
      I.push(scaledEnv);
      Q.push(-dragBeta * scaledDenv / (amplitude || 1));
    } else {
      I.push(scaledEnv);
      Q.push(0);
    }
  }
  return { I, Q };
}

function simulateBloch(params: PulseParams): BlochState[] {
  const { axis, duration, frequency } = params;
  const { I, Q } = buildEnvelope(params.shape, params);

  // Rotate frame: drive at qubit frequency, detuning = frequency offset
  const dt_ns = duration / NPOINTS; // ns per step
  const delta = frequency * 2 * Math.PI * 1e-3; // rad/ns (MHz → GHz → rad/ns)

  let bx = 0, by = 0, bz = 1; // start at |0⟩
  const states: BlochState[] = [{ x: bx, y: by, z: bz }];

  for (let i = 0; i < NPOINTS; i++) {
    const omega_i = I[i] * 2 * Math.PI * 1e-3; // rad/ns
    const omega_q = Q[i] * 2 * Math.PI * 1e-3;

    // Drive along X or Y in rotating frame
    let hx = axis === "X" ? omega_i : omega_q;
    let hy = axis === "X" ? omega_q : omega_i;
    let hz = delta;

    const dt = dt_ns;
    const mag = Math.sqrt(hx*hx + hy*hy + hz*hz);

    if (mag < 1e-12) {
      states.push({ x: bx, y: by, z: bz });
      continue;
    }

    // Rodrigues rotation
    const angle = mag * dt;
    const ux = hx/mag, uy = hy/mag, uz = hz/mag;
    const c = Math.cos(angle), s = Math.sin(angle), t = 1 - c;

    const nx = (t*ux*ux + c)*bx    + (t*ux*uy - s*uz)*by + (t*ux*uz + s*uy)*bz;
    const ny = (t*ux*uy + s*uz)*bx + (t*uy*uy + c)*by    + (t*uy*uz - s*ux)*bz;
    const nz = (t*ux*uz - s*uy)*bx + (t*uy*uz + s*ux)*by + (t*uz*uz + c)*bz;

    bx = nx; by = ny; bz = nz;
    states.push({ x: bx, y: by, z: bz });
  }
  return states;
}

// ── Canvas drawing helpers ─────────────────────────────────────────────────

function drawPulse(
  canvas: HTMLCanvasElement,
  params: PulseParams,
  darkMode: boolean
) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const { I, Q } = buildEnvelope(params.shape, params);
  const pad = { l: 40, r: 16, t: 16, b: 32 };
  const pw = W - pad.l - pad.r;
  const ph = H - pad.t - pad.b;

  const maxAmp = params.amplitude || 1;
  const scale = (v: number) => pad.t + ph * (1 - (v / (maxAmp * 1.2) + 1) / 2);
  const xOf = (i: number) => pad.l + (i / NPOINTS) * pw;

  // Grid
  const gridColor = darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const textColor = darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 0.5;
  [0, 0.5, 1].forEach(frac => {
    const y = pad.t + ph * frac;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + pw, y); ctx.stroke();
  });

  // Zero line
  ctx.strokeStyle = darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1;
  const y0 = scale(0);
  ctx.beginPath(); ctx.moveTo(pad.l, y0); ctx.lineTo(pad.l + pw, y0); ctx.stroke();

  // Q (dashed)
  const hasQ = Q.some(v => Math.abs(v) > 0.001);
  if (hasQ) {
    ctx.strokeStyle = "#7b7fa8";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    Q.forEach((v, i) => {
      const x = xOf(i), y = scale(v);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // I (solid)
  ctx.strokeStyle = "#e87a5a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  I.forEach((v, i) => {
    const x = xOf(i), y = scale(v);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Fill under I
  ctx.fillStyle = "rgba(232,122,90,0.1)";
  ctx.beginPath();
  ctx.moveTo(xOf(0), y0);
  I.forEach((v, i) => ctx.lineTo(xOf(i), scale(v)));
  ctx.lineTo(xOf(NPOINTS - 1), y0);
  ctx.closePath();
  ctx.fill();

  // Axis labels
  ctx.fillStyle = textColor;
  ctx.font = "11px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(`${params.amplitude}`, pad.l - 4, scale(params.amplitude) + 4);
  ctx.fillText("0", pad.l - 4, y0 + 4);
  ctx.textAlign = "center";
  ctx.fillText("0", pad.l, pad.t + ph + 16);
  ctx.fillText(`${params.duration} ns`, pad.l + pw, pad.t + ph + 16);
  ctx.fillText("Ω (MHz)", pad.l + pw / 2, pad.t + ph + 28);
}

function drawBlochProjections(
  canvas: HTMLCanvasElement,
  states: BlochState[],
  darkMode: boolean
) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const panels = [
    { label: "Z  (population)", fn: (s: BlochState) => s.z },
    { label: "X", fn: (s: BlochState) => s.x },
    { label: "Y", fn: (s: BlochState) => s.y },
  ];
  const ph = H / panels.length;
  const padL = 38, padR = 10, padT = 14, padB = 4;

  const textColor = darkMode ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)";
  const gridColor = darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const colors = ["#7b7fa8", "#e87a5a", "#c8b86a"];

  panels.forEach(({ label, fn }, pi) => {
    const y0 = pi * ph;
    const pw = W - padL - padR;
    const drawH = ph - padT - padB;
    const toY = (v: number) => y0 + padT + drawH * (1 - (v + 1) / 2);
    const toX = (i: number) => padL + (i / (states.length - 1)) * pw;

    // Panel bg
    if (pi % 2 === 0) {
      ctx.fillStyle = darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)";
      ctx.fillRect(0, y0, W, ph);
    }

    // Grid lines at ±1 and 0
    ctx.strokeStyle = gridColor; ctx.lineWidth = 0.5;
    [1, 0, -1].forEach(v => {
      const y = toY(v);
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + pw, y); ctx.stroke();
    });

    // Zero line
    ctx.strokeStyle = darkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.8;
    const zeroY = toY(0);
    ctx.beginPath(); ctx.moveTo(padL, zeroY); ctx.lineTo(padL + pw, zeroY); ctx.stroke();

    // Trace
    ctx.strokeStyle = colors[pi];
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    states.forEach((s, i) => {
      const x = toX(i), y = toY(fn(s));
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Final value dot
    const last = states[states.length - 1];
    const lv = fn(last);
    ctx.fillStyle = colors[pi];
    ctx.beginPath();
    ctx.arc(toX(states.length - 1), toY(lv), 4, 0, Math.PI * 2);
    ctx.fill();

    // Labels
    ctx.fillStyle = textColor;
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(label, 2, y0 + padT + 2);
    ctx.textAlign = "right";
    ctx.fillText("1", padL - 3, toY(1) + 4);
    ctx.fillText("0", padL - 3, toY(0) + 4);
    ctx.fillText("-1", padL - 3, toY(-1) + 4);

    // Final value annotation
    ctx.fillStyle = colors[pi];
    ctx.textAlign = "left";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.fillText(lv.toFixed(3), toX(states.length - 1) + 6, toY(lv) + 4);
  });
}

// ── Main component ─────────────────────────────────────────────────────────

const SHAPES: { value: PulseShape; label: string; desc: string }[] = [
  { value: "gaussian", label: "Gaussian",   desc: "Standard Gaussian envelope. Minimal spectral leakage." },
  { value: "drag",     label: "DRAG",       desc: "Derivative Removal via Adiabatic Gate. Q quadrature suppresses leakage to |2⟩." },
  { value: "square",   label: "Square",     desc: "Rectangular pulse with soft ramps. Simple but broadband." },
  { value: "cosine",   label: "Cosine",     desc: "Raised cosine envelope. Good sidelobe suppression." },
];

export default function PulseSimulatorPage() {
  const pulseCanvasRef = useRef<HTMLCanvasElement>(null);
  const blochCanvasRef = useRef<HTMLCanvasElement>(null);
  const darkMode = useRef(window?.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false);

  const [params, setParams] = useState<PulseParams>({
    shape: "gaussian",
    axis: "X",
    amplitude: 25,
    duration: 40,
    frequency: 0,
    dragBeta: 0.5,
  });

  const states = useMemo(() => simulateBloch(params), [params]);
  const finalState = states[states.length - 1];

  const redrawPulse = useCallback(() => {
    const canvas = pulseCanvasRef.current;
    if (!canvas) return;
    const W = canvas.parentElement!.offsetWidth;
    canvas.width = W * devicePixelRatio;
    canvas.height = 160 * devicePixelRatio;
    canvas.style.height = "160px";
    drawPulse(canvas, params, darkMode.current);
  }, [params]);

  const redrawBloch = useCallback(() => {
    const canvas = blochCanvasRef.current;
    if (!canvas) return;
    const W = canvas.parentElement!.offsetWidth;
    canvas.width = W * devicePixelRatio;
    canvas.height = 210 * devicePixelRatio;
    canvas.style.height = "210px";
    drawBlochProjections(canvas, states, darkMode.current);
  }, [states]);

  useEffect(() => { redrawPulse(); }, [redrawPulse]);
  useEffect(() => { redrawBloch(); }, [redrawBloch]);

  const set = (k: keyof PulseParams) => (v: any) =>
    setParams(p => ({ ...p, [k]: v }));

  const fidelity = Math.abs(finalState.z);
  const rotation = Math.acos(Math.max(-1, Math.min(1, finalState.z))) * 180 / Math.PI;
  const isXGate = Math.abs(finalState.z + 1) < 0.05;
  const isId    = Math.abs(finalState.z - 1) < 0.05;

  const sliderLabel: React.CSSProperties = {
    fontFamily: "system-ui, sans-serif",
    fontSize: "0.68rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "var(--text-muted)",
    marginBottom: "0.3rem",
    display: "flex",
    justifyContent: "space-between",
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem" }}>
        Circuit QED › Interactive › <span style={{ color: "var(--text)" }}>Pulse Simulator</span>
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <span className="tag">Interactive</span>
        <span className="tag">Microwave pulses</span>
        <span className="tag">Qubit control</span>
      </div>

      <h1 style={{ fontFamily: "system-ui,sans-serif", fontSize: "2.2rem", fontWeight: 900, color: "var(--text)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "0.5rem" }}>
        Pulse Simulator
      </h1>
      <p style={{ fontFamily: "Georgia,serif", fontSize: "0.95rem", color: "var(--text-body)", lineHeight: 1.7, marginBottom: "2rem", maxWidth: "580px" }}>
        Design microwave control pulses and visualise how they rotate a qubit on the Bloch sphere. Choose a pulse shape, adjust amplitude and duration, and see the resulting gate in real time.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "1.25rem", alignItems: "start" }}>

        {/* ── Controls ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Pulse shape */}
          <div style={{ background: "var(--bg-surface)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "1rem" }}>
            <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
              Pulse shape
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {SHAPES.map(s => (
                <button
                  key={s.value}
                  onClick={() => set("shape")(s.value)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "flex-start",
                    padding: "0.55rem 0.75rem",
                    fontFamily: "system-ui,sans-serif",
                    background: params.shape === s.value ? "var(--accent)" : "var(--bg)",
                    border: `1.5px solid ${params.shape === s.value ? "var(--accent-dark)" : "var(--border-soft)"}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    boxShadow: params.shape === s.value ? "var(--shadow)" : "none",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)" }}>{s.label}</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", lineHeight: 1.4 }}>{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Drive axis */}
          <div style={{ background: "var(--bg-surface)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "1rem" }}>
            <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-muted)", marginBottom: "0.6rem" }}>
              Drive axis
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              {(["X", "Y"] as Axis[]).map(ax => (
                <button
                  key={ax}
                  onClick={() => set("axis")(ax)}
                  style={{ padding: "0.5rem", fontFamily: "Georgia,serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", background: params.axis === ax ? "var(--accent)" : "var(--bg)", border: `1.5px solid ${params.axis === ax ? "var(--accent-dark)" : "var(--border-soft)"}`, borderRadius: "8px", cursor: "pointer", boxShadow: params.axis === ax ? "var(--shadow)" : "none" }}
                >
                  {ax}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div style={{ background: "var(--bg-surface)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-muted)" }}>
              Parameters
            </div>

            {[
              { key: "amplitude", label: "Amplitude Ω₀", unit: "MHz", min: 1,   max: 100, step: 1 },
              { key: "duration",  label: "Duration",      unit: "ns",  min: 5,   max: 200, step: 5 },
              { key: "frequency", label: "Detuning Δ",   unit: "MHz", min: -50, max: 50,  step: 1 },
            ].map(sl => (
              <div key={sl.key}>
                <div style={sliderLabel}>
                  <span>{sl.label}</span>
                  <span style={{ color: "var(--text)", fontFamily: "monospace", fontWeight: 700 }}>
                    {params[sl.key as keyof PulseParams]} {sl.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={sl.min} max={sl.max} step={sl.step}
                  value={params[sl.key as keyof PulseParams] as number}
                  onChange={e => set(sl.key as keyof PulseParams)(+e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
            ))}

            {params.shape === "drag" && (
              <div>
                <div style={sliderLabel}>
                  <span>DRAG β</span>
                  <span style={{ color: "var(--text)", fontFamily: "monospace", fontWeight: 700 }}>
                    {params.dragBeta.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range" min={-2} max={2} step={0.05}
                  value={params.dragBeta}
                  onChange={e => set("dragBeta")(+e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Plots ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Gate result */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem" }}>
            {[
              { label: "Final ⟨Z⟩",  value: finalState.z.toFixed(3),  sub: "population" },
              { label: "Final ⟨X⟩",  value: finalState.x.toFixed(3),  sub: "coherence" },
              { label: "Rotation",   value: `${rotation.toFixed(1)}°`, sub: isXGate ? "≈ X gate ✓" : isId ? "≈ Identity" : "partial" },
            ].map(c => (
              <div key={c.label} style={{ background: "var(--bg-surface)", border: "1.5px solid var(--border-soft)", borderRadius: "10px", padding: "0.75rem 0.9rem" }}>
                <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "0.2rem" }}>{c.label}</div>
                <div style={{ fontFamily: "monospace", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>{c.value}</div>
                <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.65rem", color: "var(--text-muted)" }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Pulse envelope plot */}
          <div style={{ background: "var(--bg-surface)", border: "1.5px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ padding: "0.75rem 1rem 0.5rem", borderBottom: "1.5px solid var(--border-soft)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-muted)" }}>
                Pulse envelope
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "system-ui,sans-serif", fontSize: "0.65rem", color: "var(--text-muted)" }}>
                  <div style={{ width: 20, height: 2, background: "#e87a5a", borderRadius: 1 }} /> I (in-phase)
                </div>
                {params.shape === "drag" && (
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "system-ui,sans-serif", fontSize: "0.65rem", color: "var(--text-muted)" }}>
                    <div style={{ width: 20, height: 2, background: "#7b7fa8", borderRadius: 1, borderTop: "2px dashed #7b7fa8" }} /> Q (quadrature)
                  </div>
                )}
              </div>
            </div>
            <div style={{ padding: "0.5rem" }}>
              <canvas ref={pulseCanvasRef} style={{ width: "100%", display: "block" }} />
            </div>
          </div>

          {/* Bloch projections plot */}
          <div style={{ background: "var(--bg-surface)", border: "1.5px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ padding: "0.75rem 1rem 0.5rem", borderBottom: "1.5px solid var(--border-soft)" }}>
              <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-muted)" }}>
                Bloch vector components during pulse
              </div>
            </div>
            <div style={{ padding: "0.5rem" }}>
              <canvas ref={blochCanvasRef} style={{ width: "100%", display: "block" }} />
            </div>
          </div>

          {/* Physics note */}
          <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--accent-dark)", borderLeft: "3px solid var(--border)", borderRadius: "0 10px 10px 0", padding: "0.9rem 1rem", fontFamily: "Georgia,serif", fontSize: "0.82rem", color: "var(--text-body)", lineHeight: 1.65 }}>
            {params.shape === "drag"
              ? `DRAG (Derivative Removal via Adiabatic Gate) adds a Q-quadrature component proportional to the time derivative of the I envelope. This suppresses leakage to the |2⟩ level in transmons — critical since E₁₂ ≠ E₀₁ by anharmonicity α = –E_C. β ≈ 1/(2α).`
              : params.frequency !== 0
              ? `Detuning Δ = ${params.frequency} MHz means the drive is off-resonance. The effective Rabi frequency becomes Ω_eff = √(Ω₀² + Δ²) and the rotation axis tilts out of the equatorial plane — the qubit never fully inverts.`
              : `On-resonance Gaussian pulse. The Bloch vector rotates in the ${params.axis === "X" ? "Y–Z" : "X–Z"} plane. Total rotation angle θ = ∫Ω(t)dt. For a π-pulse (X gate), tune amplitude or duration until ⟨Z⟩ → –1.`
            }
          </div>
        </div>
      </div>

      {/* Reference table */}
      <div style={{ marginTop: "1.75rem" }}>
        <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text)", marginBottom: "0.75rem", paddingBottom: "0.4rem", borderBottom: "1.5px solid var(--border-soft)" }}>
          Pulse shape reference
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "0.6rem" }}>
          {[
            { shape: "Gaussian",  pro: "Low spectral leakage",          con: "Slower than square",          use: "General qubit rotations" },
            { shape: "DRAG",      pro: "Suppresses |2⟩ leakage",        con: "Requires β calibration",      use: "High-fidelity transmon gates" },
            { shape: "Square",    pro: "Fastest, simplest",             con: "Broadband — drives off-res",  use: "Rough calibration, resonator drives" },
            { shape: "Cosine",    pro: "Good sidelobe suppression",     con: "Slightly longer than Gaussian", use: "When neighbours are close in freq" },
          ].map(r => (
            <div key={r.shape} style={{ background: "var(--bg-surface)", border: "1.5px solid var(--border-soft)", borderRadius: "10px", padding: "0.85rem 1rem" }}>
              <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.4rem" }}>{r.shape}</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: "0.75rem", color: "var(--text-body)", lineHeight: 1.55 }}>
                <span style={{ color: "#5a8a5a", fontWeight: 700 }}>✓ </span>{r.pro}<br />
                <span style={{ color: "#a05a4a", fontWeight: 700 }}>✗ </span>{r.con}<br />
                <span style={{ color: "var(--text-muted)" }}>Use: </span>{r.use}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}