"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BookmarksRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/mypage?tab=bookmarks");
  }, [router]);

  return null;
}
