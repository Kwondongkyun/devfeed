# DevFeed

개발자를 위한 기술 뉴스 모음. 다양한 기술 블로그, 커뮤니티, 뉴스레터의 최신 아티클을 한곳에서 확인할 수 있다.

**https://devfeed.kr**

## 주요 기능

- **피드 수집** — RSS, HackerNews API, Dev.to API에서 자동 수집 (GitHub Actions 크론잡, 매일 KST 08:00)
- **카테고리** — 개발자 커뮤니티 / AI 기업 블로그 / 한국 테크 블로그 / 뉴스레터 / 스타트업
- **소스 즐겨찾기** — 관심 소스를 즐겨찾기에 추가, 새 글 알림
- **북마크** — 아티클 저장 및 마이페이지에서 관리
- **알림** — 즐겨찾기 소스에 새 글이 올라오면 알림
- **다크모드** — 라이트/다크 테마 전환

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| UI | React 19 + Tailwind CSS 4 |
| DB | Supabase (PostgreSQL) |
| 인증 | JWT (커스텀 구현) |
| 배포 | AWS Amplify Hosting |
| 크론잡 | GitHub Actions (매일 KST 08:00) |
| 모니터링 | 별도 대시보드 (devfeed-monitor) |

## 프로젝트 구조

```
devfeed/
├── .github/workflows/          # GitHub Actions (크론잡)
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── api/v1/             #   REST API 라우트
│   │   │   ├── articles/       #     아티클 목록 조회
│   │   │   ├── sources/        #     소스 목록 조회
│   │   │   ├── auth/           #     인증 (로그인, 회원가입, 북마크, 즐겨찾기, 알림)
│   │   │   └── cron/           #     크론잡 (피드 수집)
│   │   ├── category/[slug]/    #   카테고리 상세 페이지
│   │   ├── login/              #   로그인 페이지
│   │   ├── register/           #   회원가입 페이지
│   │   └── mypage/             #   마이페이지 (소스 관리 + 저장한 글)
│   ├── components/             # UI 컴포넌트
│   │   ├── common/             #   공통 (Header, NotificationBell, SortToggle)
│   │   ├── feed/               #   피드 (ArticleCard, CategoryRow, SearchBar)
│   │   └── ui/                 #   기본 UI 컴포넌트
│   ├── features/               # 도메인 모듈
│   │   ├── auth/               #   인증 (AuthContext, API, 타입)
│   │   ├── feed/               #   피드 (articles, sources, categories)
│   │   ├── notification/       #   알림
│   │   └── shared/             #   공용 유틸
│   └── lib/                    # 유틸리티 (Supabase 클라이언트, API 헬퍼)
└── public/                     # 정적 파일
```

## 시작하기

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local에 Supabase URL, 키 등 설정

# 개발 서버 실행
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있다.

## 환경 변수

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 롤 키 (서버 전용) |
| `JWT_SECRET` | JWT 서명 시크릿 |
| `CRON_SECRET` | 크론잡 인증 토큰 |
