import { NextResponse } from "next/server";
import { checkAuth } from "@keystone/utils/checkAuth";
import { GraphQLClient, gql } from "graphql-request";
import { openfrontClient } from "@storefront/lib/config";

const basePath = "/dashboard";
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us";


const regionMapCache = {
  regionMap: new Map(),
  regionMapUpdated: Date.now(),
};

async function getRegionMap(request) {
  const { regionMap, regionMapUpdated } = regionMapCache;

  if (!regionMap.keys().next().value || regionMapUpdated < Date.now() - 3600 * 1000) {
    const { regions } = await openfrontClient.request(gql`
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

    regions.forEach((region) => {
      region.countries.forEach((country) => {
        regionMapCache.regionMap.set(country.iso2.toLowerCase(), region);
      });
    });

    regionMapCache.regionMapUpdated = Date.now();
  }

  return regionMapCache.regionMap;
}

async function getCountryCode(request, regionMap) {
  try {
    let countryCode;
    const vercelCountryCode = request.headers.get("x-vercel-ip-country")?.toLowerCase();
    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase();

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

export async function middleware(request) {
  const { authenticatedItem: user, redirectToInit } = await checkAuth(request);
  const searchParams = request.nextUrl.searchParams;
  const cartId = searchParams.get("cart_id");
  const checkoutStep = searchParams.get("step");
  const cartIdCookie = request.cookies.get("_openfront_cart_id");

  // Handle redirectToInit first
  if (redirectToInit && !request.nextUrl.pathname.startsWith(`${basePath}/init`)) {
    return NextResponse.redirect(new URL(`${basePath}/init`, request.url));
  }

  // Prevent accessing init page if redirectToInit is false
  if (!redirectToInit && request.nextUrl.pathname.startsWith(`${basePath}/init`)) {
    return NextResponse.redirect(new URL(basePath, request.url));
  }

  // Only handle country code and cart_id param for non-dashboard routes
  if (!request.nextUrl.pathname.startsWith(basePath)) {
    const regionMap = await getRegionMap(request);
    const countryCode = await getCountryCode(request, regionMap);
    
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

    // If cart_id in URL params and no existing cookie, set it and redirect to address step
    if (cartId && !cartIdCookie) {
      const redirectUrl = `${request.nextUrl.href}&step=address`;
      response = NextResponse.redirect(redirectUrl);
      response.cookies.set("_openfront_cart_id", cartId, { 
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  }

  // Handle dashboard routes
  if (request.nextUrl.pathname.startsWith(basePath)) {
    // Redirect to login if not authenticated
    if (!user && !request.nextUrl.pathname.startsWith(`${basePath}/signin`)) {
      const signinUrl = new URL(`${basePath}/signin`, request.url);
      signinUrl.searchParams.set("from", request.nextUrl.pathname);
      return NextResponse.redirect(signinUrl);
    }

    // Redirect to dashboard if already authenticated and trying to access signin
    if (user && request.nextUrl.pathname.startsWith(`${basePath}/signin`)) {
      return NextResponse.redirect(new URL(basePath, request.url));
    }

    // Check permissions for specific routes
    if (user && !user.isAdmin) {
      if (request.nextUrl.pathname.startsWith(`${basePath}/admin`)) {
        return NextResponse.redirect(new URL(basePath, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|favicon.ico).*)"],
};
