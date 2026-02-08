import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // RSS 애그리게이터 특성상 다양한 외부 소스의 이미지를 표시해야 하므로 전체 허용
    // isSafeUrl 검증으로 프론트엔드에서 URL 안전성을 보장
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
