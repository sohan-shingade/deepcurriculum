"use client";

interface OutputPanelProps {
  output: string;
  testResults?: {
    stdout: string;
    stderr: string;
    passed: boolean;
  } | null;
  isLoading?: boolean;
}

export default function OutputPanel({
  output,
  testResults,
  isLoading,
}: OutputPanelProps) {
  return (
    <div className="rounded-lg border border-[#2a2a3e] bg-[#0e0e16] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-[#12121a] border-b border-[#2a2a3e]">
        <span className="text-xs font-mono text-[#8888a0] uppercase tracking-wider">
          Output
        </span>
        {testResults && (
          <span
            className={`text-xs font-mono px-2 py-0.5 rounded ${
              testResults.passed
                ? "bg-[#00b894]/15 text-[#00b894]"
                : "bg-[#ff6b6b]/15 text-[#ff6b6b]"
            }`}
          >
            {testResults.passed ? "PASSED" : "FAILED"}
          </span>
        )}
      </div>
      <div className="p-4 min-h-[100px] max-h-[300px] overflow-auto">
        {isLoading ? (
          <div className="flex items-center gap-2 text-[#8888a0] font-mono text-sm">
            <div className="w-2 h-2 bg-[#6c5ce7] rounded-full animate-pulse" />
            Running...
          </div>
        ) : output ? (
          <pre className="text-sm font-mono text-[#c8c6c3] whitespace-pre-wrap break-words">
            {output}
          </pre>
        ) : (
          <p className="text-sm font-mono text-[#555]">
            Run your code to see output here
          </p>
        )}
      </div>
    </div>
  );
}
