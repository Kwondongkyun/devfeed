import { NextRequest } from "next/server";
import { db } from "@/lib/db/supabase";
import { getCurrentUser } from "@/lib/auth/getUser";
import { ok, err } from "@/lib/api/response";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return err("인증이 필요합니다.", 401);

  const body = await req.json();

  if (body.all) {
    const { error } = await db
      .from("notification")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) return err("읽음 처리에 실패했습니다.", 500);
  } else if (body.notificationIds?.length) {
    const { error } = await db
      .from("notification")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .in("id", body.notificationIds);

    if (error) return err("읽음 처리에 실패했습니다.", 500);
  }

  return ok(null);
}
