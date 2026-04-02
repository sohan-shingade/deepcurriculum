type MessageHandler = (data: {
  id: string;
  type: string;
  stdout?: string;
  stderr?: string;
  passed?: boolean;
  error?: string;
}) => void;

let worker: Worker | null = null;
let messageId = 0;
const pendingMessages = new Map<string, MessageHandler>();
let readyResolve: (() => void) | null = null;
const readyPromise = new Promise<void>((resolve) => {
  readyResolve = resolve;
});

export function initPyodide(): Promise<void> {
  if (worker) return readyPromise;

  worker = new Worker(
    new URL("./worker.ts", import.meta.url),
    { type: "module" }
  );

  worker.onmessage = (event: MessageEvent) => {
    const { id, type } = event.data;

    if (type === "ready") {
      readyResolve?.();
      return;
    }

    const handler = pendingMessages.get(id);
    if (handler) {
      handler(event.data);
      pendingMessages.delete(id);
    }
  };

  worker.postMessage({ type: "init" });
  return readyPromise;
}

function sendMessage(
  type: string,
  data: Record<string, unknown>
): Promise<{
  stdout?: string;
  stderr?: string;
  passed?: boolean;
  error?: string;
}> {
  return new Promise((resolve, reject) => {
    if (!worker) {
      reject(new Error("Worker not initialized"));
      return;
    }

    const id = String(++messageId);
    const timeout = setTimeout(() => {
      pendingMessages.delete(id);
      reject(new Error("Execution timed out (10s)"));
    }, 10000);

    pendingMessages.set(id, (result) => {
      clearTimeout(timeout);
      if (result.type === "error") {
        resolve({ stderr: result.error });
      } else {
        resolve(result);
      }
    });

    worker.postMessage({ id, type, ...data });
  });
}

export async function execute(
  code: string
): Promise<{ stdout: string; stderr: string }> {
  await readyPromise;
  const result = await sendMessage("execute", { code });
  return { stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

export async function runTests(
  studentCode: string,
  testCode: string
): Promise<{ stdout: string; stderr: string; passed: boolean }> {
  await readyPromise;
  const result = await sendMessage("runTests", {
    code: studentCode,
    testCode,
  });
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    passed: result.passed ?? false,
  };
}

export function terminatePyodide() {
  if (worker) {
    worker.terminate();
    worker = null;
  }
}
