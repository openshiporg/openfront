import { NextResponse } from "next/server";
import { checkAuth } from "@keystone/utils/checkAuth";

const basePath = "/dashboard";

export async function middleware(request) {
  // Only apply middleware logic to /dashboard routes
  if (!request.nextUrl.pathname.startsWith(basePath)) {
    return NextResponse.next();
  }

  const { authenticatedItem: isAuth, redirectToInit } =
    await checkAuth(request);

  // Paths that don't require authentication
  const publicPaths = [
    `${basePath}/signin`,
    `${basePath}/signup`,
    `${basePath}/reset`,
    `${basePath}/init`,
  ];
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Check if sign-ups are allowed
  const allowSignUp = true;

  if (
    redirectToInit &&
    !request.nextUrl.pathname.startsWith(`${basePath}/init`)
  ) {
    return NextResponse.redirect(new URL(`${basePath}/init`, request.url));
  }

  if (
    !redirectToInit &&
    request.nextUrl.pathname.startsWith(`${basePath}/init`)
  ) {
    return NextResponse.redirect(new URL(basePath, request.url));
  }

  if (isPublicPath) {
    if (isAuth && !request.nextUrl.pathname.startsWith(`${basePath}/reset`)) {
      return NextResponse.redirect(new URL(basePath, request.url));
    }
    // Redirect to sign-in if sign-ups are not allowed and the user is trying to access the signup page
    if (
      request.nextUrl.pathname.startsWith(`${basePath}/signup`) &&
      !allowSignUp
    ) {
      return NextResponse.redirect(new URL(`${basePath}/signin`, request.url));
    }
    return NextResponse.next();
  }

  if (!isAuth) {
    const from = request.nextUrl.pathname + request.nextUrl.search;
    return NextResponse.redirect(
      new URL(
        `${basePath}/signin?from=${encodeURIComponent(from)}`,
        request.url
      )
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: `${basePath}/:path*`,
};
