"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-[560px] rounded-[16px] border border-border bg-card p-10 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-destructive/20 p-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
        </div>

        <h1 className="mb-3 font-sans text-3xl font-bold text-foreground">
          문제가 발생했습니다
        </h1>

        <p className="mb-6 font-mono text-sm text-muted-foreground">
          {error.message || "예상치 못한 오류가 발생했습니다"}
        </p>

        {error.digest && (
          <p className="mb-6 font-mono text-xs text-muted-foreground">
            오류 ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 rounded-[16px] bg-orange px-6 py-3 font-mono text-sm font-semibold text-text-dark transition-colors hover:bg-orange/90"
          >
            <RefreshCw className="h-4 w-4" />
            다시 시도
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-[16px] border border-border bg-elevated px-6 py-3 font-mono text-sm font-semibold text-foreground transition-colors hover:bg-placeholder"
          >
            <Home className="h-4 w-4" />
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
