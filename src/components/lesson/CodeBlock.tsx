"use client";

import { useEffect, useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
}

let highlighterPromise: Promise<
  import("shiki").HighlighterGeneric<import("shiki").BundledLanguage, import("shiki").BundledTheme>
> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = import("shiki").then((mod) =>
      mod.createHighlighter({
        themes: ["github-dark"],
        langs: [
          "python",
          "c",
          "cpp",
          "javascript",
          "typescript",
          "bash",
          "shell",
          "json",
          "yaml",
          "toml",
          "markdown",
          "sql",
          "rust",
          "go",
          "verilog",
          "asm",
          "makefile",
          "plaintext",
        ],
      })
    );
  }
  return highlighterPromise;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function highlight() {
      try {
        const highlighter = await getHighlighter();
        const lang = language || "plaintext";

        // Check if language is loaded, fallback to plaintext
        const loadedLangs = highlighter.getLoadedLanguages();
        const effectiveLang = loadedLangs.includes(lang) ? lang : "plaintext";

        const result = highlighter.codeToHtml(code, {
          lang: effectiveLang,
          theme: "github-dark",
        });

        if (!cancelled) {
          setHtml(result);
        }
      } catch {
        if (!cancelled) {
          setHtml("");
        }
      }
    }

    highlight();
    return () => {
      cancelled = true;
    };
  }, [code, language]);

  if (!html) {
    // Fallback: render without highlighting
    return (
      <pre className="bg-[#0e0e16] border border-[#2a2a3e] rounded-lg p-4 overflow-x-auto my-4 text-sm">
        <code className="text-[#c8c6c3]">{code}</code>
      </pre>
    );
  }

  return (
    <div
      className="my-4 rounded-lg border border-[#2a2a3e] overflow-hidden [&>pre]:!bg-[#0e0e16] [&>pre]:!p-4 [&>pre]:!m-0 [&>pre]:overflow-x-auto [&>pre]:text-sm [&_code]:!text-sm [&_code]:!font-[family-name:var(--font-mono)]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
