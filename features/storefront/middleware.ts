import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { openfrontClient } from "@/features/storefront/lib/config";

const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us";

const regionMapCache = {
  regionMap: new Map<string, any>(),
  regionMapUpdated: Date.now(),
};

// Fetches and caches the region map from the GraphQL API
async function getRegionMap(request: NextRequest) {
  const { regionMap, regionMapUpdated } = regionMapCache;

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    try {
      const headers = {
        cookie: request.headers.get("cookie") || "",
      };
      
      const { regions } = await openfrontClient.request(
        `query {
          regions {
            code
            countries {
              id
              iso2
              iso3
            }
          }
        }`,
        {},
        headers
      );

      regionMapCache.regionMap.clear();
      if (regions?.length) {
        regions.forEach((region: { code: string; countries: any[] }) => {
          // Map region code to region
          regionMapCache.regionMap.set(region.code.toLowerCase(), region);
          // Also map each country ISO2 code to the same region
          region.countries.forEach((country: { iso2: string }) => {
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
async function getCountryCode(request: NextRequest, regionMap: Map<string, any>) {
  try {
    let countryCode;
    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase();
    const urlCode = request.nextUrl.pathname
      .split("/")[1]
      ?.toLowerCase();

    if (urlCode && regionMap.has(urlCode)) {
      countryCode = urlCode;
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

// Handles country code redirects and cart management for storefront routes
export async function handleStorefrontRoutes(request: NextRequest, user: any | null) {
  // User is passed from the main middleware only for dashboard routes

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