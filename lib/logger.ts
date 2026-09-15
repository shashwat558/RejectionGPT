type Level = "debug" | "info" | "warn" | "error";

function log(level: Level, msg: string, ctx?: Record<string, unknown>) {
  const base = { level, msg, ...ctx, ts: new Date().toISOString() };
  if (level === "error" || level === "warn") {
    console[level](JSON.stringify(base));
  } else if (process.env.NODE_ENV !== "production") {
    console.log(JSON.stringify(base));
  }
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) => log("debug", msg, ctx),
  info: (msg: string, ctx?: Record<string, unknown>) => log("info", msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => log("warn", msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => log("error", msg, ctx),
};

export function newRequestId(): string {
  return crypto.randomUUID();
}
