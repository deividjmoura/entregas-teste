import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "entregas_acesso";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const liberado =
    pathname.startsWith("/acesso") ||
    pathname.startsWith("/api/acesso") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/notification.mp3";

  if (liberado) return NextResponse.next();

  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (cookie && cookie === process.env.ACCESS_TOKEN) {
    return NextResponse.next();
  }

  // NOVO: aceita o mesmo token via header Authorization (usado pelo app Flutter)
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;
  if (bearerToken && bearerToken === process.env.ACCESS_TOKEN) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/acesso";
  url.searchParams.set("redirect", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};