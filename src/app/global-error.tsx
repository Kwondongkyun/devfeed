"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="w-full max-w-[560px] rounded-[16px] border border-border bg-card p-10 text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-destructive/20 p-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
            </div>

            <h1 className="mb-3 font-sans text-3xl font-bold text-foreground">
              심각한 오류가 발생했습니다
            </h1>

            <p className="mb-6 font-mono text-sm text-muted-foreground">
              애플리케이션에 심각한 오류가 발생했습니다
            </p>

            {error.digest && (
              <p className="mb-6 font-mono text-xs text-muted-foreground">
                오류 ID: {error.digest}
              </p>
            )}

            <button
              onClick={reset}
              className="rounded-[16px] bg-orange px-6 py-3 font-mono text-sm font-semibold text-text-dark transition-colors hover:bg-orange/90"
            >
              앱 새로고침
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
