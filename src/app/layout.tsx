import type { Metadata } from "next";
import Script from "next/script";
import { Oswald, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/features/auth/AuthContext";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { Analytics } from "@vercel/analytics/react";

const GA_ID = "G-CBYZ2D50VB";

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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.devfeed.kr",
  ),
  title: {
    default: "DevFeed - 개발자 기술 뉴스 모음",
    template: "%s | DevFeed",
  },
  description:
    "GeekNews, 요즘IT, 카카오테크, 토스 테크, 네이버 D2, HackerNews, Dev.to 등 국내외 주요 기술 블로그와 커뮤니티의 최신 글을 한 피드에서 모아보세요.",
  openGraph: {
    title: "DevFeed - 개발자 기술 뉴스 모음",
    description:
      "GeekNews, 요즘IT, 카카오테크, 토스 테크, 네이버 D2, HackerNews, Dev.to 등 국내외 주요 기술 블로그와 커뮤니티의 최신 글을 한 피드에서 모아보세요.",
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
      <head>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
      </head>
      <body
        className={`${oswald.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
          <Toaster position="top-right" richColors closeButton />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
