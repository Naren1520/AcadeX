import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  // Zod v4 uses `.issues`, v3 used `.errors` - support both
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const issues: any[] = (_env.error as any).issues ?? (_env.error as any).errors ?? [];
  const missing = issues
    .map((e: { path: (string | number)[]; message: string }) =>
      `  - ${e.path.join(".")}: ${e.message}`
    )
    .join("\n");
  throw new Error(`Missing or invalid environment variables:\n${missing}`);
}

export const env = _env.data;
