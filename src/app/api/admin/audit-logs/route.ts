import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  actor_id: z.string().uuid().optional(),
  action_type: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

const PAGE_SIZE = 50;

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    await requireRole(supabase, ["admin"]);

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query parameters." }, { status: 422 });
    }

    const { page, actor_id, action_type, from, to } = parsed.data;
    const offset = (page - 1) * PAGE_SIZE;

    let query = supabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (actor_id) query = query.eq("actor_id", actor_id);
    if (action_type) query = query.eq("action_type", action_type);
    if (from) query = query.gte("created_at", from);
    if (to) query = query.lte("created_at", to);

    const { data, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      entries: data,
      total: count ?? 0,
      page,
      pageSize: PAGE_SIZE,
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
