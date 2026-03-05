import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "DevFeed - 개발자 기술 뉴스 모음";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "#e94560",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            D
          </div>
          <span
            style={{
              fontSize: "56px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-1px",
            }}
          >
            DevFeed
          </span>
        </div>
        <div
          style={{
            fontSize: "24px",
            color: "#a0aec0",
            textAlign: "center",
            maxWidth: "600px",
            lineHeight: 1.5,
          }}
        >
          Hacker News, Dev.to, 한국 테크 블로그 등
        </div>
        <div
          style={{
            fontSize: "24px",
            color: "#a0aec0",
            textAlign: "center",
            maxWidth: "600px",
            lineHeight: 1.5,
          }}
        >
          개발자 기술 뉴스를 한곳에서 모아보세요
        </div>
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "40px",
          }}
        >
          {["HackerNews", "Dev.to", "요즘IT", "토스", "카카오"].map((name) => (
            <div
              key={name}
              style={{
                padding: "8px 20px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.1)",
                color: "#e2e8f0",
                fontSize: "16px",
              }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
