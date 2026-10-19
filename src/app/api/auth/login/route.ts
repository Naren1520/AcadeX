import { NextResponse } from "next/server";
import { z } from "zod";
import { emailSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimit";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { writeAuditLog, AuditEventTypes } from "@/server/audit";
import { toErrorResponse } from "@/lib/errors/httpResponse";

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

const GENERIC_AUTH_ERROR =
  "Invalid credentials. Please check your email and password.";

export async function POST(request: Request) {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    const rateLimitResult = checkRateLimit(ip);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rateLimitResult.retryAfterSeconds ?? 300) } }
      );
    }

    let body: unknown;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    const { email, password } = parsed.data;
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    const { data: profileRaw } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    const profile = profileRaw as { role: string } | null;

    writeAuditLog({
      actorId: data.user.id,
      actorRole: (profile?.role as "admin" | "faculty" | "student") ?? "student",
      actionType: AuditEventTypes.USER_LOGIN,
      targetTable: "profiles",
      targetRecordId: data.user.id,
    });

    return NextResponse.json({ userId: data.user.id, role: profile?.role ?? null });
  } catch (err) {
    return toErrorResponse(err);
  }
}
