import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;
const ACCESS_EXPIRE_SEC = (Number(process.env.JWT_ACCESS_EXPIRE_MINUTES) || 30) * 60;
const REFRESH_EXPIRE_SEC = (Number(process.env.JWT_REFRESH_EXPIRE_DAYS) || 7) * 86400;

export function signAccessToken(userId: number): string {
  return jwt.sign({ sub: String(userId), type: "access" }, SECRET, {
    expiresIn: ACCESS_EXPIRE_SEC,
    algorithm: "HS256",
  });
}

export function signRefreshToken(userId: number): string {
  return jwt.sign({ sub: String(userId), type: "refresh" }, SECRET, {
    expiresIn: REFRESH_EXPIRE_SEC,
    algorithm: "HS256",
  });
}

export function verifyToken(
  token: string,
  type: "access" | "refresh",
): number | null {
  try {
    const payload = jwt.verify(token, SECRET, { algorithms: ["HS256"] }) as {
      sub: string;
      type: string;
    };
    if (payload.type !== type) return null;
    return parseInt(payload.sub, 10);
  } catch {
    return null;
  }
}
