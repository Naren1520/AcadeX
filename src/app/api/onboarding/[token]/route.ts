/**
 * GET /api/onboarding/[token]
 * Returns minimal public info about an invitation (no passcode, no faculty details).
 */
import { NextResponse } from "next/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { toErrorResponse } from "@/lib/errors/httpResponse";

const GENERIC_ERROR = "Invitation not found or no longer active.";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const service = getSupabaseServiceRoleClient();

    const { data: inv } = await service
      .from("onboarding_invitations")
      .select("id, label, opens_at, closes_at, is_active, max_uses, use_count, sections(label, departments(name))")
      .eq("id", token)
      .single();

    if (!inv || !inv.is_active) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 404 });
    }

    const now = new Date();

    type RawInv = typeof inv & {
      sections: { label: string; departments: { name: string } | null } | null;
    };
    const raw = inv as unknown as RawInv;

    return NextResponse.json({
      invitation: {
        label:        raw.label,
        section:      raw.sections?.label ?? "",
        department:   raw.sections?.departments?.name ?? "",
        opens_at:     raw.opens_at,
        closes_at:    raw.closes_at,
        is_open:      now >= new Date(raw.opens_at) && now <= new Date(raw.closes_at),
        is_full:      raw.use_count >= raw.max_uses,
      },
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
