import { NextRequest } from "next/server";
import { db } from "@/lib/db/supabase";
import { getCurrentUser } from "@/lib/auth/getUser";
import { ok, err } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return err("인증이 필요합니다.", 401);

  const { data } = await db
    .from("favorite_source")
    .select("source_id")
    .eq("user_id", user.id);

  return ok((data ?? []).map((row) => row.source_id));
}
