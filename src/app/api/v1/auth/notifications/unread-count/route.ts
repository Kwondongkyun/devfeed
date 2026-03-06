import { NextRequest } from "next/server";
import { db } from "@/lib/db/supabase";
import { getCurrentUser } from "@/lib/auth/getUser";
import { ok, err } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return err("인증이 필요합니다.", 401);

  const { count, error } = await db
    .from("notification")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) return err("알림 개수 조회에 실패했습니다.", 500);

  return ok({ count: count ?? 0 });
}
