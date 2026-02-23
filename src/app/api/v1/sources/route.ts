import { db } from "@/lib/db/supabase";
import { ok } from "@/lib/api/response";

export async function GET() {
  const [{ data: sources }, { data: latestArticles }] = await Promise.all([
    db.from("source").select("id, name, type, category, icon_url").eq("is_active", true),
    db.from("article").select("source_id, published_at").order("published_at", { ascending: false }).limit(500),
  ]);

  // Build latest_published_at map per source
  const latestMap: Record<string, string> = {};
  for (const a of latestArticles ?? []) {
    if (!latestMap[a.source_id]) latestMap[a.source_id] = a.published_at;
  }

  const result = (sources ?? []).map((s) => ({
    ...s,
    latest_published_at: latestMap[s.id] ?? null,
  }));

  return ok(result);
}
