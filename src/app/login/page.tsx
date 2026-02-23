"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn, Mail, Lock } from "lucide-react";

import { extractErrorMessage } from "@/lib/utils";
import { useAuth } from "@/features/auth/AuthContext";
import { loginApi } from "@/features/auth/api";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        const result = await loginApi({ email, password });
        login(result.access_token, result.refresh_token, result.user);
        router.push(searchParams.get("redirect") || "/");
      } catch (err: unknown) {
        setError(extractErrorMessage(err, "로그인에 실패했습니다. 다시 시도해주세요."));
      } finally {
        setLoading(false);
      }
    },
    [email, password, login, router, searchParams],
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-[480px] rounded-[16px] border border-border bg-card p-10">
        <div className="mb-8 flex flex-col items-center gap-2">
          <h1 className="font-sans text-4xl font-bold text-orange">DEVFEED</h1>
          <p className="font-mono text-xs text-muted-foreground">
            // sign_in_to_continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="rounded-[16px] bg-destructive/20 p-3 font-mono text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="login-email" className="font-mono text-xs font-semibold">
              email
            </label>
            <div className="flex h-11 items-center gap-2 rounded-[16px] bg-elevated px-4">
              <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full border-0 bg-transparent font-mono text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="login-password" className="font-mono text-xs font-semibold">
              password
            </label>
            <div className="flex h-11 items-center gap-2 rounded-[16px] bg-elevated px-4">
              <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="********"
                className="w-full border-0 bg-transparent font-mono text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 items-center justify-center gap-2 rounded-[16px] bg-orange font-mono text-sm font-semibold text-text-dark transition-colors hover:bg-orange/90 disabled:opacity-50"
          >
            {loading ? (
              "signing_in..."
            ) : (
              <>
                <LogIn className="h-[18px] w-[18px]" />
                sign_in
              </>
            )}
          </button>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="font-mono text-[11px] text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="text-center font-mono text-xs text-muted-foreground">
            // no_account?{" "}
            <Link href="/register" className="font-semibold text-orange hover:text-orange/80">
              register_here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
