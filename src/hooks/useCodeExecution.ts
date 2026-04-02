"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { initPyodide, execute, runTests, terminatePyodide } from "@/lib/pyodide/engine";

export function useCodeExecution() {
  const [output, setOutput] = useState("");
  const [testResults, setTestResults] = useState<{
    stdout: string;
    stderr: string;
    passed: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    initPyodide().then(() => {
      setIsReady(true);
    });

    return () => {
      terminatePyodide();
    };
  }, []);

  const executeCode = useCallback(async (code: string) => {
    setIsLoading(true);
    setOutput("");
    setTestResults(null);
    try {
      const result = await execute(code);
      setOutput(result.stderr ? `${result.stdout}\n${result.stderr}` : result.stdout);
    } catch (err) {
      setOutput(`Error: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runTestCode = useCallback(
    async (studentCode: string, testCode: string) => {
      setIsLoading(true);
      setOutput("");
      setTestResults(null);
      try {
        const result = await runTests(studentCode, testCode);
        setTestResults(result);
        setOutput(
          result.stderr
            ? `${result.stdout}\n${result.stderr}`
            : result.stdout
        );
      } catch (err) {
        setOutput(`Error: ${err}`);
        setTestResults({ stdout: "", stderr: String(err), passed: false });
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    execute: executeCode,
    runTests: runTestCode,
    output,
    testResults,
    isLoading,
    isReady,
  };
}
