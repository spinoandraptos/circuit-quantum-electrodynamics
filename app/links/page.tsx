import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Links — Circuit QED",
};

interface LinkItem {
  title: string;
  authors?: string;
  description: string;
  url: string;
  type: "paper" | "textbook" | "group" | "tool" | "course";
}

interface Section {
  heading: string;
  links: LinkItem[];
}

const sections: Section[] = [
  {
    heading: "Foundational Papers",
    links: [
      {
        title: "Cavity Quantum Electrodynamics",
        authors: "Haroche & Raimond (2006)",
        description: "The canonical reference for cavity QED, covering strong coupling and quantum non-demolition measurement.",
        url: "https://doi.org/10.1093/acprof:oso/9780198509141.001.0001",
        type: "textbook",
      },
      {
        title: "Circuit Quantum Electrodynamics",
        authors: "Blais et al. (2004)",
        description: "The original cQED proposal — strong coupling between a superconducting qubit and a microwave resonator.",
        url: "https://doi.org/10.1103/PhysRevA.69.062320",
        type: "paper",
      },
      {
        title: "Charge-insensitive Qubit Design (Transmon)",
        authors: "Koch et al. (2007)",
        description: "Introduces the transmon qubit and derives its insensitivity to charge noise via large E_J/E_C.",
        url: "https://doi.org/10.1103/PhysRevA.76.042319",
        type: "paper",
      },
      {
        title: "Dispersive Readout and Strong Coupling",
        authors: "Wallraff et al. (2004)",
        description: "First experimental demonstration of strong coupling in a cQED system.",
        url: "https://doi.org/10.1038/nature02851",
        type: "paper",
      },
      {
        title: "Input-Output Theory for Waveguide QED",
        authors: "Gardiner & Collett (1985)",
        description: "The foundational input-output theory paper for quantum optics and open systems.",
        url: "https://doi.org/10.1103/PhysRevA.31.3761",
        type: "paper",
      },
    ],
  },
  {
    heading: "Textbooks & Reviews",
    links: [
      {
        title: "Quantum Computation and Quantum Information",
        authors: "Nielsen & Chuang",
        description: "The standard reference for quantum information. Chapter 8 covers quantum noise and open systems.",
        url: "https://www.cambridge.org/9781107002173",
        type: "textbook",
      },
      {
        title: "Introductory Course on Circuit QED",
        authors: "Blais, Grimsmo, Girvin & Wallraff (2021)",
        description: "Comprehensive review of the field — highly recommended as a companion to this site.",
        url: "https://doi.org/10.1103/RevModPhys.93.025005",
        type: "textbook",
      },
      {
        title: "Quantum Optics: An Introduction",
        authors: "Mark Fox",
        description: "Accessible introduction to quantum optics concepts underlying cavity and circuit QED.",
        url: "https://global.oup.com/academic/product/quantum-optics-9780198566731",
        type: "textbook",
      },
    ],
  },
  {
    heading: "Research Groups",
    links: [
      {
        title: "Girvin Group — Yale",
        description: "One of the founding groups in cQED. Theory and experiment on superconducting qubits.",
        url: "https://girvin.sites.yale.edu",
        type: "group",
      },
      {
        title: "Wallraff Group — ETH Zürich",
        description: "Experimental cQED: strong coupling, qubit readout, and quantum error correction.",
        url: "https://qudev.phys.ethz.ch",
        type: "group",
      },
      {
        title: "Oliver Group — MIT",
        description: "Superconducting qubit research focused on coherence, noise, and scalable architectures.",
        url: "https://equs.mit.edu",
        type: "group",
      },
      {
        title: "Google Quantum AI",
        description: "Large-scale superconducting quantum computing, including the Sycamore processor.",
        url: "https://quantumai.google",
        type: "group",
      },
    ],
  },
  {
    heading: "Courses & Lectures",
    links: [
      {
        title: "Quantum Machines Summer School",
        description: "Annual summer school on superconducting qubits and control electronics. Lecture videos freely available.",
        url: "https://qm-summer-school.com",
        type: "course",
      },
      {
        title: "Les Houches Lecture Notes on cQED",
        authors: "Girvin (2011)",
        description: "Excellent pedagogical introduction to circuit QED from the Les Houches summer school.",
        url: "https://arxiv.org/abs/1710.03767",
        type: "course",
      },
    ],
  },
  {
    heading: "Simulation Tools",
    links: [
      {
        title: "QuTiP",
        description: "The standard Python library for quantum optics and open quantum systems. Lindblad master equation solver included.",
        url: "https://qutip.org",
        type: "tool",
      },
      {
        title: "scqubits",
        description: "Python library for superconducting qubit simulation — spectrum, wavefunctions, and matrix elements.",
        url: "https://scqubits.readthedocs.io",
        type: "tool",
      },
      {
        title: "Qiskit Metal",
        description: "IBM's open-source tool for superconducting qubit chip design and electromagnetic simulation.",
        url: "https://qiskit-community.github.io/qiskit-metal/",
        type: "tool",
      },
    ],
  },
];

const typeStyles: Record<LinkItem["type"], { bg: string; color: string; label: string }> = {
  paper:    { bg: "var(--accent)",    color: "var(--accent-text)", label: "Paper" },
  textbook: { bg: "var(--bg-card)",   color: "var(--text-body)",   label: "Book" },
  group:    { bg: "var(--text)",      color: "var(--accent)",      label: "Group" },
  tool:     { bg: "var(--bg-surface)",color: "var(--text-body)",   label: "Tool" },
  course:   { bg: "var(--accent)",    color: "var(--accent-text)", label: "Course" },
};

export default function LinksPage() {
  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem" }}>
        Circuit QED › <span style={{ color: "var(--text)" }}>Links</span>
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <span className="tag">Resources</span>
      </div>

      <h1 style={{ fontFamily: "system-ui, sans-serif", fontSize: "2.2rem", fontWeight: 900, color: "var(--text)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "0.6rem" }}>
        Links & Resources
      </h1>
      <p style={{ fontFamily: "Georgia, serif", fontSize: "0.95rem", color: "var(--text-body)", lineHeight: 1.7, marginBottom: "3rem", maxWidth: "560px" }}>
        A curated collection of papers, textbooks, research groups, and tools
        that this site draws from or finds useful.
      </p>

      {sections.map((section) => (
        <div key={section.heading} style={{ marginBottom: "3rem" }}>
          {/* Section heading */}
          <div style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: "0.75rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "var(--text)",
            marginBottom: "1rem",
            paddingBottom: "0.4rem",
            borderBottom: "1.5px solid var(--border-soft)",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
          }}>
            {section.heading}
          </div>

          {/* Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {section.links.map((link) => {
              const ts = typeStyles[link.type];
              return (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "flex-start",
                    padding: "0.9rem 1rem",
                    background: "var(--bg-surface)",
                    border: "1.5px solid var(--border-soft)",
                    borderRadius: "10px",
                    textDecoration: "none",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    boxShadow: "none",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-soft)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
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
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
