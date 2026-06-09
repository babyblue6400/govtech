import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";

function hashWithSalt(salt: string, password: string) {
  return crypto.createHash("sha256").update(salt + password).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || hashWithSalt(user.salt, password) !== user.passwordHash) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const payload = { userId: user.userId, role: user.role.roleName };

    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });

    await prisma.auditLog.create({
      data: { action: "login", userId: user.userId, metadata: { email } },
    });

    const res = NextResponse.json({
      message: "Login successful",
      user: { id: user.userId, name: user.name, email: user.email, role: user.role.roleName },
    });

    const isProd = process.env.NODE_ENV === "production";

    const cookieOpts = { httpOnly: true, secure: isProd, sameSite: "strict" as const, path: "/" };
    res.cookies.set("access_token", accessToken, { ...cookieOpts, maxAge: 60 * 15 });
    res.cookies.set("refresh_token", refreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 7 });

    return res;

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}