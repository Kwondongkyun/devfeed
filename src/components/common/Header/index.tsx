"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, LogIn, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { useAuth } from "@/features/auth/AuthContext";
import { NotificationBell } from "@/components/common/NotificationBell";

export function Header() {
  const { user, loading, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8 lg:px-12">
        <Link href="/" className="flex cursor-pointer items-center gap-3">
          <span className="font-sans text-2xl font-bold text-orange">
            DEVFEED
          </span>
          <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
            개발자 기술 뉴스 모음
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <Link
                    href="/mypage?tab=bookmarks"
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[16px] text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground"
                    aria-label="저장한 글"
                  >
                    <Bookmark className="h-[18px] w-[18px]" />
                  </Link>
                  <Link
                    href="/mypage"
                    className="hidden cursor-pointer font-mono text-xs text-muted-foreground transition-colors hover:text-foreground sm:block max-w-[80px] truncate"
                  >
                    {user.nickname}
                  </Link>
                  <button
                    onClick={logout}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[16px] font-mono text-xs text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground sm:h-auto sm:w-auto sm:gap-1.5 sm:px-3 sm:py-1.5"
                    aria-label="로그아웃"
                  >
                    <LogOut className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">로그아웃</span>
                  </button>
                  <NotificationBell />
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex cursor-pointer items-center gap-2 rounded-[16px] bg-orange px-4 py-2 font-mono text-xs font-semibold text-text-dark transition-colors hover:bg-orange/90"
                >
                  <LogIn className="h-4 w-4" />
                  로그인
                </Link>
              )}
            </>
          )}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[16px] bg-elevated text-muted-foreground transition-colors hover:text-foreground"
            aria-label="테마 전환"
          >
            {mounted ? (
              theme === "dark" ? (
                <Sun className="h-[18px] w-[18px]" />
              ) : (
                <Moon className="h-[18px] w-[18px]" />
              )
            ) : (
              <div className="h-[18px] w-[18px]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
