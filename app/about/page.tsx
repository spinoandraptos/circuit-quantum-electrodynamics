import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About — Circuit QED",
};

export default function AboutPage() {
  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem" }}>
        Circuit QED › <span style={{ color: "var(--text)" }}>About</span>
      </div>

      {/* Profile header */}
      <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", marginBottom: "2.5rem" }}>
        <div style={{ flexShrink: 0 }}>
          <Image
            src="/photo.jpg"
            alt="Your Name"
            width={140}
            height={140}
            style={{
              borderRadius: "12px",
              border: "2px solid var(--border)",
              boxShadow: "var(--shadow-strong)",
              objectFit: "cover",
            }}
          />
        </div>
        <div style={{ paddingTop: "0.5rem" }}>
          <h1 style={{ fontFamily: "system-ui, sans-serif", fontSize: "1.8rem", fontWeight: 900, color: "var(--text)", letterSpacing: "-0.03em", marginBottom: "0.3rem" }}>
            Juncheng Man
          </h1>
          <p style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
            PhD Student · Quantum Computing
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <span className="tag">CQT</span>
            <span className="tag">Qcrew</span>
            <span className="tag">Superconducting Qubits</span>
          </div>
        </div>
      </div>

      {/* Bio writeup */}
      <article className="prose">
        <h2>About</h2>
        <p>Hello World.</p>

        <h2>Research</h2>
        <p>Bosonic cQED.</p>

        <h2>Contact</h2>
        <p>juncheng.man@u.nus.edu</p>

        <h2><a href="/cv.pdf" target="_blank">CV</a></h2>
      </article>
    </div>
  );
}