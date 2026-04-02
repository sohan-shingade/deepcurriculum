"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import ConceptCheck from "./ConceptCheck";
import MermaidDiagram from "./MermaidDiagram";
import CodeBlock from "./CodeBlock";
import SimulationWrapper from "@/components/simulations/SimulationWrapper";
import type { ConceptCheck as ConceptCheckType } from "@/lib/content/loader";
import type { Components } from "react-markdown";

interface LectureRendererProps {
  content: string;
  conceptChecks: ConceptCheckType[];
}

export default function LectureRenderer({
  content,
  conceptChecks,
}: LectureRendererProps) {
  const conceptCheckMap = new Map(
    conceptChecks.map((cc) => [cc.id, cc])
  );

  const parts = content.split(/(<ConceptCheck\s+id="[^"]+"\s*\/>|<Simulation\s+id="[^"]+"\s*\/>)/g);

  const components: Components = {
    h1: ({ children }) => (
      <h1 className="font-[family-name:var(--font-heading)] text-3xl text-white mt-8 mb-4">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="font-[family-name:var(--font-heading)] text-2xl text-white mt-8 mb-3 pb-2 border-b border-[#2a2a3e]">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-[family-name:var(--font-heading)] text-xl text-[#a29bfe] mt-6 mb-2">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="font-[family-name:var(--font-heading)] text-lg text-[#c8c6c3] mt-4 mb-2">{children}</h4>
    ),
    p: ({ children }) => (
      <p className="mb-4 text-[#c8c6c3] leading-relaxed">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-3 border-[#6c5ce7] pl-4 my-6 text-[#a29bfe] italic">{children}</blockquote>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-6 mb-4 space-y-1 text-[#c8c6c3]">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-6 mb-4 space-y-1 text-[#c8c6c3]">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed">{children}</li>
    ),
    strong: ({ children }) => (
      <strong className="text-white font-semibold">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic">{children}</em>
    ),
    a: ({ children, href }) => (
      <a href={href} className="text-[#a29bfe] underline underline-offset-2 hover:text-[#6c5ce7]" target="_blank" rel="noopener noreferrer">{children}</a>
    ),
    img: ({ src, alt }) => (
      <figure className="my-8">
        <img
          src={src}
          alt={alt || ""}
          className="rounded-lg border border-[#2a2a3e] max-w-full mx-auto"
          loading="lazy"
        />
        {alt && alt !== "" && (
          <figcaption className="text-center text-sm text-[#8888a0] mt-3 italic">
            {alt}
          </figcaption>
        )}
      </figure>
    ),
    code: ({ children, className }) => {
      const isInline = !className;
      if (isInline) {
        return (
          <code className="bg-[#1a1a2e] text-[#a29bfe] px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
        );
      }
      const lang = className?.replace("language-", "") || "";
      if (lang === "mermaid") {
        const chart = String(children).replace(/\n$/, "");
        return <MermaidDiagram chart={chart} />;
      }
      // Use shiki-powered CodeBlock for syntax highlighting
      const codeStr = String(children).replace(/\n$/, "");
      return <CodeBlock code={codeStr} language={lang} />;
    },
    // pre is now handled by CodeBlock/MermaidDiagram — just pass through children
    pre: ({ children }) => <>{children}</>,
    table: ({ children }) => (
      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead>{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => <tr>{children}</tr>,
    th: ({ children }) => (
      <th className="bg-[#1a1a2e] px-4 py-3 text-left border-b-2 border-[#6c5ce7] text-white text-sm">{children}</th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 border-b border-[#2a2a3e] text-[#c8c6c3] text-sm">{children}</td>
    ),
    hr: () => <hr className="border-[#2a2a3e] my-8" />,
  };

  return (
    <div className="prose-lecture max-w-none">
      {parts.map((part, index) => {
        const ccMatch = part.match(/<ConceptCheck\s+id="([^"]+)"\s*\/>/);
        if (ccMatch) {
          const checkId = ccMatch[1];
          const check = conceptCheckMap.get(checkId);
          if (check) {
            return (
              <div key={`cc-${index}`} className="my-8">
                <ConceptCheck check={check} />
              </div>
            );
          }
          return null;
        }

        const simMatch = part.match(/<Simulation\s+id="([^"]+)"\s*\/>/);
        if (simMatch) {
          return <SimulationWrapper key={`sim-${index}`} id={simMatch[1]} />;
        }

        if (!part.trim()) return null;

        return (
          <ReactMarkdown
            key={`md-${index}`}
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={[rehypeKatex]}
            components={components}
          >
            {part}
          </ReactMarkdown>
        );
      })}
    </div>
  );
}
