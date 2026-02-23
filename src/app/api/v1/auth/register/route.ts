import { NextRequest } from "next/server";
import { db } from "@/lib/db/supabase";
import { hashPassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { ok, err } from "@/lib/api/response";

export async function POST(req: NextRequest) {
  const { email, password, nickname } = await req.json();

  if (!email || !password || !nickname) {
    return err("이메일, 비밀번호, 닉네임을 모두 입력해주세요.", 400);
  }

  const { data: existing } = await db
    .from("user")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return err("이미 사용 중인 이메일입니다.", 400);
  }

  const passwordHash = await hashPassword(password);

  const { data: user, error } = await db
    .from("user")
    .insert({ email, password_hash: passwordHash, nickname })
    .select("id, email, nickname")
    .single();

  if (error || !user) {
    return err("회원가입에 실패했습니다.", 500);
  }

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  return ok({
    access_token: accessToken,
    refresh_token: refreshToken,
    user: { id: user.id, email: user.email, nickname: user.nickname },
  });
}
