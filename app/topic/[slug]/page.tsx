import { topics } from "@/content/topics";
import { notFound } from "next/navigation";

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

  let Content: React.ComponentType;
  try {
    Content = (await import(`@/content/${slug}.mdx`)).default;
  } catch {
    notFound();
  }

  const currentIndex = topics.findIndex((t) => t.slug === slug);
  const prev = currentIndex > 0 ? topics[currentIndex - 1] : null;
  const next =
    currentIndex < topics.length - 1 ? topics[currentIndex + 1] : null;

  return (
    <div>
      {/* Breadcrumb */}
      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: "0.75rem",
          color: "var(--muted)",
          marginBottom: "2rem",
          letterSpacing: "0.04em",
        }}
      >
        Circuit QED
        <span style={{ margin: "0 0.5rem", opacity: 0.5 }}>›</span>
        <span style={{ color: "var(--accent)" }}>{topic.title}</span>
      </div>

      {/* MDX Content */}
      <article className="prose">
        <Content />
      </article>

      {/* Prev / Next navigation */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "4rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid var(--border)",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {prev ? (
          <a
            href={`/topic/${prev.slug}`}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.2rem",
              textDecoration: "none",
              padding: "0.75rem 1rem",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              flex: 1,
              background: "var(--bg-surface)",
              transition: "border-color 0.15s",
            }}
          >
            <span style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              ← Previous
            </span>
            <span style={{ fontSize: "0.9rem", color: "var(--text)", fontWeight: 500 }}>
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
              gap: "0.2rem",
              textDecoration: "none",
              padding: "0.75rem 1rem",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              flex: 1,
              background: "var(--bg-surface)",
              transition: "border-color 0.15s",
            }}
          >
            <span style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Next →
            </span>
            <span style={{ fontSize: "0.9rem", color: "var(--text)", fontWeight: 500 }}>
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
