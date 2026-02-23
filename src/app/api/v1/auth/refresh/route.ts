import { NextRequest } from "next/server";
import { db } from "@/lib/db/supabase";
import { verifyToken, signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { ok, err } from "@/lib/api/response";

export async function POST(req: NextRequest) {
  const { refresh_token } = await req.json();

  if (!refresh_token) {
    return err("refresh_token이 필요합니다.", 400);
  }

  const userId = verifyToken(refresh_token, "refresh");
  if (!userId) {
    return err("유효하지 않은 토큰입니다.", 401);
  }

  const { data: user } = await db
    .from("user")
    .select("id, email, nickname")
    .eq("id", userId)
    .single();

  if (!user) {
    return err("사용자를 찾을 수 없습니다.", 401);
  }

  const accessToken = signAccessToken(user.id);
  const newRefreshToken = signRefreshToken(user.id);

  return ok({
    access_token: accessToken,
    refresh_token: newRefreshToken,
    user: { id: user.id, email: user.email, nickname: user.nickname },
  });
}
