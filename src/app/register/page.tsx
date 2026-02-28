"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock, User } from "lucide-react";

import { extractErrorMessage } from "@/lib/utils";
import { useAuth } from "@/features/auth/AuthContext";
import { registerApi } from "@/features/auth/api";

function getPasswordStrength(password: string): { level: number; label: string; color: string } {
  if (!password) return { level: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 6) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: "약함", color: "bg-destructive" };
  if (score <= 2) return { level: 2, label: "보통", color: "bg-yellow-500" };
  return { level: 3, label: "강함", color: "bg-teal" };
}

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        const result = await registerApi({ email, password, nickname });
        login(result.access_token, result.refresh_token, result.user);
        router.push("/");
      } catch (err: unknown) {
        setError(extractErrorMessage(err, "회원가입에 실패했습니다. 다시 시도해주세요."));
      } finally {
        setLoading(false);
      }
    },
    [email, password, nickname, login, router],
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-[480px] rounded-[16px] border border-border bg-card p-10">
        <div className="mb-8 flex flex-col items-center gap-2">
          <h1 className="font-sans text-4xl font-bold text-orange">DEVFEED</h1>
          <p className="font-mono text-xs text-muted-foreground">
            계정을 만들어보세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="rounded-[16px] bg-destructive/20 p-3 font-mono text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="register-email" className="font-mono text-xs font-semibold">
              이메일
            </label>
            <div className="flex h-11 items-center gap-2 rounded-[16px] bg-elevated px-4">
              <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                id="register-email"
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
            <label htmlFor="register-nickname" className="font-mono text-xs font-semibold">
              닉네임
            </label>
            <div className="flex h-11 items-center gap-2 rounded-[16px] bg-elevated px-4">
              <User className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                id="register-nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                placeholder="닉네임을 입력하세요"
                className="w-full border-0 bg-transparent font-mono text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="register-password" className="font-mono text-xs font-semibold">
              비밀번호
            </label>
            <div className="flex h-11 items-center gap-2 rounded-[16px] bg-elevated px-4">
              <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="********"
                className="w-full border-0 bg-transparent font-mono text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            {password && (
              <div className="flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        i <= getPasswordStrength(password).level
                          ? getPasswordStrength(password).color
                          : "bg-elevated"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {getPasswordStrength(password).label}
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 items-center justify-center gap-2 rounded-[16px] bg-orange font-mono text-sm font-semibold text-text-dark transition-colors hover:bg-orange/90 disabled:opacity-50"
          >
            {loading ? (
              "가입 중..."
            ) : (
              <>
                <UserPlus className="h-[18px] w-[18px]" />
                회원가입
              </>
            )}
          </button>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="font-mono text-[11px] text-muted-foreground">또는</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="text-center font-mono text-xs text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="font-semibold text-orange hover:text-orange/80">
              로그인
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
