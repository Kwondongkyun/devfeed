import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";
import { db } from "@/lib/db/supabase";

export interface AuthUser {
  id: number;
  email: string;
  nickname: string;
}

export async function getCurrentUser(
  req: NextRequest,
): Promise<AuthUser | null> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  const token = auth.slice(7);
  const userId = verifyToken(token, "access");
  if (!userId) return null;

  const { data } = await db
    .from("user")
    .select("id, email, nickname")
    .eq("id", userId)
    .single();

  return data ?? null;
}
