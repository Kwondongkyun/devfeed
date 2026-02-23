import { NextRequest } from "next/server";
import { db } from "@/lib/db/supabase";
import { getCurrentUser } from "@/lib/auth/getUser";
import { ok, err } from "@/lib/api/response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sourceId: string }> },
) {
  const user = await getCurrentUser(req);
  if (!user) return err("인증이 필요합니다.", 401);

  const { sourceId } = await params;

  await db
    .from("favorite_source")
    .upsert({ user_id: user.id, source_id: sourceId }, { onConflict: "user_id,source_id" });

  return ok(null);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sourceId: string }> },
) {
  const user = await getCurrentUser(req);
  if (!user) return err("인증이 필요합니다.", 401);

  const { sourceId } = await params;

  await db
    .from("favorite_source")
    .delete()
    .eq("user_id", user.id)
    .eq("source_id", sourceId);

  return ok(null);
}
