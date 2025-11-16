import type { NextRequest } from "next/server";
import { handleDashboardRoutes, getAuthenticatedUser } from "@/features/dashboard/middleware";
import { handleStorefrontRoutes } from "@/features/storefront/middleware";
import { NextResponse } from "next/server";

const dashboardPath = "/dashboard";

// Main middleware function that handles all routes
export async function proxy(request: NextRequest) {
  // Get authenticated user once
  const { user, redirectToInit } = await getAuthenticatedUser(request);

  // If redirectToInit is true (no users exist) and user is on storefront, redirect to dashboard init
  if (redirectToInit && !request.nextUrl.pathname.startsWith(`${dashboardPath}/init`)) {
    return NextResponse.redirect(new URL(`${dashboardPath}/init`, request.url));
  }

  // Let each handler manage its own routes and logic
  const response = await handleDashboardRoutes(request, user, redirectToInit);
  
  // If dashboard handler didn't handle the route, pass to storefront
  if (!response) {
    return handleStorefrontRoutes(request, user);
  }
  
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.svg|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
};