import { NextRequest } from "next/server";
import { db } from "@/lib/db/supabase";
import { getCurrentUser } from "@/lib/auth/getUser";
import { ok } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sourceParam = searchParams.get("source");
  const search = searchParams.get("search") ?? undefined;
  const cursor = searchParams.get("cursor") ? Number(searchParams.get("cursor")) : undefined;
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
  const sort = searchParams.get("sort") === "oldest" ? "oldest" : "latest";

  const sourceIds = sourceParam ? sourceParam.split(",").filter(Boolean) : [];

  let query = db
    .from("article")
    .select("id, title, url, summary, image_url, author, category, published_at, source_id")
    .order("published_at", { ascending: sort === "oldest" })
    .order("id", { ascending: sort === "oldest" })
    .limit(limit + 1);

  if (sourceIds.length > 0) {
    query = query.in("source_id", sourceIds);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);
  }

  if (cursor !== undefined) {
    query = sort === "latest" ? query.lt("id", cursor) : query.gt("id", cursor);
  }

  const { data: articles } = await query;

  const hasMore = (articles?.length ?? 0) > limit;
  const items = (articles ?? []).slice(0, limit);

  // Get source info
  const uniqueSourceIds = [...new Set(items.map((a) => a.source_id))];
  const { data: sources } = uniqueSourceIds.length > 0
    ? await db.from("source").select("id, name, type, icon_url").in("id", uniqueSourceIds)
    : { data: [] };

  const sourceMap = Object.fromEntries((sources ?? []).map((s) => [s.id, s]));

  // Get read status if authenticated
  const user = await getCurrentUser(req);
  let readSet = new Set<number>();
  if (user && items.length > 0) {
    const articleIds = items.map((a) => a.id);
    const { data: readArticles } = await db
      .from("read_article")
      .select("article_id")
      .eq("user_id", user.id)
      .in("article_id", articleIds);
    readSet = new Set((readArticles ?? []).map((r) => r.article_id));
  }

  const result = items.map((a) => ({
    id: a.id,
    title: a.title,
    url: a.url,
    summary: a.summary,
    image_url: a.image_url,
    author: a.author,
    category: a.category,
    published_at: a.published_at,
    source_id: a.source_id,
    source: sourceMap[a.source_id]
      ? {
          name: sourceMap[a.source_id].name,
          type: sourceMap[a.source_id].type,
          icon_url: sourceMap[a.source_id].icon_url,
        }
      : null,
    is_read: readSet.has(a.id),
  }));

  const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;

  return ok({ articles: result, next_cursor: nextCursor, has_more: hasMore });
}
