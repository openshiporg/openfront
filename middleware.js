import { NextResponse } from "next/server";
import { checkAuth } from "@keystone/utils/checkAuth";
import { GraphQLClient, gql } from "graphql-request";

const basePath = "/dashboard";
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us";

function gqlClient(req) {
  return new GraphQLClient(`${process.env.FRONTEND_URL}/api/graphql`, {
    headers: req ? { cookie: req.cookies } : undefined,
    credentials: "include",
    fetch,
  });
}

const regionMapCache = {
  regionMap: new Map(),
  regionMapUpdated: Date.now(),
};

async function getRegionMap(request) {
  const { regionMap, regionMapUpdated } = regionMapCache;

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    const client = gqlClient(request);
    const query = gql`
      query {
        regions {
          countries {
            id
            iso2
            iso3
          }
        }
      }
    `;

    const { regions } = await client.request(query);

    if (!regions) {
      throw new Error("Regions not found");
    }

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

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase();

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
  // Handle country redirect for non-dashboard routes
  if (!request.nextUrl.pathname.startsWith(basePath)) {
    const regionMap = await getRegionMap(request);
    const countryCode = await getCountryCode(request, regionMap);

    const urlHasCountryCode =
      countryCode && request.nextUrl.pathname.split("/")[1].includes(countryCode);

    if (!urlHasCountryCode && countryCode) {
      const redirectPath =
        request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname;
      const queryString = request.nextUrl.search ? request.nextUrl.search : "";
      const redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`;
      return NextResponse.redirect(redirectUrl, 307);
    }

    return NextResponse.next();
  }

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
  matcher: ["/((?!api|_next/static|favicon.ico).*)"],
};
