# DevFeed Public API

DevFeed에서 수집한 기술 아티클을 조회할 수 있는 공개 API입니다.

## Base URL

```
https://www.devfeed.kr/api/v1/public
```

> **주의**: `devfeed.kr`은 `www.devfeed.kr`로 302 리다이렉트되며, 리다이렉트 시 커스텀 헤더가 유실됩니다. 반드시 `www.devfeed.kr`을 사용하세요.

## 인증

모든 요청에 `x-api-key` 헤더가 필요합니다.

```
x-api-key: 079d8a78ebfd5a907a899b6a60879908eb50aed02b87658a599c8b9b52815a58
```

## Endpoints

### GET /articles

수집된 아티클 목록을 조회합니다.

#### 요청

```
GET /api/v1/public/articles
```

#### 쿼리 파라미터

| 파라미터 | 타입 | 기본값 | 필수 | 설명 |
|----------|------|--------|------|------|
| `category` | string | - | X | 카테고리 필터 |
| `source` | string | - | X | 소스 ID (쉼표로 복수 지정) |
| `search` | string | - | X | 제목/요약 검색어 |
| `limit` | number | 20 | X | 조회 개수 (최대 100) |
| `sort` | string | latest | X | 정렬 (`latest` / `oldest`) |
| `cursor` | number | - | X | 페이지네이션 커서 |

**사용 가능한 카테고리:**
- `개발자 커뮤니티`
- `AI 기업 블로그`
- `한국 테크 블로그`

#### 응답

```json
{
  "success": true,
  "result": {
    "total": 1070,
    "articles": [
      {
        "id": 2332,
        "title": "How AI is helping improve heart health",
        "url": "https://blog.google/...",
        "summary": "A new Google AI initiative aims to...",
        "image_url": "https://storage.googleapis.com/...",
        "author": "John Gillman",
        "published_at": "2026-03-12T15:00:00+00:00",
        "source": {
          "id": "google-ai",
          "name": "Google AI Blog",
          "type": "rss",
          "category": "AI 기업 블로그"
        }
      }
    ],
    "next_cursor": 2327,
    "has_more": true
  }
}
```

#### Result 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `total` | number | 필터/검색 조건에 맞는 전체 아티클 수 |
| `articles` | array | 아티클 목록 |
| `next_cursor` | number \| null | 다음 페이지 커서 |
| `has_more` | boolean | 추가 페이지 존재 여부 |

#### Article 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | number | 아티클 ID |
| `title` | string | 제목 |
| `url` | string | 원문 링크 |
| `summary` | string \| null | 요약 (최대 300자) |
| `image_url` | string \| null | 썸네일 이미지 URL |
| `author` | string \| null | 작성자 |
| `published_at` | string | 발행일 (ISO 8601) |
| `source` | object | 소스 정보 |

#### Source 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | 소스 ID |
| `name` | string | 소스 이름 |
| `type` | string | 소스 타입 (`rss`, `hackernews`, `devto`) |
| `category` | string | 카테고리 |

#### 에러 응답

```json
{
  "success": false,
  "error": {
    "message": "Invalid API key"
  }
}
```

| HTTP 상태 | 설명 |
|-----------|------|
| 401 | API 키가 없거나 유효하지 않음 |
| 500 | 서버 에러 |

## 페이지네이션

이 API는 **커서 기반 페이지네이션**을 사용합니다. 한 번의 요청으로 전체 데이터를 반환하지 않으며, `limit` 단위로 나누어 조회합니다.

### 동작 방식

1. 첫 요청 시 `limit` 개수만큼 아티클이 반환됩니다 (기본 20개, 최대 100개).
2. 응답의 `has_more`가 `true`이면 다음 페이지가 존재합니다.
3. 응답의 `next_cursor` 값을 다음 요청의 `cursor` 파라미터로 전달하면 다음 페이지를 조회할 수 있습니다.
4. `has_more`가 `false`이면 마지막 페이지입니다. `next_cursor`는 `null`이 됩니다.

### 예시 흐름

```
1번째 요청: GET /articles?limit=20
  → total: 1070, articles: [20개], next_cursor: 2312, has_more: true

2번째 요청: GET /articles?limit=20&cursor=2312
  → total: 1070, articles: [20개], next_cursor: 2290, has_more: true

...반복...

마지막 요청: GET /articles?limit=20&cursor=15
  → total: 1070, articles: [10개], next_cursor: null, has_more: false
```

> **참고**: `total`은 필터/검색 조건에 맞는 전체 건수이며, `articles`는 현재 페이지의 결과만 포함합니다.

## 사용 예시

### 최신 아티클 조회

```bash
curl -H "x-api-key: 079d8a78ebfd5a907a899b6a60879908eb50aed02b87658a599c8b9b52815a58" \
  "https://www.devfeed.kr/api/v1/public/articles"
```

### 카테고리 필터

```bash
curl -H "x-api-key: 079d8a78ebfd5a907a899b6a60879908eb50aed02b87658a599c8b9b52815a58" \
  "https://www.devfeed.kr/api/v1/public/articles?category=AI%20기업%20블로그&limit=5"
```

### 검색

```bash
curl -H "x-api-key: 079d8a78ebfd5a907a899b6a60879908eb50aed02b87658a599c8b9b52815a58" \
  "https://www.devfeed.kr/api/v1/public/articles?search=React&limit=10"
```

### 페이지네이션

```bash
# 1페이지
curl -H "x-api-key: 079d8a78ebfd5a907a899b6a60879908eb50aed02b87658a599c8b9b52815a58" \
  "https://www.devfeed.kr/api/v1/public/articles?limit=20"

# 2페이지 (이전 응답의 next_cursor 사용)
curl -H "x-api-key: 079d8a78ebfd5a907a899b6a60879908eb50aed02b87658a599c8b9b52815a58" \
  "https://www.devfeed.kr/api/v1/public/articles?limit=20&cursor=2312"
```
