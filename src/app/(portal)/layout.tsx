import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f9fafb" }}>
      {children}
    </div>
  );
}
