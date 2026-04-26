"use client";
import { useEffect, useState } from "react";
import type { ComponentType } from "react";

export default function MDXContent({ slug }: { slug: string }) {
  const [Content, setContent] = useState<ComponentType | null>(null);

  useEffect(() => {
    import(`../content/${slug}.mdx`).then((mod) => {
      setContent(() => mod.default);
    });
  }, [slug]);

  if (!Content) return null;
  return (
    <article className="prose">
      <Content />
    </article>
  );
}