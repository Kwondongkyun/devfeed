# DevFeed Public API

DevFeed에서 수집한 기술 아티클을 조회할 수 있는 공개 API입니다.

## Base URL

```
https://devfeed.kr/api/v1/public
```

## 인증

모든 요청에 `x-api-key` 헤더가 필요합니다.

```
x-api-key: YOUR_API_KEY
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
- `뉴스레터`
- `스타트업`

#### 응답

```json
{
  "success": true,
  "result": {
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

## 사용 예시

### 최신 아티클 조회

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://devfeed.kr/api/v1/public/articles"
```

### 카테고리 필터

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://devfeed.kr/api/v1/public/articles?category=AI%20기업%20블로그&limit=5"
```

### 검색

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://devfeed.kr/api/v1/public/articles?search=React&limit=10"
```

### 페이지네이션

```bash
# 1페이지
curl -H "x-api-key: YOUR_API_KEY" \
  "https://devfeed.kr/api/v1/public/articles?limit=20"

# 2페이지 (이전 응답의 next_cursor 사용)
curl -H "x-api-key: YOUR_API_KEY" \
  "https://devfeed.kr/api/v1/public/articles?limit=20&cursor=2312"
```
