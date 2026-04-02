// @ts-nocheck - Web Worker file loaded separately
const workerSelf = self as unknown as DedicatedWorkerGlobalScope;

let pyodide: unknown = null;
let isReady = false;

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackagesFromImports: (code: string) => Promise<void>;
  globals: { get: (name: string) => unknown; set: (name: string, value: unknown) => void; delete: (name: string) => void };
  runPython: (code: string) => unknown;
}

async function loadPyodideAndPackages() {
  // @ts-expect-error - importScripts is a Web Worker global
  importScripts("https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js");

  // @ts-expect-error - loadPyodide is loaded via importScripts
  pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/",
  });

  const py = pyodide as PyodideInterface;
  await py.loadPackagesFromImports("import numpy, json");

  isReady = true;
  workerSelf.postMessage({ type: "ready" });
}

async function execute(code: string): Promise<{ stdout: string; stderr: string }> {
  const py = pyodide as PyodideInterface;
  let stdout = "";
  let stderr = "";

  py.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
  `);

  try {
    await py.runPythonAsync(code);
    stdout = py.runPython("sys.stdout.getvalue()") as string;
    stderr = py.runPython("sys.stderr.getvalue()") as string;
  } catch (error) {
    stderr = String(error);
  } finally {
    py.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
    `);
  }

  return { stdout, stderr };
}

async function runTests(
  studentCode: string,
  testCode: string
): Promise<{ stdout: string; stderr: string; passed: boolean }> {
  const py = pyodide as PyodideInterface;
  let stdout = "";
  let stderr = "";
  let passed = false;

  py.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
  `);

  try {
    const fullCode = `${studentCode}\n\n${testCode}`;
    await py.runPythonAsync(fullCode);
    stdout = py.runPython("sys.stdout.getvalue()") as string;
    stderr = py.runPython("sys.stderr.getvalue()") as string;
    passed = stdout.includes("All tests passed!");
  } catch (error) {
    stderr = String(error);
    stdout = py.runPython("sys.stdout.getvalue()") as string;
  } finally {
    py.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
    `);
  }

  return { stdout, stderr, passed };
}

workerSelf.onmessage = async (event: MessageEvent) => {
  const { id, type, code, testCode } = event.data;

  if (!isReady && type !== "init") {
    workerSelf.postMessage({
      id,
      type: "error",
      error: "Pyodide not ready yet",
    });
    return;
  }

  try {
    switch (type) {
      case "init":
        await loadPyodideAndPackages();
        break;
      case "execute": {
        const result = await execute(code);
        workerSelf.postMessage({ id, type: "result", ...result });
        break;
      }
      case "runTests": {
        const testResult = await runTests(code, testCode);
        workerSelf.postMessage({ id, type: "testResult", ...testResult });
        break;
      }
    }
  } catch (error) {
    workerSelf.postMessage({ id, type: "error", error: String(error) });
  }
};
