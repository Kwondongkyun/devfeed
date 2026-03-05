import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    has_supabase_url: !!process.env.SUPABASE_URL,
    has_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    has_cron_secret: !!process.env.CRON_SECRET,
    node_env: process.env.NODE_ENV,
    supabase_url_prefix: process.env.SUPABASE_URL?.slice(0, 20) || "NOT_SET",
  });
}
