import { NextRequest } from "next/server";
import { db } from "@/lib/db/supabase";
import { getCurrentUser } from "@/lib/auth/getUser";
import { ok, err } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return err("인증이 필요합니다.", 401);

  const { data, error } = await db
    .from("bookmark")
    .select("article_id")
    .eq("user_id", user.id);

  if (error) return err("북마크 조회에 실패했습니다.", 500);

  return ok((data ?? []).map((row) => row.article_id));
}
