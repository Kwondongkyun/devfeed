import { NextRequest } from "next/server";
import { db } from "@/lib/db/supabase";
import { verifyPassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { ok, err } from "@/lib/api/response";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return err("이메일과 비밀번호를 입력해주세요.", 400);
  }

  const { data: user } = await db
    .from("user")
    .select("id, email, nickname, password_hash")
    .eq("email", email)
    .single();

  if (!user) {
    return err("이메일 또는 비밀번호가 올바르지 않습니다.", 401);
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return err("이메일 또는 비밀번호가 올바르지 않습니다.", 401);
  }

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  return ok({
    access_token: accessToken,
    refresh_token: refreshToken,
    user: { id: user.id, email: user.email, nickname: user.nickname },
  });
}
