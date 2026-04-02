"use client";

import katex from "katex";

interface LatexTextProps {
  text: string;
  className?: string;
}

/**
 * Renders a plain text string with inline LaTeX ($...$) and block LaTeX ($$...$$).
 * Used for concept check questions, quiz options, explanations, etc.
 */
export default function LatexText({ text, className }: LatexTextProps) {
  const html = renderLatex(text);
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function renderLatex(text: string): string {
  // Process block math first ($$...$$), then inline math ($...$)
  let result = text.replace(/\$\$([\s\S]*?)\$\$/g, (_match, tex) => {
    try {
      return katex.renderToString(tex.trim(), {
        displayMode: true,
        throwOnError: false,
      });
    } catch {
      return `$$${tex}$$`;
    }
  });

  result = result.replace(/\$([^\$\n]+?)\$/g, (_match, tex) => {
    try {
      return katex.renderToString(tex.trim(), {
        displayMode: false,
        throwOnError: false,
      });
    } catch {
      return `$${tex}$`;
    }
  });

  return result;
}
