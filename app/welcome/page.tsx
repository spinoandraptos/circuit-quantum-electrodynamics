"use client";
import Link from "next/link";
import { topics } from "@/content/topics";

const featureCards = [
  {
    icon: "∂",
    title: "First Principles Derivations",
    description:
      "Every result is derived from scratch — no hand-waving. Start from the Lagrangian and arrive at the Hamiltonian step by step.",
  },
  {
    icon: "∑",
    title: "Rendered Mathematics",
    description:
      "All equations are typeset with KaTeX. Inline and display math render cleanly throughout every page.",
  },
  {
    icon: "λ",
    title: "Interactive Calculators",
    description:
      "Plug in your own parameters and compute dispersive shifts, transmon frequencies, Purcell rates, and more instantly.",
  },
  {
    icon: "⇢",
    title: "Curated Resources",
    description:
      "Foundational papers, textbooks, research groups, and simulation tools — all linked and annotated.",
  },
];

export default function WelcomePage() {
  return (
    <div style={{ maxWidth: "680px" }}>
      {/* Hero */}
      <div style={{ marginBottom: "3.5rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <span className="tag">Reference Site</span>
          <span className="tag">v1.0</span>
        </div>
        <h1
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 900,
            color: "var(--text)",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            marginBottom: "1.25rem",
          }}
        >
          Circuit Quantum<br />Electrodynamics
        </h1>
        <p
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "1.05rem",
            color: "var(--text-body)",
            lineHeight: 1.75,
            marginBottom: "2rem",
          }}
        >
          A self-contained reference on cQED — the study of quantum light–matter
          interactions realised with superconducting circuits. Built from first
          principles, for students and researchers who want to understand the
          physics, not just the results.
        </p>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link
            href="/topic/overview"
            style={{
              display: "inline-block",
              padding: "0.65rem 1.25rem",
              fontFamily: "system-ui, sans-serif",
              fontSize: "0.8rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              textDecoration: "none",
              color: "var(--text)",
              background: "var(--accent)",
              border: "1.5px solid var(--border)",
              borderRadius: "8px",
              boxShadow: "var(--shadow-strong)",
            }}
          >
            Start Reading →
          </Link>
          <Link
            href="/interactive/calculator"
            style={{
              display: "inline-block",
              padding: "0.65rem 1.25rem",
              fontFamily: "system-ui, sans-serif",
              fontSize: "0.8rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              textDecoration: "none",
              color: "var(--text)",
              background: "var(--bg-surface)",
              border: "1.5px solid var(--border)",
              borderRadius: "8px",
              boxShadow: "var(--shadow)",
            }}
          >
            Open Calculators
          </Link>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1.5px solid var(--border-soft)", marginBottom: "2.5rem" }} />

      {/* What's inside */}
      <div style={{ marginBottom: "3rem" }}>
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: "0.7rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: "var(--text-muted)",
            marginBottom: "1.25rem",
          }}
        >
          What's Inside
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem",
          }}
        >
          {featureCards.map((card) => (
            <div
              key={card.title}
              style={{
                background: "var(--bg-surface)",
                border: "1.5px solid var(--border-soft)",
                borderRadius: "12px",
                padding: "1.1rem",
              }}
            >
              <div
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "1.5rem",
                  color: "var(--accent-dark)",
                  marginBottom: "0.5rem",
                  lineHeight: 1,
                }}
              >
                {card.icon}
              </div>
              <div
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "var(--text)",
                  marginBottom: "0.35rem",
                }}
              >
                {card.title}
              </div>
              <div
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "0.8rem",
                  color: "var(--text-body)",
                  lineHeight: 1.6,
                }}
              >
                {card.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1.5px solid var(--border-soft)", marginBottom: "2.5rem" }} />

      {/* Topics list */}
      <div style={{ marginBottom: "3rem" }}>
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: "0.7rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: "var(--text-muted)",
            marginBottom: "1.25rem",
          }}
        >
          Topics Covered
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {topics.map((topic) => (
            <Link
              key={topic.slug}
              href={`/topic/${topic.slug}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "0.75rem 1rem",
                background: "var(--bg-surface)",
                border: "1.5px solid var(--border-soft)",
                borderRadius: "10px",
                textDecoration: "none",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-soft)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <span
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  minWidth: "1.5rem",
                }}
              >
                {String(topic.order).padStart(2, "0")}
              </span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: "0.1rem",
                  }}
                >
                  {topic.title}
                </div>
                <div
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: "0.78rem",
                    color: "var(--text-body)",
                  }}
                >
                  {topic.description}
                </div>
              </div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div
        style={{
          fontFamily: "Georgia, serif",
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          lineHeight: 1.65,
          paddingTop: "1.5rem",
          borderTop: "1.5px solid var(--border-soft)",
        }}
      >
        Built as a personal reference while studying cQED. All derivations are
        my own — errors and omissions are mine too. If you spot a mistake, get in touch{" "}
        <Link href="/about" style={{ color: "var(--text)", fontWeight: 600 }}>
          here
        </Link>
        .
      </div>
    </div>
  );
}