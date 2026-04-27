import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Latest Papers — Circuit QED",
  description: "Recent arXiv papers on circuit quantum electrodynamics.",
};

export const revalidate = 3600;

const PAGE_SIZE = 20;

interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  published: string;
  updated: string;
  arxivUrl: string;
  pdfUrl: string;
  categories: string[];
}

async function fetchPapers(page: number): Promise<{ papers: Paper[]; total: number }> {
  const start = (page - 1) * PAGE_SIZE;
  const query = encodeURIComponent(
    '(ti:"circuit QED" OR ti:"circuit quantum electrodynamics" OR ti:"transmon" OR ti:"superconducting qubit" OR ti:"dispersive readout" OR ti:"Jaynes-Cummings") AND cat:quant-ph'
  );
  const url = `https://export.arxiv.org/api/query?search_query=${query}&sortBy=submittedDate&sortOrder=descending&start=${start}&max_results=${PAGE_SIZE}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch arXiv papers");

  const xml = await res.text();

  const totalMatch = xml.match(/<opensearch:totalResults[^>]*>(\d+)<\/opensearch:totalResults>/);
  const total = totalMatch ? parseInt(totalMatch[1], 10) : 0;

  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];

  const papers = entries.map((match) => {
    const entry = match[1];

    const id = (entry.match(/<id>(.*?)<\/id>/) ?? [])[1]?.trim() ?? "";
    const arxivId = id.replace("http://arxiv.org/abs/", "").replace("https://arxiv.org/abs/", "");

    const rawTitle = (entry.match(/<title>([\s\S]*?)<\/title>/) ?? [])[1] ?? "";
    const title = rawTitle.replace(/\s+/g, " ").trim();

    const rawAbstract = (entry.match(/<summary>([\s\S]*?)<\/summary>/) ?? [])[1] ?? "";
    const abstract = rawAbstract.replace(/\s+/g, " ").trim();

    const published = (entry.match(/<published>(.*?)<\/published>/) ?? [])[1]?.trim() ?? "";
    const updated = (entry.match(/<updated>(.*?)<\/updated>/) ?? [])[1]?.trim() ?? "";

    const authorMatches = [...entry.matchAll(/<author>[\s\S]*?<n>(.*?)<\/name>[\s\S]*?<\/author>/g)];
    const authors = authorMatches.map((a) => a[1].trim());

    const categoryMatches = [...entry.matchAll(/<category[^>]*term="([^"]+)"/g)];
    const categories = categoryMatches.map((c) => c[1]);

    return { id: arxivId, title, authors, abstract, published, updated, arxivUrl: `https://arxiv.org/abs/${arxivId}`, pdfUrl: `https://arxiv.org/pdf/${arxivId}`, categories };
  });

  return { papers, total };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

const pageBtnStyle = (active: boolean, disabled: boolean): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.45rem 0.9rem",
  fontFamily: "system-ui, sans-serif",
  fontSize: "0.75rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  textDecoration: "none",
  color: active ? "var(--accent)" : disabled ? "var(--text-muted)" : "var(--text)",
  background: active ? "var(--text)" : "var(--bg-surface)",
  border: `1.5px solid ${disabled ? "var(--border-soft)" : "var(--border)"}`,
  borderRadius: "8px",
  boxShadow: disabled ? "none" : "var(--shadow)",
  pointerEvents: disabled ? "none" : "auto",
  opacity: disabled ? 0.5 : 1,
});

