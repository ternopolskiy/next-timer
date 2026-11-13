import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { safeCallbackUrl } from "@/lib/url";

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname, search } = request.nextUrl;
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (token && isAuthPage) {
    const callbackUrl = safeCallbackUrl(
      request.nextUrl.searchParams.get("callbackUrl")
    );
    return NextResponse.redirect(new URL(callbackUrl, request.url));
  }

  if (!token && !isAuthPage) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/event/:path*", "/settings/:path*", "/login", "/register"],
};
