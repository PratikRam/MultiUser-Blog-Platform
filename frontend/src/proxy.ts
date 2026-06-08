import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  id: string;
  role: "visitor" | "creator";
}

export default function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;

  const isAuthPage =
    pathname === "/login" || pathname === "/register" || pathname === "/forgot-password";

  // Not logged in
  if (!token) {
    return isAuthPage
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login", request.url));
  }

  let user: TokenPayload;

  try {
    user = jwtDecode<TokenPayload>(token);
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Logged-in users cannot visit login/register/forgot-password
  if (isAuthPage) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  // Visitor cannot access dashboard
  if (
    user.role === "visitor" &&
    pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/feed/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};