import { NextResponse } from "next/server";
import { checkAuth, gqlClient } from "@keystone/utils/checkAuth";
import { GraphQLClient, gql } from "graphql-request";

const basePath = "/dashboard";
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us";

const regionMapCache = {
  regionMap: new Map(),
  regionMapUpdated: Date.now(),
};

// Fetches and caches the region map from the GraphQL API
async function getRegionMap(request) {
  const { regionMap, regionMapUpdated } = regionMapCache;

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    const client = gqlClient(request);
    try {
      const { regions } = await client.request(gql`
        query {
          regions {
            countries {
              id
              iso2
              iso3
            }
          }
        }
      `);

      regionMapCache.regionMap.clear();
      if (regions?.length) {
        regions.forEach((region) => {
          region.countries.forEach((country) => {
            regionMapCache.regionMap.set(country.iso2.toLowerCase(), region);
          });
        });
      } else {
        regionMapCache.regionMap.set("us", { countries: [{ iso2: "US" }] });
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
      if (!regionMapCache.regionMap.size) {
        regionMapCache.regionMap.set("us", { countries: [{ iso2: "US" }] });
      }
    }

    regionMapCache.regionMapUpdated = Date.now();
  }

  return regionMapCache.regionMap;
}

// Determines the appropriate country code based on URL, headers, and defaults
async function getCountryCode(request, regionMap) {
  try {
    let countryCode;
    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase();
    const urlCountryCode = request.nextUrl.pathname
      .split("/")[1]
      ?.toLowerCase();

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode;
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode;
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION;
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value;
    }

    return countryCode;
  } catch (error) {
    console.error("Error getting the country code:", error);
  }
}

// Handles authentication and access control for dashboard routes
async function handleDashboardRoutes(request, user) {
  const isInitRoute = request.nextUrl.pathname.startsWith(`${basePath}/init`);
  const isSigninRoute = request.nextUrl.pathname.startsWith(`${basePath}/signin`);
  const isNoAccessRoute = request.nextUrl.pathname.startsWith(`${basePath}/no-access`);
  const fromPath = request.nextUrl.searchParams.get("from");

  // Prevent access to init page if not needed
  if (isInitRoute) {
    return NextResponse.redirect(new URL(basePath, request.url));
  }

  // Handle unauthenticated users
  if (!user && !isSigninRoute) {
    const signinUrl = new URL(`${basePath}/signin`, request.url);
    if (!isNoAccessRoute) {
      signinUrl.searchParams.set("from", request.nextUrl.pathname);
    }
    return NextResponse.redirect(signinUrl);
  }

  // Handle authenticated users trying to access signin
  if (user && isSigninRoute) {
    if (fromPath && !fromPath.includes("no-access")) {
      return NextResponse.redirect(new URL(fromPath, request.url));
    }
    return NextResponse.redirect(new URL(basePath, request.url));
  }

  // Check role permissions
  if (user && !isNoAccessRoute && !user.role?.canManageOrders) {
    return NextResponse.redirect(new URL(`${basePath}/no-access`, request.url));
  }

  return NextResponse.next();
}

// Handles country code redirects and cart management for storefront routes
async function handleStorefrontRoutes(request) {
  const regionMap = await getRegionMap(request);
  const countryCode = await getCountryCode(request, regionMap);
  const cartId = request.nextUrl.searchParams.get("cart_id");
  const cartIdCookie = request.cookies.get("_openfront_cart_id");

  let response;

  // Handle country code redirect
  const urlHasCountryCode = countryCode && request.nextUrl.pathname.split("/")[1]?.includes(countryCode);
  if (!urlHasCountryCode && countryCode) {
    const redirectPath = request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname;
    const queryString = request.nextUrl.search ? request.nextUrl.search : "";
    const redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`;
    response = NextResponse.redirect(redirectUrl);
  } else {
    response = NextResponse.next();
  }

  // Handle cart_id in URL
  if (cartId && !cartIdCookie) {
    const redirectUrl = `${request.nextUrl.href}&step=address`;
    response = NextResponse.redirect(redirectUrl);
    response.cookies.set("_openfront_cart_id", cartId, {
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return response;
}

// Main middleware function that handles all routes
export async function middleware(request) {
  const { authenticatedItem: user, redirectToInit } = await checkAuth(request);

  // Handle redirectToInit for all routes
  if (redirectToInit) {
    const isInitRoute = request.nextUrl.pathname.startsWith(`${basePath}/init`);
    if (!isInitRoute) {
      return NextResponse.redirect(new URL(`${basePath}/init`, request.url));
    }
    return NextResponse.next();
  }

  // Handle dashboard routes
  if (request.nextUrl.pathname.startsWith(basePath)) {
    return handleDashboardRoutes(request, user);
  }

  // Handle storefront routes
  return handleStorefrontRoutes(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|favicon.ico).*)"],
  runtime: "experimental-edge",
};
