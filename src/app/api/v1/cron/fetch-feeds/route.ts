import { NextRequest } from "next/server";
import Parser from "rss-parser";
import { db } from "@/lib/db/supabase";
import { ok, err } from "@/lib/api/response";

const rssParser = new Parser({ timeout: 10000 });

interface ArticleData {
  title: string;
  url: string;
  summary?: string;
  image_url?: string;
  author?: string;
  category?: string;
  published_at: string;
  source_id: string;
}

// ── RSS Fetcher ──────────────────────────────────────────
async function fetchRss(source: { id: string; url: string; category: string }): Promise<ArticleData[]> {
  try {
    const feed = await rssParser.parseURL(source.url);
    return feed.items.slice(0, 30).map((item: any) => {
      const rawSummary = item.contentSnippet || item.summary || item.content || "";
      const summary = rawSummary.replace(/<[^>]+>/g, "").slice(0, 300) || undefined;

      // Extract image from content
      let imageUrl: string | undefined;
      const contentHtml = item.content || item["content:encoded"] || "";
      const imgMatch = contentHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch) imageUrl = imgMatch[1];
      if (!imageUrl && item.enclosure?.url) imageUrl = item.enclosure.url;

      const publishedAt = item.pubDate
        ? new Date(item.pubDate).toISOString()
        : new Date().toISOString();

      return {
        title: item.title ?? "Untitled",
        url: item.link ?? "",
        summary,
        image_url: imageUrl,
        author: item.creator || item.author || undefined,
        category: source.category,
        published_at: publishedAt,
        source_id: source.id,
      };
    }).filter((a) => a.url);
  } catch (e) {
    console.error(`[fetchRss] ${source.url}:`, e);
    return [];
  }
}

// ── HackerNews Fetcher ───────────────────────────────────
async function fetchHackerNews(source: { id: string; category: string }): Promise<ArticleData[]> {
  try {
    const res = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
    const ids: number[] = await res.json();
    const top30 = ids.slice(0, 30);

    const items = await Promise.allSettled(
      top30.map((id) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((r) => r.json()),
      ),
    );

    return items
      .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled" && r.value?.title)
      .map((r) => {
        const story = r.value;
        const url = story.url || `https://news.ycombinator.com/item?id=${story.id}`;
        return {
          title: story.title,
          url,
          summary: `Score: ${story.score ?? 0} | Comments: ${story.descendants ?? 0}`,
          author: story.by,
          category: source.category,
          published_at: story.time
            ? new Date(story.time * 1000).toISOString()
            : new Date().toISOString(),
          source_id: source.id,
        };
      });
  } catch (e) {
    console.error("[fetchHackerNews]:", e);
    return [];
  }
}

// ── Dev.to Fetcher ───────────────────────────────────────
async function fetchDevto(source: { id: string; category: string }): Promise<ArticleData[]> {
  try {
    const res = await fetch("https://dev.to/api/articles?per_page=30&top=1");
    const articles: any[] = await res.json();

    return articles.map((a) => ({
      title: a.title,
      url: a.url,
      summary: a.description,
      image_url: a.cover_image || a.social_image || undefined,
      author: a.user?.name,
      category: a.tag_list?.[0] ?? source.category,
      published_at: a.published_at ?? new Date().toISOString(),
      source_id: source.id,
    }));
  } catch (e) {
    console.error("[fetchDevto]:", e);
    return [];
  }
}

// ── Main Handler ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return err("Unauthorized", 401);
    }
  }

  const { data: sources } = await db
    .from("source")
    .select("id, name, type, category, url")
    .eq("is_active", true);

  if (!sources?.length) return ok({ success: true, inserted: 0, total_fetched: 0, duplicates_skipped: 0, timestamp: new Date().toISOString() });

  // Fetch all feeds in parallel
  const fetchResults = await Promise.allSettled(
    sources.map((s) => {
      if (s.type === "hackernews") return fetchHackerNews(s);
      if (s.type === "devto") return fetchDevto(s);
      return fetchRss(s);
    }),
  );

  const allArticles: ArticleData[] = fetchResults.flatMap((r) =>
    r.status === "fulfilled" ? r.value : [],
  );

  const totalFetched = allArticles.length;
  if (totalFetched === 0) {
    return ok({ success: true, inserted: 0, total_fetched: 0, duplicates_skipped: 0, timestamp: new Date().toISOString() });
  }

  // Deduplicate against existing URLs
  const urls = allArticles.map((a) => a.url);
  const { data: existing } = await db.from("article").select("url").in("url", urls);
  const existingUrls = new Set((existing ?? []).map((e) => e.url));

  const newArticles = allArticles.filter((a) => !existingUrls.has(a.url));
  const duplicatesSkipped = totalFetched - newArticles.length;

  // Bulk insert in chunks of 100
  let inserted = 0;
  const chunkSize = 100;
  for (let i = 0; i < newArticles.length; i += chunkSize) {
    const chunk = newArticles.slice(i, i + chunkSize);
    const { error } = await db.from("article").insert(chunk);
    if (error) {
      console.error("[fetch-feeds] insert error:", error);
    } else {
      inserted += chunk.length;
    }
  }

  return ok({
    success: true,
    inserted,
    total_fetched: totalFetched,
    duplicates_skipped: duplicatesSkipped,
    timestamp: new Date().toISOString(),
  });
}
