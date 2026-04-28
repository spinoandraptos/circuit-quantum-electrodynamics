"use client";
import { useEffect, useRef, useState, useCallback } from "react";

interface Stage {
  name: string;
  temp: string;
  tempK: number;
  color: number;
  ringColor: string;
  y: number;
  radius: number;
  thickness: number;
  desc: string;
  components: string[];
  physics: string;
}

const STAGES: Stage[] = [
  {
    name: "Room temperature",
    temp: "300 K",
    tempK: 300,
    color: 0xc8614a,
    ringColor: "#c8614a",
    y: 2.8,
    radius: 2.0,
    thickness: 0.06,
    desc: "Electronics, control hardware, and microwave sources live here. Room-temp coax cables bring signals in; the fridge's outer vacuum can is at atmospheric pressure.",
    components: ["AWG / signal generators", "TWPA pump sources", "DC bias electronics", "Computer & FPGA"],
    physics: "Classical electronics. No quantum coherence possible at 300 K — kT ≈ 26 meV ≫ qubit energy spacing ~20–100 µeV.",
  },
  {
    name: "4 K plate",
    temp: "4.2 K",
    tempK: 4.2,
    color: 0xd4884a,
    ringColor: "#d4884a",
    y: 1.8,
    radius: 1.75,
    thickness: 0.06,
    desc: "Cooled by a pulse-tube refrigerator (PTR) — no liquid helium needed in modern systems. HEMT amplifiers live here because they generate too much heat for lower stages.",
    components: ["HEMT amplifier", "Pulse-tube cold head", "SMA connectors", "Copper powder filters"],
    physics: "kT ≈ 360 µeV. Josephson junctions and resonators are still far above their coherence threshold, but HEMTs operate here with ~3 K noise temperature.",
  },
  {
    name: "Still plate",
    temp: "700 mK",
    tempK: 0.7,
    color: 0xc8a84a,
    ringColor: "#c8a84a",
    y: 0.7,
    radius: 1.45,
    thickness: 0.055,
    desc: "The still is where ³He evaporates in the dilution process. A heater drives evaporation to maintain circulation. Attenuation and filtering of signal lines continues here.",
    components: ["Still heater", "Coax attenuators (−3 dB)", "Infrared filters", "Wiring looms"],
    physics: "The still sets the circulation rate: Q̇_still = ṅ₃ · L₃. Typical ṅ₃ ~ 400 µmol/s for a 400 µW fridge.",
  },
  {
    name: "Cold plate (4 K stage)",
    temp: "100 mK",
    tempK: 0.1,
    color: 0x8ac8a8,
    ringColor: "#8ac8a8",
    y: -0.3,
    radius: 1.2,
    thickness: 0.05,
    desc: "Intermediate cooling stage. Signal lines pick up heavy attenuation (−20 to −30 dB) to prevent room-temperature Johnson noise from reaching the qubit.",
    components: ["−20 dB attenuators", "Eccosorb microwave absorbers", "Stainless coax sections", "Anchoring clamps"],
    physics: "Johnson noise power P = kTB. At 100 mK and 1 GHz bandwidth, P ≈ 10⁻²⁴ W — attenuating here prevents the qubit from absorbing room-temp photons.",
  },
  {
    name: "Mixing chamber",
    temp: "10–20 mK",
    tempK: 0.015,
    color: 0x6ea4c8,
    ringColor: "#6ea4c8",
    y: -1.4,
    radius: 0.9,
    thickness: 0.05,
    desc: "The coldest point in the fridge. ³He crosses from the concentrated phase to the dilute phase here, absorbing heat. The qubit chip mounts directly to this plate.",
    components: ["Qubit sample package", "Circulator (signal isolation)", "Quantum-limited TWPA (sometimes)", "−20 dB cold attenuators"],
    physics: "kT ≈ 1.3 µeV ≪ ℏω_q ~ 20–50 µeV. Thermal photon population n̄ = 1/(e^(ℏω/kT)−1) ≈ 10⁻⁸ — the qubit sees essentially no thermal excitations.",
  },
  {
    name: "Qubit chip",
    temp: "~15 mK",
    tempK: 0.015,
    color: 0xf5e6a3,
    ringColor: "#c8b86a",
    y: -2.1,
    radius: 0.35,
    thickness: 0.04,
    desc: "The transmon qubit chip — a few mm² of silicon with Nb CPW resonators and Al/AlOₓ/Al Josephson junctions. Wire-bonded to a copper or aluminium sample box.",
    components: ["Transmon qubit (×N)", "CPW readout resonator", "Purcell filter", "Wire bonds to PCB"],
    physics: "At 15 mK, ω_q/2π ~ 4–6 GHz, T₁ ~ 10–200 µs, T₂ ~ 10–150 µs depending on materials and design. Single-shot readout fidelity > 99% with a TWPA.",
  },
];

