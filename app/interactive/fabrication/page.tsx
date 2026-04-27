"use client";
import { useEffect, useRef, useState, useCallback } from "react";

const steps = [
  {
    title: "Silicon substrate",
    subtitle: "Step 01",
    desc: "High-resistivity silicon wafer (~525 µm thick). Resistivity >10 kΩ·cm is critical — low microwave loss at mK temperatures is the foundation of the whole device.",
    layers: [
      { name:"Si substrate", color:0x6ea4c8, y:-0.9, h:1.0, w:4.0, d:2.4, opacity:1 },
    ]
  },
  {
    title: "Thermal oxidation",
    subtitle: "Step 02",
    desc: "Wafer heated to ~1000°C in O₂ atmosphere to grow ~300 nm of SiO₂. This sacrificial oxide protects the Si surface before niobium deposition.",
    layers: [
      { name:"Si substrate", color:0x6ea4c8, y:-0.9, h:1.0, w:4.0, d:2.4, opacity:1 },
      { name:"SiO₂", color:0xe8d5a3, y:-0.32, h:0.1, w:4.0, d:2.4, opacity:0.9 },
    ]
  },
  {
    title: "Niobium sputter deposition",
    subtitle: "Step 03",
    desc: "~200 nm of Nb sputtered across the entire wafer at room temperature. Nb is the workhorse superconductor here — T_c ≈ 9.2 K. This layer becomes the ground plane and resonator.",
    layers: [
      { name:"Si substrate", color:0x6ea4c8, y:-0.9, h:1.0, w:4.0, d:2.4, opacity:1 },
      { name:"SiO₂", color:0xe8d5a3, y:-0.32, h:0.1, w:4.0, d:2.4, opacity:0.9 },
      { name:"Niobium", color:0x7b7fa8, y:-0.2, h:0.08, w:4.0, d:2.4, opacity:1 },
    ]
  },
  {
    title: "Photoresist spin-coat",
    subtitle: "Step 04",
    desc: "Positive photoresist spun at ~4000 rpm to ~1 µm thickness, then soft-baked at 90°C. UV exposure will later define the coplanar waveguide and qubit pad geometry.",
    layers: [
      { name:"Si substrate", color:0x6ea4c8, y:-0.9, h:1.0, w:4.0, d:2.4, opacity:1 },
      { name:"SiO₂", color:0xe8d5a3, y:-0.32, h:0.1, w:4.0, d:2.4, opacity:0.9 },
      { name:"Niobium", color:0x7b7fa8, y:-0.2, h:0.08, w:4.0, d:2.4, opacity:1 },
      { name:"Photoresist", color:0xe87a5a, y:-0.10, h:0.12, w:4.0, d:2.4, opacity:0.75 },
    ]
  },
  {
    title: "UV lithography & develop",
    subtitle: "Step 05",
    desc: "UV light exposes resist through a chrome mask. Exposed regions dissolve in developer solution, revealing Nb below. Unexposed resist protects the CPW circuit pattern.",
    layers: [
      { name:"Si substrate", color:0x6ea4c8, y:-0.9, h:1.0, w:4.0, d:2.4, opacity:1 },
      { name:"SiO₂", color:0xe8d5a3, y:-0.32, h:0.1, w:4.0, d:2.4, opacity:0.9 },
      { name:"Niobium", color:0x7b7fa8, y:-0.2, h:0.08, w:4.0, d:2.4, opacity:1 },
      { name:"Patterned resist", color:0xe87a5a, y:-0.10, h:0.12, w:1.4, d:2.4, opacity:0.75, xOff:-1.3 },
      { name:"Patterned resist", color:0xe87a5a, y:-0.10, h:0.12, w:1.4, d:2.4, opacity:0.75, xOff:1.3 },
    ]
  },
  {
    title: "Reactive ion etch (RIE)",
    subtitle: "Step 06",
    desc: "SF₆/O₂ plasma etches exposed Nb anisotropically — straight sidewalls, high selectivity. The resist acts as a hard mask. This defines the resonator and qubit capacitor pad geometry.",
    layers: [
      { name:"Si substrate", color:0x6ea4c8, y:-0.9, h:1.0, w:4.0, d:2.4, opacity:1 },
      { name:"SiO₂", color:0xe8d5a3, y:-0.32, h:0.1, w:4.0, d:2.4, opacity:0.9 },
      { name:"Nb (patterned)", color:0x7b7fa8, y:-0.2, h:0.08, w:1.4, d:2.4, opacity:1, xOff:-1.3 },
      { name:"Nb (patterned)", color:0x7b7fa8, y:-0.2, h:0.08, w:1.4, d:2.4, opacity:1, xOff:1.3 },
      { name:"Patterned resist", color:0xe87a5a, y:-0.10, h:0.12, w:1.4, d:2.4, opacity:0.75, xOff:-1.3 },
      { name:"Patterned resist", color:0xe87a5a, y:-0.10, h:0.12, w:1.4, d:2.4, opacity:0.75, xOff:1.3 },
    ]
  },
  {
    title: "Resist strip",
    subtitle: "Step 07",
    desc: "Resist removed with acetone or O₂ plasma ash. Patterned Nb remains — this is now the coplanar waveguide resonator and transmon capacitor pads.",
    layers: [
      { name:"Si substrate", color:0x6ea4c8, y:-0.9, h:1.0, w:4.0, d:2.4, opacity:1 },
      { name:"SiO₂", color:0xe8d5a3, y:-0.32, h:0.1, w:4.0, d:2.4, opacity:0.9 },
      { name:"Nb resonator / pads", color:0x7b7fa8, y:-0.2, h:0.08, w:1.4, d:2.4, opacity:1, xOff:-1.3 },
      { name:"Nb resonator / pads", color:0x7b7fa8, y:-0.2, h:0.08, w:1.4, d:2.4, opacity:1, xOff:1.3 },
    ]
  },
  {
    title: "Bilayer resist for Josephson junction",
    subtitle: "Step 08",
    desc: "PMMA/MMA bilayer spun and baked. The MMA bottom layer undercuts more than the top PMMA, creating a mushroom undercut profile — essential for shadow evaporation of the junction.",
    layers: [
      { name:"Si substrate", color:0x6ea4c8, y:-0.9, h:1.0, w:4.0, d:2.4, opacity:1 },
      { name:"SiO₂", color:0xe8d5a3, y:-0.32, h:0.1, w:4.0, d:2.4, opacity:0.9 },
      { name:"Nb resonator / pads", color:0x7b7fa8, y:-0.2, h:0.08, w:1.4, d:2.4, opacity:1, xOff:-1.3 },
      { name:"Nb resonator / pads", color:0x7b7fa8, y:-0.2, h:0.08, w:1.4, d:2.4, opacity:1, xOff:1.3 },
      { name:"MMA (bottom)", color:0xf5c97a, y:-0.08, h:0.14, w:4.0, d:2.4, opacity:0.7 },
      { name:"PMMA (top)", color:0xf0a840, y:0.08, h:0.10, w:4.0, d:2.4, opacity:0.8 },
    ]
  },
  {
    title: "E-beam lithography",
    subtitle: "Step 09",
    desc: "Electron beam writes the junction pattern at nanometre precision — junction widths ~200 nm. After develop, the undercut profile is revealed. Alignment to the Nb pads is critical.",
    layers: [
      { name:"Si substrate", color:0x6ea4c8, y:-0.9, h:1.0, w:4.0, d:2.4, opacity:1 },
      { name:"SiO₂", color:0xe8d5a3, y:-0.32, h:0.1, w:4.0, d:2.4, opacity:0.9 },
      { name:"Nb resonator / pads", color:0x7b7fa8, y:-0.2, h:0.08, w:1.4, d:2.4, opacity:1, xOff:-1.3 },
      { name:"Nb resonator / pads", color:0x7b7fa8, y:-0.2, h:0.08, w:1.4, d:2.4, opacity:1, xOff:1.3 },
      { name:"MMA (patterned)", color:0xf5c97a, y:-0.08, h:0.14, w:1.0, d:2.4, opacity:0.7, xOff:-1.3 },
      { name:"MMA (patterned)", color:0xf5c97a, y:-0.08, h:0.14, w:1.0, d:2.4, opacity:0.7, xOff:1.3 },
      { name:"PMMA (patterned)", color:0xf0a840, y:0.08, h:0.10, w:0.7, d:2.4, opacity:0.8, xOff:-1.3 },
      { name:"PMMA (patterned)", color:0xf0a840, y:0.08, h:0.10, w:0.7, d:2.4, opacity:0.8, xOff:1.3 },
    ]
  },
  {
    title: "Al shadow evaporation + oxidation",
    subtitle: "Step 10",
    desc: "Al evaporated at two angles (±15°) with a thin AlOₓ tunnel barrier grown between — forming the Al/AlOₓ/Al Josephson junction. Barrier thickness directly sets E_J and thus the qubit frequency.",
    layers: [
      { name:"Si substrate", color:0x6ea4c8, y:-0.9, h:1.0, w:4.0, d:2.4, opacity:1 },
      { name:"SiO₂", color:0xe8d5a3, y:-0.32, h:0.1, w:4.0, d:2.4, opacity:0.9 },
      { name:"Nb resonator / pads", color:0x7b7fa8, y:-0.2, h:0.08, w:1.4, d:2.4, opacity:1, xOff:-1.3 },
      { name:"Nb resonator / pads", color:0x7b7fa8, y:-0.2, h:0.08, w:1.4, d:2.4, opacity:1, xOff:1.3 },
      { name:"MMA", color:0xf5c97a, y:-0.08, h:0.14, w:1.0, d:2.4, opacity:0.7, xOff:-1.3 },
      { name:"MMA", color:0xf5c97a, y:-0.08, h:0.14, w:1.0, d:2.4, opacity:0.7, xOff:1.3 },
      { name:"PMMA", color:0xf0a840, y:0.08, h:0.10, w:0.7, d:2.4, opacity:0.8, xOff:-1.3 },
      { name:"PMMA", color:0xf0a840, y:0.08, h:0.10, w:0.7, d:2.4, opacity:0.8, xOff:1.3 },
      { name:"Al (1st evap)", color:0xd4e8f5, y:-0.18, h:0.06, w:0.5, d:2.4, opacity:1, xOff:-0.05 },
      { name:"AlOₓ barrier", color:0xfff0a0, y:-0.12, h:0.02, w:0.5, d:2.4, opacity:1, xOff:-0.05 },
      { name:"Al (2nd evap)", color:0xaacfe8, y:-0.10, h:0.06, w:0.5, d:2.4, opacity:1, xOff:0.05 },
    ]
  },
  {
    title: "Liftoff",
    subtitle: "Step 11",
    desc: "Wafer soaked in acetone — resist dissolves, lifting off unwanted Al with it. Only Al on the substrate or Nb pads survives. The Josephson junction is revealed in its final form.",
    layers: [
      { name:"Si substrate", color:0x6ea4c8, y:-0.9, h:1.0, w:4.0, d:2.4, opacity:1 },
      { name:"SiO₂", color:0xe8d5a3, y:-0.32, h:0.1, w:4.0, d:2.4, opacity:0.9 },
      { name:"Nb resonator / pads", color:0x7b7fa8, y:-0.2, h:0.08, w:1.4, d:2.4, opacity:1, xOff:-1.3 },
      { name:"Nb resonator / pads", color:0x7b7fa8, y:-0.2, h:0.08, w:1.4, d:2.4, opacity:1, xOff:1.3 },
      { name:"Al junction (bottom)", color:0xd4e8f5, y:-0.18, h:0.06, w:0.5, d:0.6, opacity:1 },
      { name:"AlOₓ tunnel barrier", color:0xfff0a0, y:-0.12, h:0.02, w:0.5, d:0.6, opacity:1 },
      { name:"Al junction (top)", color:0xaacfe8, y:-0.10, h:0.06, w:0.5, d:0.6, opacity:1 },
    ]
  },
  {
    title: "Completed transmon chip",
    subtitle: "Step 12",
    desc: "Final chip: Nb coplanar waveguide resonator coupled to a transmon qubit with Al/AlOₓ/Al Josephson junction. Diced, wire-bonded to a PCB, and cooled to ~20 mK in a dilution refrigerator.",
    layers: [
      { name:"Si substrate", color:0x6ea4c8, y:-0.9, h:1.0, w:4.0, d:2.4, opacity:1 },
      { name:"SiO₂", color:0xe8d5a3, y:-0.32, h:0.1, w:4.0, d:2.4, opacity:0.9 },
      { name:"Nb ground plane / resonator", color:0x7b7fa8, y:-0.2, h:0.08, w:1.4, d:2.4, opacity:1, xOff:-1.3 },
      { name:"Nb ground plane / resonator", color:0x7b7fa8, y:-0.2, h:0.08, w:1.4, d:2.4, opacity:1, xOff:1.3 },
      { name:"Al junction (bottom)", color:0xd4e8f5, y:-0.18, h:0.06, w:0.5, d:0.6, opacity:1 },
      { name:"AlOₓ tunnel barrier", color:0xfff0a0, y:-0.12, h:0.02, w:0.5, d:0.6, opacity:1 },
      { name:"Al junction (top)", color:0xaacfe8, y:-0.10, h:0.06, w:0.5, d:0.6, opacity:1 },
    ]
  },
];

