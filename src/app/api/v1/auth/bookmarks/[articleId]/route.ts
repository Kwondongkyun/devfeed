import { NextRequest } from "next/server";
import { db } from "@/lib/db/supabase";
import { getCurrentUser } from "@/lib/auth/getUser";
import { ok, err } from "@/lib/api/response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ articleId: string }> },
) {
  const user = await getCurrentUser(req);
  if (!user) return err("인증이 필요합니다.", 401);

  const { articleId } = await params;

  await db
    .from("bookmark")
    .upsert(
      { user_id: user.id, article_id: Number(articleId) },
      { onConflict: "user_id,article_id" },
    );

  return ok(null);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ articleId: string }> },
) {
  const user = await getCurrentUser(req);
  if (!user) return err("인증이 필요합니다.", 401);

  const { articleId } = await params;

  await db
    .from("bookmark")
    .delete()
    .eq("user_id", user.id)
    .eq("article_id", Number(articleId));

  return ok(null);
}
