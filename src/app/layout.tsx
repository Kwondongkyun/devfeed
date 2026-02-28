import type { Metadata } from "next";
import { Oswald, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/features/auth/AuthContext";
import { ThemeProvider } from "@/lib/providers/theme-provider";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "DevFeed - 개발자 기술 뉴스 모음",
    template: "%s | DevFeed",
  },
  description:
    "Hacker News, Dev.to, 한국 테크 블로그 등 개발자 기술 뉴스를 한곳에서 모아보세요.",
  openGraph: {
    title: "DevFeed - 개발자 기술 뉴스 모음",
    description:
      "Hacker News, Dev.to, 한국 테크 블로그 등 개발자 기술 뉴스를 한곳에서 모아보세요.",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${oswald.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
