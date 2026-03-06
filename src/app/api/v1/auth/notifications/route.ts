import { NextRequest } from "next/server";
import { db } from "@/lib/db/supabase";
import { getCurrentUser } from "@/lib/auth/getUser";
import { ok, err } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return err("인증이 필요합니다.", 401);

  const { data, error } = await db
    .from("notification")
    .select("id, is_read, created_at, article:article_id(id, title, url, source:source_id(id, name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return err("알림 조회에 실패했습니다.", 500);

  return ok(data ?? []);
}
