"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { topics } from "@/content/topics";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: "220px",
        minWidth: "220px",
        background: "var(--bg-surface)",
        borderRight: "2px solid var(--border)",
        height: "100vh",
        position: "sticky",
        top: 0,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "1.25rem 1rem 1rem",
          borderBottom: "2px solid var(--border)",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <div
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: "0.2rem",
            }}
          >
            Quantum Engineering 
          </div>
          <div
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: "1.1rem",
              fontWeight: 900,
              color: "var(--text)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            Bosonic Circuit Quantum Electrodynamics
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ padding: "0.75rem 0", flex: 1 }}>
        <div
          style={{
            padding: "0.25rem 1rem 0.5rem",
            fontSize: "0.6rem",
            fontFamily: "system-ui, sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: "var(--text-muted)",
            fontWeight: 700,
          }}
        >
          Topics
        </div>

        {topics.map((topic) => {
          const href = `/topic/${topic.slug}`;
          const active = pathname === href;
          return (
            <Link
              key={topic.slug}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.4rem 0.75rem",
                margin: "0 0.5rem 0.15rem",
                textDecoration: "none",
                fontFamily: "system-ui, sans-serif",
                fontSize: "0.8rem",
                fontWeight: active ? 700 : 400,
                color: active ? "var(--text)" : "var(--text-body)",
                background: active ? "var(--accent)" : "transparent",
                border: active ? "1.5px solid var(--accent-dark)" : "1.5px solid transparent",
                borderRadius: "8px",
                boxShadow: active ? "var(--shadow)" : "none",
                transition: "all 0.1s",
              }}
            >
              <span
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: active ? "var(--accent-text)" : "var(--text-muted)",
                  minWidth: "1.2rem",
                }}
              >
                {String(topic.order).padStart(2, "0")}
              </span>
              {topic.title}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "0.75rem 1rem",
          borderTop: "1.5px solid var(--border-soft)",
          fontFamily: "system-ui, sans-serif",
          color: "var(--text-muted)",
          display: "flex",
          flexDirection: "column",
          gap: "0.4rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a
            href="/about"
            style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textDecoration: "none" }}
          >
            About Me
          </a>
        </div>
        <div style={{ fontSize: "0.7rem", letterSpacing: "0.03em" }}>
          © {new Date().getFullYear()} Juncheng Man
        </div>
      </div>
    </aside>
  );
}
