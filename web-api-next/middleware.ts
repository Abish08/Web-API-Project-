import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const userDataCookie = request.cookies.get("user_data")?.value;
  const { pathname } = request.nextUrl;

  // Parse user data to get role
  let userRole = null;
  if (userDataCookie) {
    try {
      const userData = JSON.parse(userDataCookie);
      userRole = userData.role;
    } catch (error) {
      console.error("Failed to parse user data:", error);
    }
  }

  // Protected routes (match your actual folders)
  const protectedRoutes = ["/dashboard", "/profile", "/password"];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Admin routes
  const adminRoutes = ["/admin"];
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Auth routes
  const authRoutes = ["/login", "/register", "/forgot-password", "/verify-otp", "/reset-password"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If accessing admin route without token → redirect to login
  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If accessing admin route but not admin → redirect to dashboard
  if (isAdminRoute && token && userRole !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If accessing protected route without token → redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If logged in and accessing auth routes → redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/password/:path*", "/admin/:path*", "/login", "/register", "/forgot-password", "/verify-otp", "/reset-password"],
};
