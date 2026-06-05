import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  id: string;
  role: "visitor" | "creator";
}

export default function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;

  // Auth pages
  const isAuthRoute =
    pathname === "/login" || pathname === "/register";

  // User not logged in
  if (!token) {
    if (isAuthRoute) {
      return NextResponse.next();
    }

    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  // Decode token
  let user: TokenPayload;

  try {
    user = jwtDecode<TokenPayload>(token);
  } catch {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  // Logged-in users cannot access login/register
  if (isAuthRoute) {
    return NextResponse.redirect(
      new URL("/feed", request.url)
    );
  }

  // Visitor restrictions
  if (user.role === "visitor") {
    // Visitor cannot access dashboard
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(
        new URL("/feed", request.url)
      );
    }
  }

  // Creator can access both feed and dashboard
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/feed/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
};