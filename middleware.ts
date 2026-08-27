import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes (/api/*)
     * - Next.js internals (/_next/*)
     * - Static asset files (/favicon.ico, /uploads/*, /.*)
     */
    "/((?!api/|_next/static|_next/image|favicon.ico|uploads/|.*\\..*).*)",
  ],
};

const AUTH_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"];

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host") || "";

  // Normalize host (remove port in local/dev)
  const currentHost = hostname.replace(/:\d+$/, "").toLowerCase();

  // If visiting /admin/login on any host, redirect/rewrite to /login
  if (url.pathname === "/admin/login") {
    url.pathname = "/login";
    return NextResponse.rewrite(url);
  }

  // 1. Admin & SuperAdmin Subdomains (admin.stayntour.com / superadmin.stayntour.com)
  if (currentHost.startsWith("admin.") || currentHost.startsWith("superadmin.")) {
    // Allow login, signup, forgot-password without rewriting to /admin/*
    if (AUTH_PATHS.includes(url.pathname)) {
      return NextResponse.next();
    }

    // If the path does not already start with /admin, prefix it with /admin
    if (!url.pathname.startsWith("/admin")) {
      const newPath = url.pathname === "/" ? "/admin/dashboard" : `/admin${url.pathname}`;
      url.pathname = newPath;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // 2. Partner / List Property Subdomains (partner.stayntour.com / listproperty.stayntour.com)
  if (currentHost.startsWith("partner.") || currentHost.startsWith("listproperty.")) {
    if (AUTH_PATHS.includes(url.pathname)) {
      return NextResponse.next();
    }
    if (url.pathname === "/") {
      url.pathname = "/partner";
      return NextResponse.rewrite(url);
    }
    if (url.pathname === "/list" || url.pathname === "/new") {
      url.pathname = "/list-property";
      return NextResponse.rewrite(url);
    }
    if (url.pathname === "/dashboard") {
      url.pathname = "/property-owner/dashboard";
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // 3. Main Customer Website (stayntour.com, www.stayntour.com, localhost)
  return NextResponse.next();
}