export default async function PapersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  let papers: Paper[] = [];
  let total = 0;
  let error: string | null = null;

  try {
    ({ papers, total } = await fetchPapers(page));
  } catch {
    error = "Could not fetch papers from arXiv. Please try again later.";
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const firstResult = (page - 1) * PAGE_SIZE + 1;
  const lastResult = Math.min(page * PAGE_SIZE, total);

  // Page numbers around current (±2)
  const pageNumbers: number[] = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
    pageNumbers.push(i);
  }

  return (
    <div style={{ maxWidth: "720px" }}>
      {/* Breadcrumb */}
      <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "1rem" }}>
        Circuit QED › Resources › <span style={{ color: "var(--text)" }}>Latest Papers</span>
      </div>

      <div style={{ marginBottom: "0.5rem" }}>
        <span className="tag">arXiv</span>
        <span className="tag">Live Feed</span>
      </div>

      <h1 style={{ fontFamily: "system-ui, sans-serif", fontSize: "2.2rem", fontWeight: 900, color: "var(--text)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "0.6rem" }}>
        Latest Papers
      </h1>
      <p style={{ fontFamily: "Georgia, serif", fontSize: "0.95rem", color: "var(--text-body)", lineHeight: 1.7, marginBottom: "0.75rem", maxWidth: "560px" }}>
        Recent preprints from arXiv on circuit QED, transmon qubits, dispersive readout, and related topics. Sorted by submission date, newest first.
      </p>

      {/* Results summary */}
      {!error && total > 0 && (
        <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          <span>Showing {firstResult}–{lastResult} of {total.toLocaleString()} results</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>Page {page} of {totalPages}</span>
          {papers.length > 0 && (
            <>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{formatDate(papers[papers.length - 1].published)} – {formatDate(papers[0].published)}</span>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--accent-dark)", borderLeft: "3px solid var(--border)", borderRadius: "0 10px 10px 0", padding: "1rem 1.25rem", fontFamily: "Georgia, serif", fontSize: "0.9rem", color: "var(--text-body)", marginBottom: "2rem" }}>
          {error}
        </div>
      )}

      {/* Papers */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2.5rem" }}>
        {papers.map((paper) => {
          const age = daysSince(paper.published);
          const isNew = age <= 3;
          return (
            <div key={paper.id} style={{ background: "var(--bg-surface)", border: "1.5px solid var(--border-soft)", borderRadius: "12px", padding: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "0.5rem" }}>
                <a href={paper.arxivUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", textDecoration: "none", lineHeight: 1.3, flex: 1 }}>
                  {paper.title}
                </a>
                {isNew && (
                  <span style={{ flexShrink: 0, display: "inline-block", padding: "0.2rem 0.55rem", fontFamily: "system-ui, sans-serif", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", background: "var(--accent)", color: "var(--accent-text)", border: "1.5px solid var(--accent-dark)", borderRadius: "20px" }}>
                    New
                  </span>
                )}
              </div>
              <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.6rem" }}>
                {paper.authors.slice(0, 5).join(", ")}{paper.authors.length > 5 ? ` +${paper.authors.length - 5} more` : ""}
              </div>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "0.82rem", color: "var(--text-body)", lineHeight: 1.65, marginBottom: "0.9rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {paper.abstract}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    {formatDate(paper.published)}{age > 0 ? ` · ${age}d ago` : " · today"}
                  </span>
                  {paper.categories.slice(0, 2).map((cat) => (
                    <span key={cat} style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.6rem", fontWeight: 700, color: "var(--text-muted)", background: "var(--bg-card)", border: "1px solid var(--border-soft)", borderRadius: "20px", padding: "0.1rem 0.5rem" }}>
                      {cat}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  <a href={paper.arxivUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", textDecoration: "none", color: "var(--text)", background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: "6px", padding: "0.3rem 0.7rem", boxShadow: "var(--shadow)" }}>
                    Abstract
                  </a>
                  <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", textDecoration: "none", color: "var(--text)", background: "var(--accent)", border: "1.5px solid var(--border)", borderRadius: "6px", padding: "0.3rem 0.7rem", boxShadow: "var(--shadow)" }}>
                    PDF ↓
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", paddingTop: "1.5rem", borderTop: "1.5px solid var(--border-soft)", flexWrap: "wrap" }}>
            {/* First */}
            {page > 3 && (
              <>
                <Link href="/resources/papers?page=1" style={pageBtnStyle(false, false)}>1</Link>
                {page > 4 && <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>…</span>}
              </>
            )}

            {/* Prev */}
            <Link href={`/resources/papers?page=${page - 1}`} style={pageBtnStyle(false, !hasPrev)} aria-disabled={!hasPrev}>
              ← Prev
            </Link>

            {/* Page numbers */}
            {pageNumbers.map((n) => (
              <Link key={n} href={`/resources/papers?page=${n}`} style={pageBtnStyle(n === page, false)}>
                {n}
              </Link>
            ))}

            {/* Next */}
            <Link href={`/resources/papers?page=${page + 1}`} style={pageBtnStyle(false, !hasNext)} aria-disabled={!hasNext}>
              Next →
            </Link>

            {/* Last */}
            {page < totalPages - 2 && (
              <>
                {page < totalPages - 3 && <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>…</span>}
                <Link href={`/resources/papers?page=${totalPages}`} style={pageBtnStyle(false, false)}>{totalPages}</Link>
              </>
            )}
          </div>

          {/* Jump hint */}
          <div style={{ textAlign: "center", marginTop: "0.75rem", fontFamily: "system-ui, sans-serif", fontSize: "0.68rem", color: "var(--text-muted)" }}>
            Jump to any page: <code style={{ background: "var(--bg-surface)", padding: "0.1rem 0.4rem", borderRadius: "4px", fontSize: "0.68rem" }}>/resources/papers?page=N</code>
          </div>
        </>
      )}
    </div>
  );
}