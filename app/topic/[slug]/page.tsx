import { topics, contentMap } from "@/content/topics";
import { notFound } from "next/navigation";
import MDXContent from "@/components/MDXContent";

export function generateStaticParams() {
  return topics.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = topics.find((t) => t.slug === slug);
  return {
    title: topic ? `${topic.title} — Circuit QED` : "Circuit QED",
    description: topic?.description ?? "",
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = topics.find((t) => t.slug === slug);
  if (!topic) notFound();

  const loader = contentMap[slug];
  if (!loader) notFound();

  const currentIndex = topics.findIndex((t) => t.slug === slug);
  const prev = currentIndex > 0 ? topics[currentIndex - 1] : null;
  const next = currentIndex < topics.length - 1 ? topics[currentIndex + 1] : null;

  return (
    <div>
      {/* Breadcrumb */}
      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: "0.7rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: "1rem",
        }}
      >
        Circuit QED
        <span style={{ margin: "0 0.4rem", opacity: 0.5 }}>›</span>
        <span style={{ color: "var(--text)" }}>{topic.title}</span>
      </div>

      {/* Topic tag */}
      <div style={{ marginBottom: "0.25rem" }}>
        <span className="tag">{topic.description}</span>
      </div>

      {/* MDX Content */}
      <article className="prose">
        <MDXContent slug={slug} />
      </article>

      {/* Prev / Next navigation */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "4rem",
          paddingTop: "1.25rem",
          borderTop: "1.5px solid var(--border-soft)",
          gap: "0.75rem",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {prev ? (
          <a
            href={`/topic/${prev.slug}`}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.15rem",
              textDecoration: "none",
              padding: "0.75rem 1rem",
              border: "1.5px solid var(--border)",
              borderRadius: "10px",
              flex: 1,
              background: "var(--bg)",
              boxShadow: "var(--shadow)",
              transition: "box-shadow 0.15s",
            }}
          >
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              ← Previous
            </span>
            <span style={{ fontSize: "0.875rem", color: "var(--text)", fontWeight: 700 }}>
              {prev.title}
            </span>
          </a>
        ) : (
          <div style={{ flex: 1 }} />
        )}

        {next ? (
          <a
            href={`/topic/${next.slug}`}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "0.15rem",
              textDecoration: "none",
              padding: "0.75rem 1rem",
              border: "1.5px solid var(--border)",
              borderRadius: "10px",
              flex: 1,
              background: "var(--bg)",
              boxShadow: "var(--shadow)",
              transition: "box-shadow 0.15s",
            }}
          >
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Next →
            </span>
            <span style={{ fontSize: "0.875rem", color: "var(--text)", fontWeight: 700 }}>
              {next.title}
            </span>
          </a>
        ) : (
          <div style={{ flex: 1 }} />
        )}
      </nav>
    </div>
  );
}
