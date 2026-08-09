const secretPatterns = [
  /sk-[A-Za-z0-9_-]{12,}/gu,
  /gh[pousr]_[A-Za-z0-9]{12,}/gu,
  /[A-Za-z0-9_-]{23,28}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{25,}/gu,
];

export function safeErrorMessage(error: unknown): string {
  const original = error instanceof Error ? error.message : String(error);
  const redacted = secretPatterns.reduce(
    (message, pattern) => message.replace(pattern, "[REDACTED]"),
    original,
  );
  return redacted.slice(0, 500);
}

export function checkpoint(
  status: "SUCCESS" | "RUNNING" | "FAILED" | "BLOCKED",
  message: string,
): void {
  console.log(`[${status}] ${message.replace(/[\r\n]+/gu, " ")}`);
}
