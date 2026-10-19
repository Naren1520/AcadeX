import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { toErrorResponse } from "@/lib/errors/httpResponse";

const mfaVerifySchema = z.object({
  factorId: z.string().min(1, "factorId is required."),
  code: z.string().length(6, "TOTP code must be exactly 6 digits."),
});

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const parsed = mfaVerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid MFA request.", fields: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { factorId, code } = parsed.data;
    const supabase = await getSupabaseServerClient();

    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId });

    if (challengeError || !challengeData) {
      return NextResponse.json(
        { error: "MFA challenge failed. Please try again." },
        { status: 400 }
      );
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    });

    if (verifyError) {
      return NextResponse.json(
        { error: "Invalid MFA code. Please try again." },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
