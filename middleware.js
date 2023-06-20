import { checkAuth } from "@keystone/utils/checkAuth";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const { authenticatedItem: isAuth, redirectToInit } = await checkAuth(req);
  const isInitPage = req.nextUrl.pathname.startsWith("/dashboard/init");
  const isSignInPage = req.nextUrl.pathname.startsWith("/dashboard/signin");

  if (redirectToInit && !isInitPage) {
    console.log("type 1");
    return NextResponse.redirect(new URL("/dashboard/init", req.url));
  } else if (!redirectToInit && isInitPage) {
    // Redirect away from /dashboard/init if redirectToInit is not true
    console.log("type new");
    return NextResponse.redirect(new URL("/dashboard", req.url));
  } else if (isSignInPage) {
    console.log("type 2");

    if (isAuth) {
      console.log("type 3");

      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return null;
  } else if (!isAuth && !isInitPage) {
    // Added a condition to check if the user is not on the '/dashboard/init' page
    console.log("type 4");

    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/dashboard/signin?from=${encodeURIComponent(from)}`, req.url)
    );
  }
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/dashboard/signin",
    "/dashboard/init",
  ],
};