const CABLES: { fromStage: number; toStage: number; color: number; label: string }[] = [
  { fromStage: 0, toStage: 5, color: 0xe87a5a, label: "Input (drive)" },
  { fromStage: 5, toStage: 0, color: 0x7b7fa8, label: "Output (readout)" },
];

export default function DilutionFridgePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeRef = useRef<any>(null);
  const dragRef = useRef({ dragging: false, lastX: 0, lastY: 0 });
  const rotRef = useRef({ x: 0.18, y: 0.4 });
  const camDistRef = useRef(9.0);
  const [selectedStage, setSelectedStage] = useState<number>(4); // mixing chamber default
  const [autoRotate, setAutoRotate] = useState(true);
  const autoRotateRef = useRef(true);
  autoRotateRef.current = autoRotate;

  const buildScene = useCallback((THREE: any, scene: any) => {
    // Outer vacuum can (cylinder shell)
    const canGeo = new THREE.CylinderGeometry(2.3, 2.3, 6.5, 48, 1, true);
    const canMat = new THREE.MeshPhongMaterial({
      color: 0xd8d0be, transparent: true, opacity: 0.07,
      side: THREE.DoubleSide, wireframe: false,
    });
    const can = new THREE.Mesh(canGeo, canMat);
    can.position.y = 0.2;
    scene.add(can);

    // Can edges
    const canEdge = new THREE.EdgesGeometry(new THREE.CylinderGeometry(2.3, 2.3, 6.5, 24));
    scene.add(new THREE.LineSegments(canEdge, new THREE.LineBasicMaterial({ color: 0x2d2a24, transparent: true, opacity: 0.08 })));

    // Central cold finger (rod connecting stages)
    const rodGeo = new THREE.CylinderGeometry(0.04, 0.04, 6.0, 8);
    const rodMat = new THREE.MeshPhongMaterial({ color: 0xc8b86a });
    const rod = new THREE.Mesh(rodGeo, rodMat);
    rod.position.y = 0.0;
    scene.add(rod);

    // Stage plates
    STAGES.forEach((stage, i) => {
      // Main plate disc
      const geo = new THREE.CylinderGeometry(stage.radius, stage.radius, stage.thickness, 48);
      const mat = new THREE.MeshPhongMaterial({
        color: stage.color,
        transparent: true,
        opacity: 0.85,
        shininess: 80,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = stage.y;
      mesh.userData = { stageIdx: i };
      scene.add(mesh);

      // Edge ring
      const ringGeo = new THREE.TorusGeometry(stage.radius, 0.025, 8, 48);
      const ringMat = new THREE.MeshPhongMaterial({ color: stage.color, shininess: 120 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = stage.y;
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);

      // Support rods from plate to plate
      if (i < STAGES.length - 1) {
        const nextY = STAGES[i + 1].y;
        const h = Math.abs(stage.y - nextY);
        const supGeo = new THREE.CylinderGeometry(0.02, 0.02, h, 6);
        const supMat = new THREE.MeshPhongMaterial({ color: 0xb0a898, transparent: true, opacity: 0.5 });
        const angles = i === 0 ? [0, Math.PI * 2/3, Math.PI * 4/3] : [0, Math.PI];
        angles.forEach(angle => {
          const sup = new THREE.Mesh(supGeo, supMat);
          const r = Math.min(stage.radius, STAGES[i+1].radius) * 0.7;
          sup.position.set(Math.cos(angle)*r, stage.y - h/2, Math.sin(angle)*r);
          scene.add(sup);
        });
      }

      // Coax attenuator boxes on input line
      if (i > 0 && i < STAGES.length - 1) {
        const boxGeo = new THREE.BoxGeometry(0.12, 0.18, 0.12);
        const boxMat = new THREE.MeshPhongMaterial({ color: 0x7b7fa8 });
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.position.set(stage.radius * 0.55, stage.y + 0.25, 0);
        scene.add(box);
      }
    });

    // Input coax line (drive signal, top to bottom)
    const inputPts: any[] = [];
    const inputR = 0.55;
    STAGES.forEach(s => inputPts.push(new THREE.Vector3(inputR, s.y, 0)));
    const inputGeo = new THREE.BufferGeometry().setFromPoints(inputPts);
    scene.add(new THREE.Line(inputGeo, new THREE.LineBasicMaterial({ color: 0xe87a5a, linewidth: 2 })));

    // Output coax line (readout signal, bottom to top)
    const outputPts: any[] = [];
    const outputR = -0.55;
    STAGES.forEach(s => outputPts.push(new THREE.Vector3(outputR, s.y, 0)));
    const outputGeo = new THREE.BufferGeometry().setFromPoints(outputPts);
    scene.add(new THREE.Line(outputGeo, new THREE.LineBasicMaterial({ color: 0x7b7fa8, linewidth: 2 })));

    // Circulator at mixing chamber
    const circGeo = new THREE.TorusGeometry(0.12, 0.04, 8, 16);
    const circMat = new THREE.MeshPhongMaterial({ color: 0x2d2a24 });
    const circ = new THREE.Mesh(circGeo, circMat);
    circ.position.set(-0.55, STAGES[4].y + 0.12, 0);
    scene.add(circ);

    // HEMT amp box at 4K
    const hemtGeo = new THREE.BoxGeometry(0.2, 0.3, 0.15);
    const hemtMat = new THREE.MeshPhongMaterial({ color: 0xc8a84a });
    const hemt = new THREE.Mesh(hemtGeo, hemtMat);
    hemt.position.set(-0.55, STAGES[1].y + 0.25, 0);
    scene.add(hemt);

    // Qubit chip (small flat box)
    const chipGeo = new THREE.BoxGeometry(0.28, 0.02, 0.28);
    const chipMat = new THREE.MeshPhongMaterial({ color: 0xf5e6a3, shininess: 120 });
    const chip = new THREE.Mesh(chipGeo, chipMat);
    chip.position.y = STAGES[5].y;
    scene.add(chip);

  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let animId: number;

    const init = async () => {
      const THREE = await import("three");
      const W = canvas.parentElement!.offsetWidth;
      const H = Math.min(W * 1.05, 580);
      canvas.style.height = H + "px";

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.setClearColor(0x000000, 0);
      renderer.shadowMap.enabled = true;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, W / H, 0.1, 100);

      scene.add(new THREE.AmbientLight(0xffffff, 0.65));
      const dir = new THREE.DirectionalLight(0xffffff, 0.9);
      dir.position.set(5, 8, 4);
      dir.castShadow = true;
      scene.add(dir);
      const fill = new THREE.DirectionalLight(0xadd8ff, 0.3);
      fill.position.set(-4, 2, -3);
      scene.add(fill);
      
      buildScene(THREE, scene);

      threeRef.current = { renderer, scene, camera, THREE };

      let tick = 0;
      const animate = () => {
        animId = requestAnimationFrame(animate);
        tick += 0.004;
        if (autoRotateRef.current) rotRef.current.y += 0.004;

        const { x, y } = rotRef.current;
        const dist = camDistRef.current;
        camera.position.set(
          Math.sin(y) * dist * Math.cos(x),
          Math.sin(x) * dist + 0.5,
          Math.cos(y) * dist * Math.cos(x),
        );
        camera.lookAt(0, 0.3, 0);
        renderer.render(scene, camera);
      };
      animate();
    };
    init();
    return () => cancelAnimationFrame(animId);
  }, [buildScene]);

  const onMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { dragging: true, lastX: e.clientX, lastY: e.clientY };
    setAutoRotate(false);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current.dragging) return;
    rotRef.current.y += (e.clientX - dragRef.current.lastX) * 0.008;
    rotRef.current.x += (e.clientY - dragRef.current.lastY) * 0.005;
    rotRef.current.x = Math.max(-0.5, Math.min(1.1, rotRef.current.x));
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
  };
  const onMouseUp = () => { dragRef.current.dragging = false; };
  const onWheel = (e: React.WheelEvent) => {
    camDistRef.current = Math.max(4, Math.min(16, camDistRef.current + e.deltaY * 0.01));
  };
  const onTouchStart = (e: React.TouchEvent) => {
    dragRef.current = { dragging: true, lastX: e.touches[0].clientX, lastY: e.touches[0].clientY };
    setAutoRotate(false);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragRef.current.dragging) return;
    rotRef.current.y += (e.touches[0].clientX - dragRef.current.lastX) * 0.01;
    rotRef.current.x += (e.touches[0].clientY - dragRef.current.lastY) * 0.007;
    rotRef.current.x = Math.max(-0.5, Math.min(1.1, rotRef.current.x));
    dragRef.current.lastX = e.touches[0].clientX;
    dragRef.current.lastY = e.touches[0].clientY;
  };

  const stage = STAGES[selectedStage];

  // Temperature colour for the gradient bar
  const tempFraction = (stageIdx: number) => {
    const logMin = Math.log10(0.01);
    const logMax = Math.log10(300);
    return 1 - (Math.log10(STAGES[stageIdx].tempK) - logMin) / (logMax - logMin);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem" }}>
        Circuit QED › Interactive › <span style={{ color: "var(--text)" }}>Dilution Fridge</span>
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <span className="tag">3D Interactive</span>
        <span className="tag">Measurement setup</span>
      </div>

      <h1 style={{ fontFamily: "system-ui,sans-serif", fontSize: "2.2rem", fontWeight: 900, color: "var(--text)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "0.5rem" }}>
        Dilution Fridge
      </h1>
      <p style={{ fontFamily: "Georgia,serif", fontSize: "0.95rem", color: "var(--text-body)", lineHeight: 1.7, marginBottom: "2rem", maxWidth: "580px" }}>
        A cQED experiment runs inside a dilution refrigerator — the coldest man-made environment, reaching 10–20 mK. Explore each temperature stage, the microwave wiring, and the physics at each level.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.25rem", alignItems: "start" }}>

        {/* 3D viewer */}
        <div style={{ background: "var(--bg-surface)", border: "1.5px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ position: "relative" }}>
            <canvas
              ref={canvasRef}
              style={{ width: "100%", display: "block", cursor: autoRotate ? "default" : "grab" }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onWheel={onWheel}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onMouseUp}
            />

            {/* Stage temp labels overlaid */}
            <div style={{ position: "absolute", top: 12, left: 14, pointerEvents: "none" }}>
              <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-muted)", marginBottom: "0.2rem" }}>
                Selected stage
              </div>
              <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "1rem", fontWeight: 900, color: stage.ringColor }}>
                {stage.name}
              </div>
              <div style={{ fontFamily: "monospace", fontSize: "1.3rem", fontWeight: 700, color: "var(--text)" }}>
                {stage.temp}
              </div>
            </div>

            {/* Auto-rotate toggle */}
            <button
              onClick={() => setAutoRotate(v => !v)}
              style={{ position: "absolute", top: 12, right: 14, padding: "0.3rem 0.7rem", fontFamily: "system-ui,sans-serif", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", background: "var(--bg)", border: "1.5px solid var(--border-soft)", borderRadius: "6px", cursor: "pointer", color: "var(--text-muted)" }}
            >
              {autoRotate ? "⏸ Pause" : "▶ Rotate"}
            </button>

            {/* Wiring legend */}
            <div style={{ position: "absolute", bottom: 12, left: 14, display: "flex", gap: "0.75rem", pointerEvents: "none" }}>
              {[{ color: "#e87a5a", label: "Drive (input)" }, { color: "#7b7fa8", label: "Readout (output)" }].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "system-ui,sans-serif", fontSize: "0.65rem", color: "var(--text-muted)" }}>
                  <div style={{ width: 16, height: 2, background: l.color, borderRadius: 1 }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Hint bar */}
          <div style={{ borderTop: "1.5px solid var(--border-soft)", padding: "0.6rem 1rem", background: "var(--bg)", fontFamily: "system-ui,sans-serif", fontSize: "0.65rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
            <span>Drag to orbit · Scroll to zoom</span>
            <span>Click a stage below to inspect</span>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Stage selector */}
          <div style={{ background: "var(--bg-surface)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "1rem" }}>
            <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
              Temperature stages
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              {STAGES.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedStage(i)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.65rem",
                    padding: "0.5rem 0.7rem",
                    background: selectedStage === i ? "var(--accent)" : "var(--bg)",
                    border: `1.5px solid ${selectedStage === i ? "var(--accent-dark)" : "var(--border-soft)"}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    boxShadow: selectedStage === i ? "var(--shadow)" : "none",
                    textAlign: "left",
                    transition: "all 0.1s",
                  }}
                >
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.ringColor, flexShrink: 0, border: "1.5px solid rgba(0,0,0,0.15)" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.78rem", fontWeight: selectedStage === i ? 700 : 400, color: "var(--text)" }}>{s.name}</div>
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: "0.72rem", fontWeight: 700, color: selectedStage === i ? "var(--accent-text)" : "var(--text-muted)", flexShrink: 0 }}>
                    {s.temp}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Temperature scale bar */}
          <div style={{ background: "var(--bg-surface)", border: "1.5px solid var(--border)", borderRadius: "12px", padding: "1rem" }}>
            <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
              Temperature scale (log)
            </div>
            <div style={{ position: "relative", height: 180, background: "linear-gradient(to bottom, #c8614a, #c8a84a, #8ac8a8, #6ea4c8)", borderRadius: 6, marginBottom: "0.5rem", border: "1px solid var(--border-soft)" }}>
              {STAGES.map((s, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedStage(i)}
                  style={{
                    position: "absolute",
                    top: `${tempFraction(i) * 100}%`,
                    left: 0, right: 0,
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    transform: "translateY(-50%)",
                  }}
                >
                  <div style={{ width: "100%", height: selectedStage === i ? 2 : 1, background: selectedStage === i ? "var(--text)" : "rgba(255,255,255,0.4)" }} />
                  <div style={{ position: "absolute", right: 6, fontFamily: "monospace", fontSize: "0.6rem", fontWeight: 700, color: selectedStage === i ? "var(--text)" : "rgba(255,255,255,0.7)", whiteSpace: "nowrap", background: selectedStage === i ? "var(--accent)" : "transparent", padding: selectedStage === i ? "0 4px" : 0, borderRadius: 3 }}>
                    {s.temp}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "system-ui,sans-serif", fontSize: "0.6rem", color: "var(--text-muted)" }}>
              <span>15 mK</span>
              <span>300 K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stage detail panel */}
      <div style={{ marginTop: "1.25rem", background: "var(--bg-surface)", border: `1.5px solid ${stage.ringColor}`, borderLeft: `3px solid ${stage.ringColor}`, borderRadius: "0 12px 12px 0", padding: "1.25rem 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "1rem", fontWeight: 900, color: "var(--text)" }}>{stage.name}</div>
          <div style={{ fontFamily: "monospace", fontSize: "1.1rem", fontWeight: 700, color: stage.ringColor }}>{stage.temp}</div>
        </div>
        <p style={{ fontFamily: "Georgia,serif", fontSize: "0.875rem", color: "var(--text-body)", lineHeight: 1.7, marginBottom: "1rem" }}>
          {stage.desc}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
              Components at this stage
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              {stage.components.map(c => (
                <li key={c} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "system-ui,sans-serif", fontSize: "0.8rem", color: "var(--text-body)" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: stage.ringColor, flexShrink: 0 }} />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--accent-dark)", borderLeft: "3px solid var(--border)", borderRadius: "0 8px 8px 0", padding: "0.75rem 1rem" }}>
            <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
              Physics
            </div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: "0.78rem", color: "var(--text-body)", lineHeight: 1.65 }}>
              {stage.physics}
            </div>
          </div>
        </div>
      </div>

      {/* Signal chain summary */}
      <div style={{ marginTop: "1.5rem" }}>
        <div style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text)", marginBottom: "0.75rem", paddingBottom: "0.4rem", borderBottom: "1.5px solid var(--border-soft)" }}>
          Microwave signal chain
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {[
            {
              label: "Drive line (input)",
              color: "#e87a5a",
              desc: "Room-temp AWG → coax → 300K flange → 4K (−3 dB) → Still (−3 dB) → Cold plate (−20 dB) → MXC (−20 dB) → qubit. Total attenuation ~−60 dB to suppress Johnson noise.",
              items: ["AWG signal source", "−3 dB @ 4K", "−3 dB @ Still", "−20 dB @ Cold plate", "−20 dB @ MXC", "Qubit drive port"],
            },
            {
              label: "Readout line (output)",
              color: "#7b7fa8",
              desc: "Qubit → readout resonator → circulator (MXC) → isolator → TWPA (optional, MXC) → HEMT (4K) → room-temp amplifiers → digitiser.",
              items: ["Readout resonator", "Circulator @ MXC", "TWPA (quantum-limited)", "HEMT amp @ 4K", "RT amplifiers", "Digitiser / ADC"],
            },
          ].map(chain => (
            <div key={chain.label} style={{ background: "var(--bg-surface)", border: "1.5px solid var(--border-soft)", borderRadius: "10px", padding: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                <div style={{ width: 18, height: 2.5, background: chain.color, borderRadius: 1 }} />
                <span style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.75rem", fontWeight: 700, color: "var(--text)" }}>{chain.label}</span>
              </div>
              <p style={{ fontFamily: "Georgia,serif", fontSize: "0.78rem", color: "var(--text-body)", lineHeight: 1.6, marginBottom: "0.65rem" }}>{chain.desc}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                {chain.items.map((item, i) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--bg)", border: `1.5px solid ${chain.color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontFamily: "monospace", fontSize: "0.5rem", color: chain.color, fontWeight: 700 }}>{i + 1}</span>
                    </div>
                    <span style={{ fontFamily: "system-ui,sans-serif", fontSize: "0.75rem", color: "var(--text-body)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}