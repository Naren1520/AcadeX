import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/serviceRole";
import { requireRole } from "@/server/authorization";
import { toErrorResponse } from "@/lib/errors/httpResponse";

const querySchema = z.object({
  page:        z.coerce.number().int().positive().default(1),
  actor_id:    z.string().uuid().optional(),
  actor_email: z.string().optional(),
  action_type: z.string().optional(),
  from:        z.string().datetime().optional(),
  to:          z.string().datetime().optional(),
  export:      z.enum(["csv"]).optional(),
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

    const { page, actor_id, actor_email, action_type, from, to, export: exportFormat } = parsed.data;

    // Use service role so actor_email column is readable
    const service = getSupabaseServiceRoleClient();

    // Build query — join profiles to get email if not stored directly
    let query = service
      .from("audit_logs")
      .select("event_id, actor_id, actor_role, actor_email, action_type, target_table, target_record_id, previous_value, new_value, ip_address, user_agent, created_at", { count: "exact" })
      .order("created_at", { ascending: false });

    if (actor_id)    query = query.eq("actor_id", actor_id);
    if (actor_email) query = query.ilike("actor_email", `%${actor_email}%`);
    if (action_type) query = query.eq("action_type", action_type);
    if (from)        query = query.gte("created_at", from);
    if (to)          query = query.lte("created_at", to);

    // CSV export — no pagination, max 5000 rows
    if (exportFormat === "csv") {
      const { data, error } = await query.limit(5000);
      if (error) throw error;

      const headers = [
        "timestamp", "actor_email", "actor_role", "action_type",
        "target_table", "target_record_id", "ip_address", "user_agent",
      ];

      const rows = (data ?? []).map((r) => [
        r.created_at,
        r.actor_email ?? "",
        r.actor_role,
        r.action_type,
        r.target_table,
        r.target_record_id,
        r.ip_address ?? "",
        (r.user_agent ?? "").replace(/,/g, " "), // strip commas from UA
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));

      const csv = [headers.join(","), ...rows].join("\n");

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="audit_logs_${new Date().toISOString().slice(0,10)}.csv"`,
        },
      });
    }

    // Paginated JSON
    const offset = (page - 1) * PAGE_SIZE;
    const { data, count, error } = await query.range(offset, offset + PAGE_SIZE - 1);
    if (error) throw error;

    return NextResponse.json({ entries: data, total: count ?? 0, page, pageSize: PAGE_SIZE });
  } catch (err) {
    return toErrorResponse(err);
  }
}
