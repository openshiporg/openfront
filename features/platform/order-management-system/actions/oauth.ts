"use server";

import { keystoneClient } from "@/features/dashboard/lib/keystoneClient";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import crypto from "crypto";

interface OAuthInstallParams {
  clientId: string;
  scope: string;
  redirectUri: string;
  state: string;
  responseType: string;
}

export async function getOAuthApp(clientId: string, scope: string, redirectUri: string, responseType: string) {
  try {
    // Validate required parameters
    if (!clientId || !redirectUri || !responseType) {
      throw new Error("Missing required parameters");
    }

    if (responseType !== "code") {
      throw new Error("Only authorization code flow is supported");
    }

    // Get current user session from cookies
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("keystonejs-session")?.value;
    
    if (!sessionToken) {
      throw new Error("User not authenticated");
    }

    // Find the OAuth app using keystoneClient
    const response = await keystoneClient(`
      query GetOAuthApp($where: OAuthAppWhereUniqueInput!) {
        oAuthApp(where: $where) {
          id
          name
          redirectUris
          scopes
          status
          description
        }
      }
    `, {
      where: { clientId }
    });

    if (!response.success) {
      throw new Error(response.error || "Failed to fetch OAuth app");
    }

    const oAuthApp = response.data?.oAuthApp;

    if (!oAuthApp) {
      throw new Error("Client not found");
    }

    if (oAuthApp.status !== "active") {
      throw new Error("Client is not active");
    }

    // Validate redirect URI
    if (!oAuthApp.redirectUris?.includes(redirectUri)) {
      console.log({oAuthApp, redirectUri});
      throw new Error("Redirect URI not registered");
    }

    // Validate scopes
    const requestedScopes = scope.includes(",") ? scope.split(",") : scope.split(" ");
    const allowedScopes = oAuthApp.scopes || [];

    const unauthorizedScopes = requestedScopes.filter((s) => !allowedScopes.includes(s));
    if (unauthorizedScopes.length > 0) {
      throw new Error(`App not authorized for scopes: ${unauthorizedScopes.join(", ")}`);
    }

    return {
      success: true,
      app: oAuthApp,
      requestedScopes,
    };
  } catch (error) {
    console.error("OAuth authorization error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createOAuthToken(
  clientId: string,
  scope: string,
  redirectUri: string,
  state: string
) {
  try {
    // Generate authorization code
    const authorizationCode = crypto.randomBytes(32).toString("hex");

    // Store authorization code (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const requestedScopes = scope.includes(",") ? scope.split(",") : scope.split(" ");

    // Create OAuth token using keystoneClient
    // The user will be automatically attached from the session by the resolveInput hook
    const response = await keystoneClient(`
      mutation CreateOAuthToken($data: OAuthTokenCreateInput!) {
        createOAuthToken(data: $data) {
          id
          token
        }
      }
    `, {
      data: {
        tokenType: "authorization_code",
        token: authorizationCode,
        clientId,
        scopes: requestedScopes,
        redirectUri,
        expiresAt,
        state,
        isRevoked: "false",
        // No need to pass user - it's handled by the resolveInput hook
      }
    });

    if (!response.success) {
      throw new Error(response.error || "Failed to create OAuth token");
    }

    // Get the current domain from headers
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3001';
    const protocol = headersList.get('x-forwarded-proto') || 'https';
    const shopDomain = `${protocol}://${host}`;

    // Redirect to the callback URL with the authorization code
    const params = new URLSearchParams({
      code: authorizationCode,
      shop: shopDomain, // Pass the full OpenFront URL as shop parameter
      ...(state && { state }),
    });

    redirect(`${redirectUri}?${params}`);
  } catch (error) {
    console.error("OAuth token creation error:", error);
    throw error;
  }
}

export async function denyOAuthApp(redirectUri: string, state: string) {
  try {
    const params = new URLSearchParams({
      error: "access_denied",
      error_description: "User denied authorization",
      ...(state && { state }),
    });

    redirect(`${redirectUri}?${params}`);
  } catch (error) {
    console.error("OAuth denial error:", error);
    throw error;
  }
}