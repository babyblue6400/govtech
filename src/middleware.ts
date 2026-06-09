import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ROLE_ROUTES: Record<string, string[]> = {
  Citizen: ["/dashboard/citizen"],
  Officer: ["/dashboard/officer"],
  Admin:   ["/dashboard/admin"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/dashboard")) return NextResponse.next();

  const token = req.cookies.get("access_token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  try {
    const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    const allowed = ROLE_ROUTES[role] ?? [];
    const permitted = allowed.some((p) => pathname.startsWith(p));
    if (!permitted) return NextResponse.redirect(new URL("/login", req.url));

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = { matcher: ["/dashboard/:path*"] };