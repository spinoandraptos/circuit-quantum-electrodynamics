# Circuit Quantum Electrodynamics

An interactive educational site on circuit quantum electrodynamics (cQED), built with Next.js and MDX.

Live at: [circuit-quantum-electrodynamics.vercel.app](https://circuit-quantum-electrodynamics.vercel.app)

## About

This site covers the theory and physics of circuit QED — the study of quantum light-matter interactions implemented with superconducting circuits. Content is written in MDX, allowing LaTeX-rendered equations (via KaTeX) alongside interactive React components.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Content**: MDX with `remark-math` and `rehype-katex` for LaTeX rendering
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/          # Next.js App Router pages and layouts
components/   # Reusable React components
content/      # MDX content files (site pages and articles)
public/       # Static assets
```

## Writing Content

Content lives in `content/` as `.mdx` files. You can use standard Markdown, React components, and LaTeX math:

```mdx
Inline math: $\hat{H} = \hbar \omega \hat{a}^\dagger \hat{a}$

Block math:
$$
H = 4E_C \hat{n}^2 - E_J \cos\hat{\phi}
$$
```

## Deploying

The site is deployed on [Vercel](https://vercel.com). Pushes to `main` trigger automatic deployments.