const legendItems = [
  { label: "Si substrate",  color: "#6ea4c8" },
  { label: "SiO₂",          color: "#e8d5a3" },
  { label: "Niobium",        color: "#7b7fa8" },
  { label: "Photoresist",    color: "#e87a5a" },
  { label: "MMA / PMMA",    color: "#f0a840" },
  { label: "Al",             color: "#d4e8f5" },
  { label: "AlOₓ barrier",  color: "#fff0a0" },
];

type Layer = {
  name: string; color: number; y: number; h: number;
  w: number; d: number; opacity: number; xOff?: number;
};

export default function FabricationPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeRef = useRef<{
    renderer: any; scene: any; camera: any;
    meshes: any[]; THREE: any;
  } | null>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [ready, setReady] = useState(false);

  const rotRef = useRef({ x: 0.35, y: 0.55 });
  const dragRef = useRef({ dragging: false, lastX: 0, lastY: 0 });
  const camDistRef = useRef(8.5);

  const buildStep = useCallback((idx: number) => {
    const ctx = threeRef.current;
    if (!ctx) return;
    const { scene, THREE, meshes } = ctx;
    meshes.forEach(m => scene.remove(m));
    meshes.length = 0;

    steps[idx].layers.forEach((l: Layer) => {
      const geo = new THREE.BoxGeometry(l.w, l.h, l.d);
      const mat = new THREE.MeshPhongMaterial({
        color: l.color,
        transparent: l.opacity < 1,
        opacity: l.opacity,
        shininess: 55,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(l.xOff ?? 0, l.y + l.h / 2, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      meshes.push(mesh);

      const edges = new THREE.EdgesGeometry(geo);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.1 });
      const line = new THREE.LineSegments(edges, lineMat);
      line.position.copy(mesh.position);
      scene.add(line);
      meshes.push(line);
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    let THREE: any;

    const init = async () => {
      THREE = await import("three");

      const W = canvas.parentElement!.offsetWidth;
      const H = Math.min(W * 0.52, 400);
      canvas.style.height = H + "px";

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.setClearColor(0x000000, 0);
      renderer.shadowMap.enabled = true;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);

      const ambient = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambient);
      const dir = new THREE.DirectionalLight(0xffffff, 0.9);
      dir.position.set(5, 8, 5);
      dir.castShadow = true;
      scene.add(dir);
      const fill = new THREE.DirectionalLight(0xadd8ff, 0.3);
      fill.position.set(-4, 2, -3);
      scene.add(fill);

      threeRef.current = { renderer, scene, camera, meshes: [], THREE };
      buildStep(0);
      setReady(true);

      const animate = () => {
        animId = requestAnimationFrame(animate);
        const { x, y } = rotRef.current;
        const dist = camDistRef.current;
        const cx = Math.sin(y) * dist;
        const cz = Math.cos(y) * dist;
        const cy = Math.sin(x) * dist + 1.5;
        camera.position.set(cx, Math.max(0.5, cy), cz);
        camera.lookAt(0, -0.1, 0);
        renderer.render(scene, camera);
      };
      animate();
    };

    init();
    return () => cancelAnimationFrame(animId);
  }, [buildStep]);

  useEffect(() => {
    if (ready) buildStep(currentStep);
  }, [currentStep, ready, buildStep]);

  const onMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { dragging: true, lastX: e.clientX, lastY: e.clientY };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current.dragging) return;
    rotRef.current.y += (e.clientX - dragRef.current.lastX) * 0.008;
    rotRef.current.x += (e.clientY - dragRef.current.lastY) * 0.006;
    rotRef.current.x = Math.max(-0.85, Math.min(0.85, rotRef.current.x));
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
  };
  const onMouseUp = () => { dragRef.current.dragging = false; };
  const onWheel = (e: React.WheelEvent) => {
    camDistRef.current = Math.max(4, Math.min(16, camDistRef.current + e.deltaY * 0.01));
  };
  const onTouchStart = (e: React.TouchEvent) => {
    dragRef.current = { dragging: true, lastX: e.touches[0].clientX, lastY: e.touches[0].clientY };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragRef.current.dragging) return;
    rotRef.current.y += (e.touches[0].clientX - dragRef.current.lastX) * 0.01;
    rotRef.current.x += (e.touches[0].clientY - dragRef.current.lastY) * 0.008;
    rotRef.current.x = Math.max(-0.85, Math.min(0.85, rotRef.current.x));
    dragRef.current.lastX = e.touches[0].clientX;
    dragRef.current.lastY = e.touches[0].clientY;
  };

  const s = steps[currentStep];

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem" }}>
        Circuit QED › Interactive › <span style={{ color: "var(--text)" }}>Fabrication</span>
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <span className="tag">3D Interactive</span>
        <span className="tag">Transmon chip</span>
      </div>

      <h1 style={{ fontFamily: "system-ui, sans-serif", fontSize: "2.2rem", fontWeight: 900, color: "var(--text)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "0.5rem" }}>
        Chip Fabrication
      </h1>
      <p style={{ fontFamily: "Georgia, serif", fontSize: "0.95rem", color: "var(--text-body)", lineHeight: 1.7, marginBottom: "2rem", maxWidth: "560px" }}>
        Step through the fabrication process of a standard transmon qubit chip — from bare silicon wafer to completed device. Drag to orbit, scroll to zoom.
      </p>

      {/* 3D viewer */}
      <div style={{ background: "var(--bg-surface)", border: "1.5px solid var(--border)", borderRadius: "14px", overflow: "hidden", marginBottom: "1.5rem" }}>

        {/* Canvas area */}
        <div style={{ position: "relative" }}>
          <canvas
            ref={canvasRef}
            style={{ width: "100%", display: "block", cursor: "grab" }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onWheel={onWheel}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onMouseUp}
          />

          {/* Step info overlay */}
          <div style={{ position: "absolute", top: 14, left: 16, pointerEvents: "none" }}>
            <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-muted)", marginBottom: "0.2rem" }}>
              {s.subtitle} / {steps.length.toString().padStart(2,"0")}
            </div>
            <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "1rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.3rem" }}>
              {s.title}
            </div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "0.78rem", color: "var(--text-body)", maxWidth: "280px", lineHeight: 1.55 }}>
              {s.desc}
            </div>
          </div>

          {/* Rotate hint */}
          <div style={{ position: "absolute", top: 14, right: 16, fontFamily: "system-ui, sans-serif", fontSize: "0.65rem", color: "var(--text-muted)", pointerEvents: "none" }}>
            Drag · Scroll to zoom
          </div>
        </div>

        {/* Controls */}
        <div style={{ borderTop: "1.5px solid var(--border-soft)", padding: "1rem 1.25rem", background: "var(--bg)" }}>

          {/* Step dots */}
          <div style={{ display: "flex", gap: "5px", justifyContent: "center", marginBottom: "0.9rem" }}>
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                style={{
                  width: i === currentStep ? 22 : 7,
                  height: 7,
                  borderRadius: 4,
                  background: i === currentStep ? "var(--text)" : "var(--border-soft)",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              />
            ))}
          </div>

          {/* Prev / slider / Next */}
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.9rem" }}>
            <button
              onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
              disabled={currentStep === 0}
              style={{ padding: "0.4rem 0.9rem", fontFamily: "system-ui, sans-serif", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", border: "1.5px solid var(--border)", borderRadius: "8px", background: "var(--bg-surface)", color: "var(--text)", cursor: "pointer", opacity: currentStep === 0 ? 0.35 : 1, boxShadow: "var(--shadow)" }}
            >
              ← Prev
            </button>
            <input
              type="range"
              min={0}
              max={steps.length - 1}
              value={currentStep}
              onChange={e => setCurrentStep(+e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              onClick={() => setCurrentStep(s => Math.min(steps.length - 1, s + 1))}
              disabled={currentStep === steps.length - 1}
              style={{ padding: "0.4rem 0.9rem", fontFamily: "system-ui, sans-serif", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", border: "1.5px solid var(--border)", borderRadius: "8px", background: "var(--text)", color: "var(--accent)", cursor: "pointer", opacity: currentStep === steps.length - 1 ? 0.35 : 1, boxShadow: "var(--shadow)" }}
            >
              Next →
            </button>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap" }}>
            {legendItems.map(li => (
              <div key={li.label} style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "system-ui, sans-serif", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                <div style={{ width: 14, height: 8, borderRadius: 2, background: li.color, border: "0.5px solid var(--border-soft)" }} />
                {li.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process summary table */}
      <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text)", marginBottom: "0.75rem", paddingBottom: "0.4rem", borderBottom: "1.5px solid var(--border-soft)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
        Process summary
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {steps.map((step, i) => (
          <button
            key={i}
            onClick={() => setCurrentStep(i)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.85rem",
              padding: "0.6rem 0.85rem",
              background: i === currentStep ? "var(--accent)" : "var(--bg-surface)",
              border: `1.5px solid ${i === currentStep ? "var(--accent-dark)" : "var(--border-soft)"}`,
              borderRadius: "8px",
              cursor: "pointer",
              textAlign: "left",
              boxShadow: i === currentStep ? "var(--shadow)" : "none",
              transition: "all 0.1s",
            }}
          >
            <span style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.65rem", fontWeight: 700, color: i === currentStep ? "var(--accent-text)" : "var(--text-muted)", minWidth: "2rem" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.82rem", fontWeight: i === currentStep ? 700 : 400, color: "var(--text)" }}>
              {step.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}