"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { topics } from "@/content/topics";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: "260px",
        minWidth: "260px",
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
        height: "100vh",
        position: "sticky",
        top: 0,
        overflowY: "auto",
        padding: "0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "1.5rem 1.25rem 1rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <div
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: "0.25rem",
            }}
          >
            Quantum Reference
          </div>
          <div
            style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "-0.01em",
            }}
          >
            Circuit QED
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ padding: "0.75rem 0", flex: 1 }}>
        <div
          style={{
            padding: "0.25rem 1.25rem 0.5rem",
            fontSize: "0.7rem",
            fontFamily: "system-ui, sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--muted)",
            fontWeight: 600,
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
                display: "block",
                padding: "0.5rem 1.25rem",
                textDecoration: "none",
                fontFamily: "system-ui, sans-serif",
                fontSize: "0.875rem",
                color: active ? "var(--accent)" : "#c9d1d9",
                background: active ? "var(--accent-dim)" : "transparent",
                borderLeft: active
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
                transition: "all 0.1s",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "1.4rem",
                  color: "var(--muted)",
                  fontSize: "0.75rem",
                  fontWeight: 500,
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
          padding: "1rem 1.25rem",
          borderTop: "1px solid var(--border)",
          fontSize: "0.7rem",
          fontFamily: "system-ui, sans-serif",
          color: "var(--muted)",
        }}
      >
        All derivations from first principles
      </div>
    </aside>
  );
}
