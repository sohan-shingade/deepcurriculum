"use client";

import dynamic from "next/dynamic";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  { ssr: false, loading: () => <div className="h-full bg-[#0e0e16] animate-pulse rounded-lg" /> }
);

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
}

export default function CodeEditor({
  value,
  onChange,
  language = "python",
  height = "300px",
  readOnly = false,
}: CodeEditorProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-[#2a2a3e]">
      <MonacoEditor
        height={height}
        language={language}
        value={value}
        onChange={(val) => onChange(val ?? "")}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          readOnly,
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: "gutter",
          tabSize: 4,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
