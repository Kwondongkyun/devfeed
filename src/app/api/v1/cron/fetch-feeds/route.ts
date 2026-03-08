import { NextRequest } from "next/server";
import Parser from "rss-parser";
import * as cheerio from "cheerio";
import { db } from "@/lib/db/supabase";
import { ok, err } from "@/lib/api/response";

const rssParser = new Parser({
  timeout: 10000,
  headers: { "User-Agent": "DevFeed/1.0 RSS Reader", Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml" },
});

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

// ── Maily (조쉬의 뉴스레터) Fetcher ─────────────────────
async function fetchMaily(source: { id: string; url: string; category: string }): Promise<ArticleData[]> {
  try {
    const articles: ArticleData[] = [];

    for (let page = 1; page <= 2; page++) {
      const res = await fetch(`${source.url}?page=${page}`, {
        headers: { "User-Agent": "DevFeed/1.0 RSS Reader" },
      });
      const html = await res.text();
      const $ = cheerio.load(html);

      const postLinks = $(`a[href*="/posts/"]`).filter((_, el) => {
        const href = $(el).attr("href") || "";
        return /\/posts\/[a-z0-9]+$/i.test(href);
      });

      if (postLinks.length === 0) break;

      postLinks.each((_, el) => {
        const $el = $(el);
        const href = $el.attr("href") || "";
        const url = href.startsWith("http") ? href : `https://maily.so${href}`;
        const parts = $el.text().trim().split("\n").map((s) => s.trim()).filter(Boolean);
        const title = parts.length >= 2 ? parts[1] : parts[0] || "";

        if (title && url) {
          articles.push({
            title: title.slice(0, 200),
            url,
            author: "조쉬",
            category: source.category,
            published_at: new Date().toISOString(),
            source_id: source.id,
          });
        }
      });
    }

    // 개별 페이지에서 날짜 추출 (상위 20개만)
    for (const a of articles.slice(0, 20)) {
      try {
        const res = await fetch(a.url, { headers: { "User-Agent": "DevFeed/1.0 RSS Reader" } });
        const html = await res.text();
        const dateMatch = html.match(/(\d{4})\.(\d{2})\.(\d{2})/);
        if (dateMatch) {
          a.published_at = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`).toISOString();
        }
      } catch {
        // keep default date
      }
    }

    return articles;
  } catch (e) {
    console.error(`[fetchMaily] ${source.url}:`, e);
    return [];
  }
}

// ── eo planet Fetcher (sitemap) ─────────────────────────
async function fetchEoPlanet(source: { id: string; url: string; category: string }): Promise<ArticleData[]> {
  try {
    const sitemapRes = await fetch(`${source.url}/sitemap.xml`, {
      headers: { "User-Agent": "DevFeed/1.0 RSS Reader" },
    });
    const sitemapXml = await sitemapRes.text();
    const $ = cheerio.load(sitemapXml, { xmlMode: true });

    const urls: { url: string; lastmod: string }[] = [];
    $("url").each((_, el) => {
      const loc = $(el).find("loc").text();
      const lastmod = $(el).find("lastmod").text();
      if (loc.includes("/magazines/")) {
        urls.push({ url: loc, lastmod });
      }
    });

    urls.sort((a, b) => new Date(b.lastmod).getTime() - new Date(a.lastmod).getTime());
    const top30 = urls.slice(0, 30);

    const results = await Promise.allSettled(
      top30.map(async ({ url, lastmod }) => {
        const res = await fetch(url, { headers: { "User-Agent": "DevFeed/1.0 RSS Reader" } });
        const html = await res.text();
        const page = cheerio.load(html);
        const title = page(".main-title").text().trim() || page("h1").text().trim();

        // 개별 페이지에서 실제 발행일 추출 (YYYY. MM. DD 형식)
        const dateMatch = html.match(/(\d{4})\.\s*(\d{2})\.\s*(\d{2})/);
        const publishedAt = dateMatch
          ? new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`).toISOString()
          : new Date(lastmod).toISOString();

        return {
          title: title || "Untitled",
          url,
          category: source.category,
          published_at: publishedAt,
          source_id: source.id,
        };
      }),
    );

    return results
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<ArticleData>).value);
  } catch (e) {
    console.error(`[fetchEoPlanet] ${source.url}:`, e);
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
      if (s.type === "maily") return fetchMaily(s);
      if (s.type === "eopla") return fetchEoPlanet(s);
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

  // Deduplicate against existing URLs (chunk .in() queries to avoid PostgREST URL length limit)
  const urls = allArticles.map((a) => a.url);
  const existingUrls = new Set<string>();
  const urlChunkSize = 50;
  for (let i = 0; i < urls.length; i += urlChunkSize) {
    const urlChunk = urls.slice(i, i + urlChunkSize);
    const { data: existing } = await db.from("article").select("url").in("url", urlChunk);
    for (const e of existing ?? []) existingUrls.add(e.url);
  }

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

  // Generate notifications for users who favorited these sources
  let notificationsCreated = 0;
  if (inserted > 0) {
    // Get source_ids of newly inserted articles
    const newSourceIds = [...new Set(newArticles.map((a) => a.source_id))];

    // Find users who favorited these sources
    const { data: favorites } = await db
      .from("favorite_source")
      .select("user_id, source_id")
      .in("source_id", newSourceIds);

    if (favorites?.length) {
      // Get inserted articles' IDs by URL
      const insertedUrls = newArticles.slice(0, inserted).map((a) => a.url);
      const insertedArticles: { id: number; url: string; source_id: string }[] = [];
      for (let i = 0; i < insertedUrls.length; i += urlChunkSize) {
        const chunk = insertedUrls.slice(i, i + urlChunkSize);
        const { data } = await db.from("article").select("id, url, source_id").in("url", chunk);
        if (data) insertedArticles.push(...data);
      }

      // Build notification records: each user × each article from their favorited sources
      const articlesBySource = new Map<string, { id: number }[]>();
      for (const a of insertedArticles) {
        const list = articlesBySource.get(a.source_id) ?? [];
        list.push({ id: a.id });
        articlesBySource.set(a.source_id, list);
      }

      const notifications: { user_id: number; article_id: number; source_id: string }[] = [];
      for (const fav of favorites) {
        const articles = articlesBySource.get(fav.source_id);
        if (!articles) continue;
        for (const a of articles) {
          notifications.push({
            user_id: fav.user_id,
            article_id: a.id,
            source_id: fav.source_id,
          });
        }
      }

      // Bulk insert notifications in chunks
      for (let i = 0; i < notifications.length; i += chunkSize) {
        const chunk = notifications.slice(i, i + chunkSize);
        const { error: nErr } = await db.from("notification").insert(chunk);
        if (nErr) {
          console.error("[fetch-feeds] notification insert error:", nErr);
        } else {
          notificationsCreated += chunk.length;
        }
      }
    }
  }

  return ok({
    success: true,
    inserted,
    total_fetched: totalFetched,
    duplicates_skipped: duplicatesSkipped,
    notifications_created: notificationsCreated,
    timestamp: new Date().toISOString(),
  });
}
