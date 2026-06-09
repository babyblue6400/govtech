import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value;

  // Best-effort audit log
  if (accessToken) {
    try {
      const payload = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET!) as { userId: number };
      await prisma.auditLog.create({
        data: { action: "logout", userId: payload.userId, metadata: {} },
      });
    } catch { /* token already expired — log nothing */ }
  }

  const res = NextResponse.json({ message: "Logged out" });

  const isProd = process.env.NODE_ENV === "production";

  const clear = { httpOnly: true, secure: isProd, sameSite: "strict" as const, path: "/", maxAge: 0 };
  res.cookies.set("access_token", "", clear);
  res.cookies.set("refresh_token", "", clear);
  return res;
}