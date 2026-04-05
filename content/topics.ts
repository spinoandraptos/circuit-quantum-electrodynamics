export interface Topic {
  slug: string;
  title: string;
  description: string;
  order: number;
}

export const topics: Topic[] = [
  {
    slug: "overview",
    title: "cQED Overview",
    description: "What is circuit QED and why it matters for quantum computing.",
    order: 1,
  },
  {
    slug: "jaynes-cummings",
    title: "Jaynes–Cummings Model",
    description: "Derivation of the Jaynes–Cummings Hamiltonian and its eigenstates.",
    order: 2,
  },
  {
    slug: "dispersive-limit",
    title: "Dispersive Limit",
    description: "The off-resonant regime and the dispersive approximation.",
    order: 3,
  },
  {
    slug: "transmon",
    title: "Transmon Qubit",
    description: "Circuit quantisation, charge dispersion, and the transmon regime.",
    order: 4,
  },
  {
    slug: "input-output",
    title: "Input-Output Theory",
    description: "Coupling to external transmission lines, Purcell effect, and readout.",
    order: 5,
  },
  {
    slug: "lindblad",
    title: "Lindblad Master Equation",
    description: "Open quantum systems, decoherence rates T₁ and T₂.",
    order: 6,
  },
];
