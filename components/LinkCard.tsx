"use client";

import { useState } from "react";

export default function LinkCard({ link, ts }: { link: any; ts: any }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        gap: "1rem",
        alignItems: "flex-start",
        padding: "0.9rem 1rem",
        background: "var(--bg-surface)",
        border: isHovered ? "1.5px solid var(--border)" : "1.5px solid var(--border-soft)",
        borderRadius: "10px",
        textDecoration: "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
        boxShadow: isHovered ? "var(--shadow)" : "none",
      }}
    >
      {/* Type badge */}
      <span style={{
        flexShrink: 0,
        display: "inline-block",
        padding: "0.2rem 0.55rem",
        fontFamily: "system-ui, sans-serif",
        fontSize: "0.6rem",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        background: ts.bg,
        color: ts.color,
        border: "1.5px solid var(--border)",
        borderRadius: "20px",
        marginTop: "0.1rem",
      }}>
        {ts.label}
      </span>

      {/* Text */}
      <div>
        <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.875rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.15rem" }}>
          {link.title}
          {link.authors && (
            <span style={{ fontWeight: 400, color: "var(--text-muted)", marginLeft: "0.5rem", fontSize: "0.8rem" }}>
              {link.authors}
            </span>
          )}
        </div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "0.8rem", color: "var(--text-body)", lineHeight: 1.55 }}>
          {link.description}
        </div>
      </div>
    </a>
  );
}