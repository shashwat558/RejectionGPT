import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

  // Server-only
  GEMINI_API_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  // Legacy misnamed key — still accepted, mapped to service role where needed
  NEXT_SUPABASE_SERVICE_KEY: z.string().min(1).optional(),

  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  GOOGLE_CALENDER_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CALENDER_CLIENT_SECRET: z.string().min(1).optional(),

  REDIS_URL: z.string().min(1).optional(),
  SITE_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    // Don't throw during build for optional keys — only hard-require public keys
    // at runtime via getEnv(). Throw here so misconfig surfaces fast in dev/prod.
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Invalid environment: ${missing}`);
    }
    console.warn(`[env] validation warnings: ${missing}`);
    return process.env as unknown as Env;
  }
  return parsed.data;
}

export const env: Env = validateEnv();

export function getEnv(): Env {
  return env;
}

export function requireServerKey(): string {
  const key = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");
  return key;
}
