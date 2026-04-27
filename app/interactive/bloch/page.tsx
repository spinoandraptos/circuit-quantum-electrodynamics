"use client";
import { useEffect, useRef, useState, useCallback } from "react";

type Gate = "X" | "Y" | "Z" | "H" | "S" | "T" | "S†" | "T†";
type DecayMode = "none" | "t1" | "t2";

interface StateVec { theta: number; phi: number }

const GATES: { label: Gate; desc: string; color: string }[] = [
  { label: "X",  desc: "π rotation around X",       color: "#e87a5a" },
  { label: "Y",  desc: "π rotation around Y",       color: "#e87a5a" },
  { label: "Z",  desc: "π rotation around Z",       color: "#e87a5a" },
  { label: "H",  desc: "Hadamard — |0⟩ → |+⟩",     color: "#7b7fa8" },
  { label: "S",  desc: "π/2 phase gate",            color: "#7b7fa8" },
  { label: "T",  desc: "π/4 phase gate",            color: "#7b7fa8" },
  { label: "S†", desc: "S dagger (–π/2 phase)",     color: "#7b7fa8" },
  { label: "T†", desc: "T dagger (–π/4 phase)",     color: "#7b7fa8" },
];

function applyGate(gate: Gate, theta: number, phi: number): StateVec {
  const sinT = Math.sin(theta), cosT = Math.cos(theta);
  const sinP = Math.sin(phi),   cosP = Math.cos(phi);
  const x = sinT * cosP, y = sinT * sinP, z = cosT;

  let nx = x, ny = y, nz = z;
  switch (gate) {
    case "X": nx =  x; ny = -y; nz = -z; break;
    case "Y": nx = -x; ny =  y; nz = -z; break;
    case "Z": nx = -x; ny = -y; nz =  z; break;
    case "H": nx =  z; ny =  y; nz =  x; break;
    case "S":  { const c=0,s=1; nx=c*x-s*y; ny=s*x+c*y; nz=z; break; }
    case "S†": { const c=0,s=-1; nx=c*x-s*y; ny=s*x+c*y; nz=z; break; }
    case "T":  { const a=Math.PI/4; nx=Math.cos(a)*x-Math.sin(a)*y; ny=Math.sin(a)*x+Math.cos(a)*y; nz=z; break; }
    case "T†": { const a=-Math.PI/4; nx=Math.cos(a)*x-Math.sin(a)*y; ny=Math.sin(a)*x+Math.cos(a)*y; nz=z; break; }
  }
  const r = Math.sqrt(nx*nx+ny*ny+nz*nz) || 1;
  nx/=r; ny/=r; nz/=r;
  return {
    theta: Math.acos(Math.max(-1, Math.min(1, nz))),
    phi: Math.atan2(ny, nx),
  };
}

function stateLabel(theta: number, phi: number): string {
  const eps = 0.05;
  if (theta < eps) return "|0⟩";
  if (Math.abs(theta - Math.PI) < eps) return "|1⟩";
  const onEquator = Math.abs(theta - Math.PI/2) < eps;
  if (onEquator) {
    if (Math.abs(phi) < eps || Math.abs(Math.abs(phi)-2*Math.PI) < eps) return "|+⟩";
    if (Math.abs(Math.abs(phi)-Math.PI) < eps) return "|−⟩";
    if (Math.abs(phi - Math.PI/2) < eps) return "|+i⟩";
    if (Math.abs(phi + Math.PI/2) < eps) return "|−i⟩";
  }
  const t = (theta / Math.PI * 180).toFixed(1);
  const p = (phi / Math.PI * 180).toFixed(1);
  return `θ=${t}° φ=${p}°`;
}

