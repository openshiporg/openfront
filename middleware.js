import { NextResponse } from "next/server";
import { checkAuth } from "@keystone/utils/checkAuth";
import { gql } from "graphql-request";
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
    try {
      const { regions } = await openfrontClient.request(
        gql`
          query {
            regions {
              countries {
                id
                iso2
                iso3
              }
            }
          }
        `,
        {},
        request.cookies ? { cookie: request.cookies } : undefined
      );

      regionMapCache.regionMap.clear();
      if (regions?.length) {
        regions.forEach((region) => {
          region.countries.forEach((country) => {
            regionMapCache.regionMap.set(country.iso2.toLowerCase(), region);
          });
        });
      } else {
        regionMapCache.regionMap.set('us', { countries: [{ iso2: 'US' }] });
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
      if (!regionMapCache.regionMap.size) {
        regionMapCache.regionMap.set('us', { countries: [{ iso2: 'US' }] });
      }
    }

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
  const cartIdCookie = request.cookies.get("_openfront_cart_id");
  const fromPath = searchParams.get("from");

  // Handle redirectToInit for all routes (including root)
  if (redirectToInit) {
    const isInitRoute = request.nextUrl.pathname.startsWith(`${basePath}/init`);
    if (!isInitRoute) {
      return NextResponse.redirect(new URL(`${basePath}/init`, request.url));
    }
    return NextResponse.next();
  }

  // Handle dashboard routes
  if (request.nextUrl.pathname.startsWith(basePath)) {
    const isInitRoute = request.nextUrl.pathname.startsWith(`${basePath}/init`);
    const isSigninRoute = request.nextUrl.pathname.startsWith(`${basePath}/signin`);
    const isNoAccessRoute = request.nextUrl.pathname.startsWith(`${basePath}/no-access`);

    // If redirectToInit is false, prevent access to init page
    if (isInitRoute) {
      return NextResponse.redirect(new URL(basePath, request.url));
    }

    // Handle authentication for non-init routes
    if (!user && !isSigninRoute) {
      const signinUrl = new URL(`${basePath}/signin`, request.url);
      // Only set 'from' param if not redirecting from no-access
      if (!isNoAccessRoute) {
        signinUrl.searchParams.set("from", request.nextUrl.pathname);
      }
      return NextResponse.redirect(signinUrl);
    }

    // Redirect to dashboard if already authenticated and trying to access signin
    if (user && isSigninRoute) {
      // If there's a 'from' path and it's not no-access, use it
      if (fromPath && !fromPath.includes('no-access')) {
        return NextResponse.redirect(new URL(fromPath, request.url));
      }
      return NextResponse.redirect(new URL(basePath, request.url));
    }

    // Check role permissions for dashboard access
    if (user && !isNoAccessRoute && !user.role?.canManageOrders) {
      return NextResponse.redirect(new URL(`${basePath}/no-access`, request.url));
    }
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|favicon.ico).*)"],
};

