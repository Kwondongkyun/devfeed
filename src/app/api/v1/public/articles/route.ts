import { NextRequest } from "next/server";
import { db } from "@/lib/db/supabase";
import { ok, err } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  // API 키 검증
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.DEVFEED_API_KEY) {
    return err("Invalid API key", 401);
  }

  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category") ?? undefined;
  const source = searchParams.get("source") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const cursor = searchParams.get("cursor") ? Number(searchParams.get("cursor")) : undefined;
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
  const sort = searchParams.get("sort") === "oldest" ? "oldest" : "latest";

  let query = db
    .from("article")
    .select("id, title, url, summary, image_url, author, category, published_at, source_id")
    .order("published_at", { ascending: sort === "oldest" })
    .order("id", { ascending: sort === "oldest" })
    .limit(limit + 1);

  if (category) {
    // 카테고리명으로 해당 소스들 조회 후 필터
    const { data: sources } = await db.from("source").select("id").eq("category", category).eq("is_active", true);
    const sourceIds = (sources ?? []).map((s) => s.id);
    if (sourceIds.length === 0) return ok({ articles: [], next_cursor: null, has_more: false });
    query = query.in("source_id", sourceIds);
  } else if (source) {
    query = query.in("source_id", source.split(",").filter(Boolean));
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);
  }

  if (cursor !== undefined) {
    query = sort === "latest" ? query.lt("id", cursor) : query.gt("id", cursor);
  }

  const { data: articles, error } = await query;
  if (error) return err("Failed to fetch articles", 500);

  const hasMore = (articles?.length ?? 0) > limit;
  const items = (articles ?? []).slice(0, limit);

  // 소스 정보 조인
  const uniqueSourceIds = [...new Set(items.map((a) => a.source_id))];
  const { data: sources } = uniqueSourceIds.length > 0
    ? await db.from("source").select("id, name, type, category").in("id", uniqueSourceIds)
    : { data: [] };

  const sourceMap = Object.fromEntries((sources ?? []).map((s) => [s.id, s]));

  const result = items.map((a) => ({
    id: a.id,
    title: a.title,
    url: a.url,
    summary: a.summary,
    image_url: a.image_url,
    author: a.author,
    published_at: a.published_at,
    source: sourceMap[a.source_id]
      ? { id: a.source_id, name: sourceMap[a.source_id].name, type: sourceMap[a.source_id].type, category: sourceMap[a.source_id].category }
      : null,
  }));

  const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;

  // 전체 건수 조회
  let countQuery = db.from("article").select("*", { count: "exact", head: true });
  if (category) {
    const { data: catSources } = await db.from("source").select("id").eq("category", category).eq("is_active", true);
    const catSourceIds = (catSources ?? []).map((s) => s.id);
    if (catSourceIds.length > 0) countQuery = countQuery.in("source_id", catSourceIds);
  } else if (source) {
    countQuery = countQuery.in("source_id", source.split(",").filter(Boolean));
  }
  if (search) {
    countQuery = countQuery.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);
  }
  const { count: totalCount } = await countQuery;

  return ok({ total: totalCount ?? 0, articles: result, next_cursor: nextCursor, has_more: hasMore });
}
