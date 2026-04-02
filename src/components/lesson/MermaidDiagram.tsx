"use client";

import { useEffect, useRef, useState, useCallback, Component, type ReactNode } from "react";

interface MermaidDiagramProps {
  chart: string;
  caption?: string;
}

class MermaidErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// Singleton mermaid loader
let mermaidMod: typeof import("mermaid") | null = null;
let initDone = false;

async function getMermaid() {
  if (!mermaidMod) {
    mermaidMod = await import("mermaid");
  }
  if (!initDone) {
    mermaidMod.default.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        primaryColor: "#6c5ce7",
        primaryTextColor: "#e8e6e3",
        primaryBorderColor: "#6c5ce7",
        lineColor: "#555",
        secondaryColor: "#1a1a2e",
        tertiaryColor: "#12121a",
        background: "#0e0e16",
        mainBkg: "#1a1a2e",
        secondBkg: "#12121a",
        nodeBorder: "#6c5ce7",
        clusterBkg: "#12121a",
        clusterBorder: "#2a2a3e",
        titleColor: "#e8e6e3",
        edgeLabelBackground: "#12121a",
        nodeTextColor: "#e8e6e3",
      },
      fontFamily: "JetBrains Mono, monospace",
      fontSize: 14,
      flowchart: { htmlLabels: true, curve: "basis", padding: 12 },
      sequence: { mirrorActors: false },
    });
    initDone = true;
  }
  return mermaidMod.default;
}

/**
 * Extract a readable message from mermaid errors.
 * Mermaid throws plain objects {str, message, hash, error}, not Error instances.
 */
function extractErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === "object") {
    const obj = e as Record<string, unknown>;
    // mermaid error objects have a `str` field with the parse error detail
    if (typeof obj.str === "string" && obj.str.length > 0) return obj.str;
    if (typeof obj.message === "string" && obj.message.length > 0) {
      // Filter out the circular structure noise
      if (obj.message.includes("circular")) return "Diagram rendering not supported for this type";
      return obj.message;
    }
  }
  if (typeof e === "string") return e;
  return "Diagram could not be rendered";
}

function MermaidDiagramInner({ chart, caption }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLPreElement>(null);
  const [rendered, setRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const renderDiagram = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;

    try {
      const mermaid = await getMermaid();

      // Validate syntax first
      const parseResult = await mermaid.parse(chart.trim(), { suppressErrors: true });
      if (parseResult === false) {
        setError("Invalid diagram syntax");
        return;
      }

      // Reset for re-render
      el.removeAttribute("data-processed");
      el.textContent = chart.trim();

      await mermaid.run({ nodes: [el] });

      setRendered(true);
      setError(null);
    } catch (e) {
      setError(extractErrorMessage(e));
    }
  }, [chart]);

  useEffect(() => {
    renderDiagram();
  }, [renderDiagram]);

  if (error) {
    return (
      <figure className="my-8">
        <div className="bg-[#0e0e16] border border-[#ff6b6b]/30 rounded-lg p-4 text-sm text-[#ff6b6b] font-mono">
          {error}
        </div>
      </figure>
    );
  }

  return (
    <figure className="my-8">
      <pre
        ref={containerRef}
        className={`mermaid bg-[#0e0e16] border border-[#2a2a3e] rounded-lg p-6 overflow-x-auto flex justify-center [&>svg]:max-w-full ${
          !rendered ? "text-[#555] text-sm animate-pulse" : ""
        }`}
      >
        {chart.trim()}
      </pre>
      {caption && rendered && (
        <figcaption className="text-center text-sm text-[#8888a0] mt-3 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function MermaidDiagram(props: MermaidDiagramProps) {
  return (
    <MermaidErrorBoundary
      fallback={
        <figure className="my-8">
          <div className="bg-[#0e0e16] border border-[#2a2a3e] rounded-lg p-4 text-sm text-[#8888a0] font-mono">
            Diagram could not be rendered
          </div>
        </figure>
      }
    >
      <MermaidDiagramInner {...props} />
    </MermaidErrorBoundary>
  );
}
