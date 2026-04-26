"use client";
import { useState } from "react";

const inputStyle = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  fontFamily: "system-ui, sans-serif",
  fontSize: "0.875rem",
  color: "var(--text)",
  background: "var(--bg)",
  border: "1.5px solid var(--border)",
  borderRadius: "8px",
  outline: "none",
  boxShadow: "inset 1px 1px 0 rgba(0,0,0,0.04)",
};

const resultStyle = {
  background: "var(--text)",
  color: "var(--accent)",
  fontFamily: "monospace",
  fontSize: "1.1rem",
  fontWeight: 700,
  padding: "0.75rem 1rem",
  borderRadius: "10px",
  marginTop: "1rem",
  letterSpacing: "0.02em",
};

const cardStyle = {
  background: "var(--bg-surface)",
  border: "1.5px solid var(--border)",
  borderRadius: "12px",
  padding: "1.5rem",
  boxShadow: "var(--shadow)",
  marginBottom: "1.5rem",
};

const labelStyle = {
  fontFamily: "system-ui, sans-serif",
  fontSize: "0.7rem",
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  color: "var(--text-muted)",
  display: "block",
  marginBottom: "0.35rem",
};

const h2Style = {
  fontFamily: "system-ui, sans-serif",
  fontSize: "0.75rem",
  fontWeight: 800,
  textTransform: "uppercase" as const,
  letterSpacing: "0.14em",
  color: "var(--text)",
  marginBottom: "0.4rem",
  paddingBottom: "0.4rem",
  borderBottom: "1.5px solid var(--border-soft)",
};

const descStyle = {
  fontFamily: "Georgia, serif",
  fontSize: "0.85rem",
  color: "var(--text-body)",
  lineHeight: 1.65,
  marginBottom: "1.25rem",
};

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0.75rem",
  marginBottom: "0.75rem",
};

