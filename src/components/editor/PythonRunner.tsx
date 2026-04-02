"use client";

import { useState } from "react";
import CodeEditor from "./CodeEditor";
import OutputPanel from "./OutputPanel";
import { Button } from "@/components/ui/button";
import { useCodeExecution } from "@/hooks/useCodeExecution";

interface PythonRunnerProps {
  initialCode: string;
  testCode?: string;
  onCodeChange?: (code: string) => void;
  onTestResult?: (passed: boolean) => void;
  height?: string;
}

export default function PythonRunner({
  initialCode,
  testCode,
  onCodeChange,
  onTestResult,
  height = "300px",
}: PythonRunnerProps) {
  const [code, setCode] = useState(initialCode);
  const { execute, runTests, output, testResults, isLoading, isReady } =
    useCodeExecution();

  function handleCodeChange(value: string) {
    setCode(value);
    onCodeChange?.(value);
  }

  async function handleRun() {
    await execute(code);
  }

  async function handleSubmit() {
    if (!testCode) return;
    await runTests(code, testCode);
    if (testResults) {
      onTestResult?.(testResults.passed);
    }
  }

  return (
    <div className="space-y-3">
      <CodeEditor
        value={code}
        onChange={handleCodeChange}
        height={height}
      />

      <div className="flex gap-2">
        <Button
          onClick={handleRun}
          disabled={isLoading || !isReady}
          variant="outline"
          className="border-[#2a2a3e] text-[#c8c6c3] hover:bg-[#1a1a2e] hover:text-white font-mono text-sm"
        >
          {!isReady ? "Loading Python..." : isLoading ? "Running..." : "Run"}
        </Button>
        {testCode && (
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !isReady}
            className="bg-[#6c5ce7] hover:bg-[#5b4bd6] text-white font-mono text-sm"
          >
            {isLoading ? "Testing..." : "Submit"}
          </Button>
        )}
      </div>

      <OutputPanel
        output={output}
        testResults={testResults}
        isLoading={isLoading}
      />
    </div>
  );
}