export default function BlochSpherePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeRef = useRef<any>(null);
  const [state, setState] = useState<StateVec>({ theta: 0, phi: 0 });
  const [history, setHistory] = useState<{ gate: Gate; state: StateVec }[]>([]);
  const [decayMode, setDecayMode] = useState<DecayMode>("none");
  const [t1, setT1] = useState(50);
  const [t2, setT2] = useState(30);
  const [lastGateDesc, setLastGateDesc] = useState<string>("");
  const dragRef = useRef({ dragging: false, lastX: 0, lastY: 0 });
  const rotRef = useRef({ x: 0.35, y: 0.6 });
  const camDistRef = useRef(5.5);
  const stateRef = useRef(state);
  stateRef.current = state;

  const rebuildVector = useCallback((THREE: any, scene: any, objects: any, s: StateVec) => {
    ["arrow", "arrowHead", "stateDot"].forEach(k => {
      if (objects[k]) { scene.remove(objects[k]); objects[k] = null; }
    });
    const sinT = Math.sin(s.theta), cosT = Math.cos(s.theta);
    const sinP = Math.sin(s.phi),   cosP = Math.cos(s.phi);
    const tip = new THREE.Vector3(sinT*cosP, cosT, sinT*sinP);

    const dir = tip.clone().normalize();
    const origin = new THREE.Vector3(0,0,0);
    const len = tip.length() * 0.88;
    const arrowGeo = new THREE.CylinderGeometry(0.025, 0.025, len, 12);
    const arrowMat = new THREE.MeshPhongMaterial({ color: 0xe87a5a });
    const arrow = new THREE.Mesh(arrowGeo, arrowMat);
    const mid = dir.clone().multiplyScalar(len/2);
    arrow.position.copy(mid);
    arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir);
    scene.add(arrow);
    objects.arrow = arrow;

    const headGeo = new THREE.ConeGeometry(0.07, 0.18, 12);
    const headMat = new THREE.MeshPhongMaterial({ color: 0xe87a5a });
    const head = new THREE.Mesh(headGeo, headMat);
    const tipPos = dir.clone().multiplyScalar(len + 0.09);
    head.position.copy(tipPos);
    head.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir);
    scene.add(head);
    objects.arrowHead = head;

    const dotGeo = new THREE.SphereGeometry(0.065, 12, 12);
    const dotMat = new THREE.MeshPhongMaterial({ color: 0xf5e6a3 });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.copy(tip);
    scene.add(dot);
    objects.stateDot = dot;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let animId: number;
    const objects: any = {};

    const init = async () => {
      const THREE = await import("three");
      const W = canvas.parentElement!.offsetWidth;
      const H = Math.min(W * 0.75, 420);
      canvas.style.height = H + "px";

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, W/H, 0.1, 100);

      scene.add(new THREE.AmbientLight(0xffffff, 0.75));
      const dir = new THREE.DirectionalLight(0xffffff, 0.8);
      dir.position.set(4, 6, 4);
      scene.add(dir);
      const fill = new THREE.DirectionalLight(0xadd8ff, 0.25);
      fill.position.set(-3, 1, -2);
      scene.add(fill);

      // Sphere (wireframe)
      const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
      const sphereMat = new THREE.MeshPhongMaterial({
        color: 0x6ea4c8, transparent: true, opacity: 0.08, wireframe: false,
      });
      scene.add(new THREE.Mesh(sphereGeo, sphereMat));

      const wireGeo = new THREE.SphereGeometry(1, 18, 18);
      const wireMat = new THREE.MeshBasicMaterial({ color: 0x2d2a24, wireframe: true, transparent: true, opacity: 0.08 });
      scene.add(new THREE.Mesh(wireGeo, wireMat));

      // Axes
      const axisLine = (from: number[], to: number[], color: number, dashed=false) => {
        const pts = [new THREE.Vector3(...from as [number,number,number]), new THREE.Vector3(...to as [number,number,number])];
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: dashed ? 0.3 : 0.6 });
        return new THREE.Line(geo, mat);
      };
      scene.add(axisLine([0,-1.5,0],[0,1.5,0], 0x2d2a24));
      scene.add(axisLine([-1.5,0,0],[1.5,0,0], 0x2d2a24));
      scene.add(axisLine([0,0,-1.5],[0,0,1.5], 0x2d2a24));

      // Equator circle
      const eqPts: any[] = [];
      for (let i=0; i<=64; i++) {
        const a = (i/64)*Math.PI*2;
        eqPts.push(new THREE.Vector3(Math.cos(a), 0, Math.sin(a)));
      }
      const eqGeo = new THREE.BufferGeometry().setFromPoints(eqPts);
      scene.add(new THREE.Line(eqGeo, new THREE.LineBasicMaterial({ color: 0x2d2a24, transparent: true, opacity: 0.2 })));

      // Axis labels (floating sprites)
      const makeLabel = (text: string, pos: [number,number,number], color=0x2d2a24) => {
        const c2 = document.createElement("canvas");
        c2.width=128; c2.height=64;
        const ctx2 = c2.getContext("2d")!;
        ctx2.fillStyle = `#${color.toString(16).padStart(6,"0")}`;
        ctx2.font = "bold 36px system-ui, sans-serif";
        ctx2.textAlign = "center";
        ctx2.textBaseline = "middle";
        ctx2.fillText(text, 64, 32);
        const tex = new THREE.CanvasTexture(c2);
        const mat2 = new THREE.SpriteMaterial({ map: tex, transparent: true });
        const sprite = new THREE.Sprite(mat2);
        sprite.position.set(...pos);
        sprite.scale.set(0.4, 0.2, 1);
        scene.add(sprite);
      };
      makeLabel("|0⟩",  [0, 1.22, 0]);
      makeLabel("|1⟩",  [0,-1.22, 0]);
      makeLabel("|+⟩",  [1.28, 0, 0]);
      makeLabel("|+i⟩", [0, 0, 1.28]);

      // State vector
      threeRef.current = { renderer, scene, camera, objects, THREE };
      rebuildVector(THREE, scene, objects, stateRef.current);

      const animate = () => {
        animId = requestAnimationFrame(animate);
        const { x, y } = rotRef.current;
        const dist = camDistRef.current;
        camera.position.set(
          Math.sin(y)*dist*Math.cos(x),
          Math.sin(x)*dist + 0.3,
          Math.cos(y)*dist*Math.cos(x),
        );
        camera.lookAt(0, 0.3, 0);
        renderer.render(scene, camera);
      };
      animate();
    };
    init();
    return () => cancelAnimationFrame(animId);
  }, [rebuildVector]);

  useEffect(() => {
    const ctx = threeRef.current;
    if (!ctx) return;
    rebuildVector(ctx.THREE, ctx.scene, ctx.objects, state);
  }, [state, rebuildVector]);

  const applyGateAction = (gate: Gate) => {
    const desc = GATES.find(g => g.label === gate)?.desc ?? "";
    setState(prev => {
      const next = applyGate(gate, prev.theta, prev.phi);
      setHistory(h => [...h.slice(-11), { gate, state: next }]);
      return next;
    });
    setLastGateDesc(desc);
  };

  const reset = () => {
    setState({ theta: 0, phi: 0 });
    setHistory([]);
    setLastGateDesc("");
  };

  const onMouseDown = (e: React.MouseEvent) => { dragRef.current = { dragging: true, lastX: e.clientX, lastY: e.clientY }; };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current.dragging) return;
    rotRef.current.y += (e.clientX - dragRef.current.lastX) * 0.008;
    rotRef.current.x += (e.clientY - dragRef.current.lastY) * 0.006;
    rotRef.current.x = Math.max(-1.2, Math.min(1.2, rotRef.current.x));
    dragRef.current.lastX = e.clientX; dragRef.current.lastY = e.clientY;
  };
  const onMouseUp = () => { dragRef.current.dragging = false; };
  const onWheel = (e: React.WheelEvent) => { camDistRef.current = Math.max(3, Math.min(10, camDistRef.current + e.deltaY * 0.008)); };

  const label = stateLabel(state.theta, state.phi);
  const x = (Math.sin(state.theta)*Math.cos(state.phi)).toFixed(3);
  const y2 = (Math.sin(state.theta)*Math.sin(state.phi)).toFixed(3);
  const z = (Math.cos(state.theta)).toFixed(3);

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ fontFamily:"system-ui,sans-serif", fontSize:"0.7rem", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--text-muted)", marginBottom:"1rem" }}>
        Circuit QED › Interactive › <span style={{ color:"var(--text)" }}>Bloch Sphere</span>
      </div>

      <div style={{ marginBottom:"0.5rem" }}>
        <span className="tag">3D Interactive</span>
        <span className="tag">Single-qubit gates</span>
      </div>

      <h1 style={{ fontFamily:"system-ui,sans-serif", fontSize:"2.2rem", fontWeight:900, color:"var(--text)", letterSpacing:"-0.03em", lineHeight:1, marginBottom:"0.5rem" }}>
        Bloch Sphere
      </h1>
      <p style={{ fontFamily:"Georgia,serif", fontSize:"0.95rem", color:"var(--text-body)", lineHeight:1.7, marginBottom:"2rem", maxWidth:"560px" }}>
        Every pure single-qubit state lives on the surface of the Bloch sphere. Apply gates to rotate the state vector and watch the geometry of quantum operations.
      </p>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:"1.25rem", alignItems:"start" }}>

        {/* 3D canvas */}
        <div style={{ background:"var(--bg-surface)", border:"1.5px solid var(--border)", borderRadius:"14px", overflow:"hidden" }}>
          <canvas
            ref={canvasRef}
            style={{ width:"100%", display:"block", cursor:"grab" }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onWheel={onWheel}
          />
          {/* State readout bar */}
          <div style={{ borderTop:"1.5px solid var(--border-soft)", padding:"0.75rem 1rem", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"1rem", flexWrap:"wrap" }}>
            <div style={{ fontFamily:"system-ui,sans-serif" }}>
              <div style={{ fontSize:"0.65rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.14em", color:"var(--text-muted)", marginBottom:"0.15rem" }}>Current state</div>
              <div style={{ fontSize:"1.1rem", fontWeight:900, color:"var(--text)", fontFamily:"Georgia,serif" }}>{label}</div>
            </div>
            <div style={{ display:"flex", gap:"1.25rem" }}>
              {[["x",x],["y",y2],["z",z]].map(([ax,val]) => (
                <div key={ax} style={{ fontFamily:"system-ui,sans-serif", textAlign:"center" }}>
                  <div style={{ fontSize:"0.6rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text-muted)" }}>{ax}</div>
                  <div style={{ fontSize:"0.85rem", fontWeight:700, color:"var(--text)", fontFamily:"monospace" }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ fontFamily:"system-ui,sans-serif", fontSize:"0.72rem", color:"var(--text-muted)" }}>
              {lastGateDesc || "Drag to orbit · Scroll to zoom"}
            </div>
          </div>
        </div>

        {/* Controls panel */}
        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>

          {/* Gates */}
          <div style={{ background:"var(--bg-surface)", border:"1.5px solid var(--border)", borderRadius:"12px", padding:"1rem" }}>
            <div style={{ fontFamily:"system-ui,sans-serif", fontSize:"0.65rem", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.14em", color:"var(--text-muted)", marginBottom:"0.75rem" }}>
              Apply gate
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem", marginBottom:"0.75rem" }}>
              {GATES.map(g => (
                <button
                  key={g.label}
                  onClick={() => applyGateAction(g.label)}
                  style={{
                    padding:"0.55rem 0",
                    fontFamily:"system-ui,sans-serif",
                    fontSize:"0.9rem",
                    fontWeight:800,
                    color:"var(--text)",
                    background:"var(--bg)",
                    border:"1.5px solid var(--border-soft)",
                    borderRadius:"8px",
                    cursor:"pointer",
                    boxShadow:"var(--shadow)",
                    transition:"all 0.1s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "var(--accent)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-dark)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "var(--bg)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-soft)";
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <button
              onClick={reset}
              style={{ width:"100%", padding:"0.45rem", fontFamily:"system-ui,sans-serif", fontSize:"0.72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--text-muted)", background:"transparent", border:"1.5px solid var(--border-soft)", borderRadius:"8px", cursor:"pointer" }}
            >
              Reset to |0⟩
            </button>
          </div>

          {/* Prepare named states */}
          <div style={{ background:"var(--bg-surface)", border:"1.5px solid var(--border)", borderRadius:"12px", padding:"1rem" }}>
            <div style={{ fontFamily:"system-ui,sans-serif", fontSize:"0.65rem", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.14em", color:"var(--text-muted)", marginBottom:"0.75rem" }}>
              Prepare state
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
              {[
                { label:"|0⟩",  theta:0,            phi:0 },
                { label:"|1⟩",  theta:Math.PI,      phi:0 },
                { label:"|+⟩",  theta:Math.PI/2,    phi:0 },
                { label:"|−⟩",  theta:Math.PI/2,    phi:Math.PI },
                { label:"|+i⟩", theta:Math.PI/2,    phi:Math.PI/2 },
                { label:"|−i⟩", theta:Math.PI/2,    phi:-Math.PI/2 },
              ].map(s => (
                <button
                  key={s.label}
                  onClick={() => { setState({ theta:s.theta, phi:s.phi }); setHistory([]); setLastGateDesc(`Prepared ${s.label}`); }}
                  style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0.4rem 0.65rem", fontFamily:"Georgia,serif", fontSize:"0.82rem", color:"var(--text)", background:"var(--bg)", border:"1.5px solid var(--border-soft)", borderRadius:"7px", cursor:"pointer" }}
                >
                  <span style={{ fontWeight:700 }}>{s.label}</span>
                  <span style={{ fontFamily:"system-ui,sans-serif", fontSize:"0.65rem", color:"var(--text-muted)" }}>
                    θ={(s.theta/Math.PI*180).toFixed(0)}° φ={(s.phi/Math.PI*180).toFixed(0)}°
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Gate history */}
          {history.length > 0 && (
            <div style={{ background:"var(--bg-surface)", border:"1.5px solid var(--border)", borderRadius:"12px", padding:"1rem" }}>
              <div style={{ fontFamily:"system-ui,sans-serif", fontSize:"0.65rem", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.14em", color:"var(--text-muted)", marginBottom:"0.6rem" }}>
                Gate sequence
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"0.35rem" }}>
                {history.map((h, i) => (
                  <span
                    key={i}
                    style={{ fontFamily:"Georgia,serif", fontSize:"0.82rem", fontWeight:700, padding:"0.15rem 0.5rem", background: i===history.length-1 ? "var(--accent)" : "var(--bg)", border:`1.5px solid ${i===history.length-1 ? "var(--accent-dark)" : "var(--border-soft)"}`, borderRadius:"6px", color:"var(--text)" }}
                  >
                    {h.gate}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Decay panel */}
      <div style={{ marginTop:"1.25rem", background:"var(--bg-surface)", border:"1.5px solid var(--border)", borderRadius:"12px", padding:"1.25rem" }}>
        <div style={{ fontFamily:"system-ui,sans-serif", fontSize:"0.65rem", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.14em", color:"var(--text-muted)", marginBottom:"0.85rem" }}>
          Decoherence — conceptual reference
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.75rem", marginBottom:"1rem" }}>
          {(["none","t1","t2"] as DecayMode[]).map(m => (
            <button
              key={m}
              onClick={() => setDecayMode(m)}
              style={{ padding:"0.5rem", fontFamily:"system-ui,sans-serif", fontSize:"0.75rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color: m===decayMode ? "var(--text)" : "var(--text-muted)", background: m===decayMode ? "var(--accent)" : "var(--bg)", border:`1.5px solid ${m===decayMode ? "var(--accent-dark)" : "var(--border-soft)"}`, borderRadius:"8px", cursor:"pointer", boxShadow: m===decayMode ? "var(--shadow)" : "none" }}
            >
              {m==="none" ? "No decay" : m==="t1" ? "T₁ decay" : "T₂ dephasing"}
            </button>
          ))}
        </div>
        {decayMode !== "none" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1rem" }}>
            {decayMode === "t1" && (
              <div>
                <div style={{ fontFamily:"system-ui,sans-serif", fontSize:"0.7rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text-muted)", marginBottom:"0.35rem" }}>T₁ = {t1} µs</div>
                <input type="range" min={5} max={500} value={t1} onChange={e => setT1(+e.target.value)} style={{ width:"100%" }} />
              </div>
            )}
            {decayMode === "t2" && (
              <div>
                <div style={{ fontFamily:"system-ui,sans-serif", fontSize:"0.7rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text-muted)", marginBottom:"0.35rem" }}>T₂ = {t2} µs</div>
                <input type="range" min={1} max={200} value={t2} onChange={e => setT2(+e.target.value)} style={{ width:"100%" }} />
              </div>
            )}
          </div>
        )}
        <div style={{ fontFamily:"Georgia,serif", fontSize:"0.82rem", color:"var(--text-body)", lineHeight:1.65 }}>
          {decayMode === "none" && "Select a decay channel to see how decoherence constrains the Bloch vector. T₁ drives the state toward |1⟩ (energy relaxation); T₂ dephases the equatorial components without changing the z-component."}
          {decayMode === "t1" && `T₁ = ${t1} µs — energy relaxation. The qubit decays from |1⟩ → |0⟩ exponentially. The Bloch vector spirals inward toward the north pole. Rate γ₁ = 1/T₁ = ${(1/t1*1000).toFixed(2)} kHz.`}
          {decayMode === "t2" && `T₂ = ${t2} µs — dephasing. Random phase kicks destroy the off-diagonal coherences ρ₀₁. The equatorial component of the Bloch vector decays while the z-component is unaffected. 1/T₂ = 1/2T₁ + 1/Tφ.`}
        </div>
      </div>

      {/* Reference table */}
      <div style={{ marginTop:"1.5rem" }}>
        <div style={{ fontFamily:"system-ui,sans-serif", fontSize:"0.7rem", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.14em", color:"var(--text)", marginBottom:"0.75rem", paddingBottom:"0.4rem", borderBottom:"1.5px solid var(--border-soft)", display:"flex", alignItems:"center", gap:"0.6rem" }}>
          Gate reference
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"0.5rem" }}>
          {GATES.map(g => (
            <div
              key={g.label}
              style={{ display:"flex", alignItems:"center", gap:"0.75rem", padding:"0.6rem 0.85rem", background:"var(--bg-surface)", border:"1.5px solid var(--border-soft)", borderRadius:"8px", cursor:"pointer" }}
              onClick={() => applyGateAction(g.label)}
            >
              <span style={{ fontFamily:"Georgia,serif", fontSize:"1rem", fontWeight:700, color:"var(--text)", minWidth:"2rem" }}>{g.label}</span>
              <span style={{ fontFamily:"Georgia,serif", fontSize:"0.78rem", color:"var(--text-body)" }}>{g.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}