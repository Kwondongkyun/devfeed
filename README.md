# DevFeed

개발자를 위한 RSS/Atom 피드 수집기. 다양한 기술 블로그와 소스를 구독하고, 최신 아티클을 한곳에서 확인할 수 있다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 언어 | TypeScript (strict mode) |
| UI | React 19 + Tailwind CSS 4 + shadcn/ui |
| 상태관리 | TanStack Query (React Query) |
| 백엔드 | AWS Amplify Gen 2 (DynamoDB + Lambda) |
| 인증 | AWS Cognito |
| 배포 | AWS Amplify Hosting |

## 프로젝트 구조

```
devfeed/
├── amplify/                    # AWS Amplify 백엔드 설정
│   ├── auth/                   #   Cognito 인증 설정
│   ├── data/                   #   DynamoDB 데이터 모델 (Source, FeedItem)
│   └── functions/              #   Lambda 함수
│       └── fetch-feeds/        #     피드 자동 수집 함수
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── api/v1/             #   REST API 라우트
│   │   │   ├── feeds/          #     GET /api/v1/feeds
│   │   │   └── sources/        #     GET|POST /api/v1/sources
│   │   ├── feeds/              #   피드 목록 페이지
│   │   ├── login/              #   로그인 페이지
│   │   └── sources/            #   소스 관리 페이지
│   ├── components/             # UI 컴포넌트
│   │   ├── auth/               #   인증 (AuthProvider, LoginForm 등)
│   │   ├── feeds/              #   피드 (FeedList, FeedCard 등)
│   │   ├── layout/             #   레이아웃 (Header, Navigation 등)
│   │   ├── sources/            #   소스 관리 (SourceList, AddSourceForm 등)
│   │   └── ui/                 #   shadcn/ui 기본 컴포넌트
│   ├── hooks/                  # 커스텀 훅 (useFeeds, useSources 등)
│   ├── lib/                    # 유틸리티 (Amplify 설정, cn 헬퍼 등)
│   ├── services/               # API 서비스 레이어
│   └── types/                  # TypeScript 타입 정의
├── docs/                       # 프로젝트 문서
└── scripts/                    # 유틸리티 스크립트
```

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# Amplify 샌드박스 실행 (백엔드 개발용)
npx ampx sandbox
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있다.

## 개선할 점

### 우선순위 높음

| # | 항목 | 현재 상태 | 개선 방향 |
|---|------|-----------|-----------|
| 1 | **테스트 부재** | 테스트 파일 전무 | Vitest + React Testing Library 도입. 최소 서비스 레이어, 커스텀 훅, API 라우트에 대한 단위 테스트 작성 |
| 2 | **에러 바운더리 미설정** | 에러 시 빈 화면 또는 전체 크래시 | `error.tsx`, `global-error.tsx` 추가. React Error Boundary 컴포넌트 구현 |
| 3 | **API 인증 미들웨어 부재** | API 라우트에 인증 체크 없음 | Next.js middleware 또는 각 API 라우트에 Cognito 토큰 검증 추가 |
| 4 | **일관된 에러 응답 포맷** | API마다 에러 형식 상이 | `{ error: { code, message, details? } }` 형태의 표준 에러 응답 유틸 생성 |

### 우선순위 중간

| # | 항목 | 현재 상태 | 개선 방향 |
|---|------|-----------|-----------|
| 5 | **파일 네이밍 불일관** | kebab-case와 PascalCase 혼재 | 컴포넌트 파일은 PascalCase, 유틸/훅은 camelCase로 통일. ESLint 규칙 추가 |
| 6 | **Prettier 미설정** | 코드 포맷팅 도구 없음 | `.prettierrc` 추가하여 팀 전체 코드 스타일 통일 |
| 7 | **Optimistic Update 미적용** | 소스 추가/삭제 시 리페치 대기 | TanStack Query의 `onMutate`를 활용한 낙관적 업데이트 적용 |
| 8 | **Feature 기반 구조 미적용** | components/ 아래 도메인별 분리만 존재 | `features/feeds/`, `features/sources/` 형태로 컴포넌트-훅-서비스-타입 응집 |

### 우선순위 낮음

| # | 항목 | 현재 상태 | 개선 방향 |
|---|------|-----------|-----------|
| 9 | **Loading UI** | 로딩 상태 처리 미흡 | `loading.tsx` 및 Skeleton 컴포넌트 추가 |
| 10 | **CORS 설정** | 명시적 CORS 헤더 미설정 | API 라우트에 CORS 헤더 설정 또는 Next.js config에서 관리 |
| 11 | **환경 변수 문서화** | `.env.local` 필요 변수 목록 없음 | `.env.example` 파일 추가 |
| 12 | **CI/CD 파이프라인** | Amplify 자동 배포만 설정 | GitHub Actions로 린트, 타입 체크, 테스트 자동 실행 추가 |