// ── Calculator 1: Dispersive Shift ──────────────────────────────
function DispersiveShift() {
  const [g, setG] = useState("100");
  const [delta, setDelta] = useState("1000");

  const gVal = parseFloat(g);
  const dVal = parseFloat(delta);
  const chi = isNaN(gVal) || isNaN(dVal) || dVal === 0
    ? null
    : (gVal * gVal) / dVal;

  return (
    <div style={cardStyle}>
      <div style={h2Style}>Dispersive Shift χ</div>
      <p style={descStyle}>
        In the dispersive regime, the qubit–resonator detuning Δ ≫ g gives a
        frequency shift χ = g²/Δ. Enter g and Δ in MHz.
      </p>
      <div style={rowStyle}>
        <div>
          <label style={labelStyle}>Coupling g (MHz)</label>
          <input style={inputStyle} type="number" value={g} onChange={e => setG(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Detuning Δ (MHz)</label>
          <input style={inputStyle} type="number" value={delta} onChange={e => setDelta(e.target.value)} />
        </div>
      </div>
      <div style={resultStyle}>
        χ = {chi !== null ? `${chi.toFixed(3)} MHz` : "—"}
      </div>
      {chi !== null && dVal !== 0 && (
        <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.6rem" }}>
          g/Δ = {(gVal / dVal).toFixed(4)} {Math.abs(gVal / dVal) < 0.1 ? "✓ dispersive regime valid" : "⚠ approaching strong coupling — dispersive approx. may break down"}
        </div>
      )}
    </div>
  );
}

// ── Calculator 2: Transmon Frequency ────────────────────────────
function TransmonFrequency() {
  const [ej, setEj] = useState("20");
  const [ec, setEc] = useState("0.2");

  const ejVal = parseFloat(ej);
  const ecVal = parseFloat(ec);
  const wq = isNaN(ejVal) || isNaN(ecVal) || ejVal <= 0 || ecVal <= 0
    ? null
    : Math.sqrt(8 * ejVal * ecVal) - ecVal;
  const alpha = isNaN(ecVal) ? null : -ecVal;
  const ratio = isNaN(ejVal) || isNaN(ecVal) || ecVal === 0 ? null : ejVal / ecVal;

  return (
    <div style={cardStyle}>
      <div style={h2Style}>Transmon Frequency ω_q</div>
      <p style={descStyle}>
        The transmon qubit frequency from circuit quantisation: ω_q ≈ √(8E_J E_C) − E_C.
        Anharmonicity α ≈ −E_C. Enter energies in GHz.
      </p>
      <div style={rowStyle}>
        <div>
          <label style={labelStyle}>E_J (GHz)</label>
          <input style={inputStyle} type="number" value={ej} onChange={e => setEj(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>E_C (GHz)</label>
          <input style={inputStyle} type="number" value={ec} onChange={e => setEc(e.target.value)} />
        </div>
      </div>
      <div style={resultStyle}>
        ω_q = {wq !== null ? `${wq.toFixed(4)} GHz` : "—"}
      </div>
      {alpha !== null && wq !== null && (
        <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.6rem", display: "flex", gap: "1.5rem" }}>
          <span>α ≈ {alpha.toFixed(3)} GHz</span>
          {ratio !== null && <span>E_J/E_C = {ratio.toFixed(1)} {ratio >= 50 ? "✓ transmon regime" : "⚠ below transmon regime (need ≥ 50)"}</span>}
        </div>
      )}
    </div>
  );
}

// ── Calculator 3: Purcell Rate ───────────────────────────────────
function PurcellRate() {
  const [g, setG] = useState("100");
  const [delta, setDelta] = useState("1000");
  const [kappa, setKappa] = useState("10");

  const gVal = parseFloat(g);
  const dVal = parseFloat(delta);
  const kVal = parseFloat(kappa);
  const gamma = isNaN(gVal) || isNaN(dVal) || isNaN(kVal) || dVal === 0
    ? null
    : (gVal * gVal * kVal) / (dVal * dVal + (kVal / 2) * (kVal / 2));

  return (
    <div style={cardStyle}>
      <div style={h2Style}>Purcell Decay Rate γ_P</div>
      <p style={descStyle}>
        The Purcell effect gives the qubit an additional decay channel through the
        resonator: γ_P = g²κ / (Δ² + (κ/2)²). Enter all values in MHz.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
        <div>
          <label style={labelStyle}>Coupling g (MHz)</label>
          <input style={inputStyle} type="number" value={g} onChange={e => setG(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Detuning Δ (MHz)</label>
          <input style={inputStyle} type="number" value={delta} onChange={e => setDelta(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Decay κ (MHz)</label>
          <input style={inputStyle} type="number" value={kappa} onChange={e => setKappa(e.target.value)} />
        </div>
      </div>
      <div style={resultStyle}>
        γ_P = {gamma !== null ? `${gamma.toFixed(4)} MHz` : "—"}
      </div>
      {gamma !== null && (
        <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.6rem" }}>
          T_1 (Purcell) ≈ {(1 / gamma).toFixed(2)} μs
        </div>
      )}
    </div>
  );
}

// ── Calculator 4: Critical Photon Number ────────────────────────
function CriticalPhoton() {
  const [g, setG] = useState("100");
  const [delta, setDelta] = useState("1000");

  const gVal = parseFloat(g);
  const dVal = parseFloat(delta);
  const ncrit = isNaN(gVal) || isNaN(dVal) || gVal === 0
    ? null
    : (dVal * dVal) / (4 * gVal * gVal);

  return (
    <div style={cardStyle}>
      <div style={h2Style}>Critical Photon Number n_crit</div>
      <p style={descStyle}>
        Above n_crit = Δ²/4g² photons, the system leaves the dispersive regime and
        the qubit becomes strongly dressed again. Enter g and Δ in MHz.
      </p>
      <div style={rowStyle}>
        <div>
          <label style={labelStyle}>Coupling g (MHz)</label>
          <input style={inputStyle} type="number" value={g} onChange={e => setG(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Detuning Δ (MHz)</label>
          <input style={inputStyle} type="number" value={delta} onChange={e => setDelta(e.target.value)} />
        </div>
      </div>
      <div style={resultStyle}>
        n_crit = {ncrit !== null ? ncrit.toFixed(2) : "—"}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────
export default function ToolsPage() {
  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem" }}>
        Circuit QED › <span style={{ color: "var(--text)" }}>Tools</span>
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <span className="tag">Interactive</span>
      </div>

      <h1 style={{ fontFamily: "system-ui, sans-serif", fontSize: "2.2rem", fontWeight: 900, color: "var(--text)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "0.6rem" }}>
        cQED Calculators
      </h1>
      <p style={{ fontFamily: "Georgia, serif", fontSize: "0.95rem", color: "var(--text-body)", lineHeight: 1.7, marginBottom: "2.5rem", maxWidth: "560px" }}>
        Quick numerical tools for common circuit QED quantities. All formulas
        are derived from first principles on this site.
      </p>

      <DispersiveShift />
      <TransmonFrequency />
      <PurcellRate />
      <CriticalPhoton />
    </div>
  );
}