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
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              width: "88px",
              height: "88px",
              borderRadius: "20px",
              background: "#e94560",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            D
          </div>
          <span
            style={{
              fontSize: "80px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-2px",
            }}
          >
            DevFeed
          </span>
        </div>
        <div
          style={{
            fontSize: "36px",
            color: "#a0aec0",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          Hacker News, Dev.to, 한국 테크 블로그 등
        </div>
        <div
          style={{
            fontSize: "36px",
            color: "#a0aec0",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          개발자 기술 뉴스를 한곳에서 모아보세요
        </div>
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "52px",
          }}
        >
          {["긱뉴스", "요즘IT", "토스 테크", "카카오테크"].map((name) => (
            <div
              key={name}
              style={{
                padding: "12px 28px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.12)",
                color: "#e2e8f0",
                fontSize: "22px",
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
