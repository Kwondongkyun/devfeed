import { NextRequest } from "next/server";
import { db } from "@/lib/db/supabase";
import { ok, err } from "@/lib/api/response";

async function fetchOgImage(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "DevFeed/1.0 Bot" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return undefined;
    const html = await res.text();
    const headEnd = html.indexOf("</head>");
    const head = headEnd > -1 ? html.slice(0, headEnd) : html.slice(0, 10000);
    const match =
      head.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      head.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    return match?.[1] || undefined;
  } catch {
    return undefined;
  }
}

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return err("Unauthorized", 401);
    }
  }

  // image_url이 null인 아티클 조회
  const { data: articles, error } = await db
    .from("article")
    .select("id, url")
    .is("image_url", null)
    .order("id", { ascending: false });

  if (error) return err("Failed to fetch articles", 500);
  if (!articles?.length) return ok({ updated: 0, total: 0 });

  let updated = 0;
  const batchSize = 10;

  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);

    const results = await Promise.allSettled(
      batch.map(async (a) => {
        const ogImage = await fetchOgImage(a.url);
        if (!ogImage) return null;
        const { error: updateErr } = await db
          .from("article")
          .update({ image_url: ogImage })
          .eq("id", a.id);
        return updateErr ? null : a.id;
      }),
    );

    for (const r of results) {
      if (r.status === "fulfilled" && r.value !== null) updated++;
    }
  }

  return ok({ updated, total: articles.length });
}
