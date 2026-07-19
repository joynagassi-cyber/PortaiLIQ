import { NextResponse } from "next/server";

export async function middleware(request: Request) {
  const url = new URL(request.url);
  
  // Allow public routes
  const publicPaths = ["/", "/signin", "/signup", "/portal/", "/api/portal/", "/api/gumroad/webhook"];
  const isPublic = publicPaths.some((path) => url.pathname.startsWith(path));

  if (isPublic) {
    return NextResponse.next();
  }

  // Check for auth session
  const sessionCookie = request.headers.get("cookie")?.includes("sb-");
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/cron).*)"],
};
