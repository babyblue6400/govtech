import { NextRequest, NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;
  if (!refreshToken) {
    return NextResponse.json({ message: "No refresh token" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      userId: number;
      role: string;
    };

    const newAccessToken = jwt.sign(
      { userId: payload.userId, role: payload.role },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15m" }
    );

    // Rotate refresh token too
    const newRefreshToken = jwt.sign(
      { userId: payload.userId, role: payload.role },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({ message: "Tokens refreshed" });

    const isProd = process.env.NODE_ENV === "production";

    const cookieOpts = { httpOnly: true, secure: isProd, sameSite: "strict" as const, path: "/" };
    res.cookies.set("access_token", newAccessToken, { ...cookieOpts, maxAge: 60 * 15 });
    res.cookies.set("refresh_token", newRefreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 7 });

    return res;
  } catch {
    return NextResponse.json({ message: "Invalid or expired refresh token" }, { status: 401 });
  }
}