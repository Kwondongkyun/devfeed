import type { SourceItem } from "@/features/feed/sources/types";

export const CATEGORY_ORDER = [
  "개발자 커뮤니티",
  "AI 기업 블로그",
  "한국 테크 블로그",
] as const;

const SLUG_MAP: Record<string, string> = {
  "개발자 커뮤니티": "developer-community",
  "AI 기업 블로그": "ai-blog",
  "한국 테크 블로그": "korean-tech-blog",
};

const CATEGORY_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(SLUG_MAP).map(([k, v]) => [v, k]),
);

export function categoryToSlug(category: string): string {
  return SLUG_MAP[category] ?? encodeURIComponent(category);
}

export function slugToCategory(slug: string): string {
  return CATEGORY_MAP[slug] ?? decodeURIComponent(slug);
}

export function getSourceIdsForCategory(
  sources: SourceItem[],
  category: string,
): string[] {
  return sources.filter((s) => s.category === category).map((s) => s.id);
}

export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  "개발자 커뮤니티": "DEVELOPER_COMMUNITY",
  "AI 기업 블로그": "AI_COMPANY_BLOGS",
  "한국 테크 블로그": "KOREAN_TECH_BLOGS",
};

export const CATEGORY_ICONS: Record<string, string> = {
  "개발자 커뮤니티": "code",
  "AI 기업 블로그": "brain",
  "한국 테크 블로그": "globe",
};
