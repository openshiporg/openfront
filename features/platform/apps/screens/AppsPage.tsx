import { PageBreadcrumbs } from "@/features/dashboard/components/PageBreadcrumbs";
import { OAuthInstallDialog } from "../../order-management-system/components/OAuthInstallDialog";
import { AppsPageClient } from "./AppsPageClient";
import { getOAuthApps } from "../actions";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function AppsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  // Check if install popup should be shown
  const shouldShowInstall = resolvedSearchParams.install === "true";

  // OAuth parameters for installation
  const oauthParams = shouldShowInstall
    ? {
        clientId: typeof resolvedSearchParams.client_id === "string" ? resolvedSearchParams.client_id : "",
        scope: typeof resolvedSearchParams.scope === "string" ? resolvedSearchParams.scope : "",
        redirectUri: typeof resolvedSearchParams.redirect_uri === "string" ? resolvedSearchParams.redirect_uri : "",
        state: typeof resolvedSearchParams.state === "string" ? resolvedSearchParams.state : "",
        responseType: typeof resolvedSearchParams.response_type === "string" ? resolvedSearchParams.response_type : "",
      }
    : null;

  // Fetch existing OAuth apps from database
  const oauthAppsResponse = await getOAuthApps();
  const existingApps = oauthAppsResponse.success ? oauthAppsResponse.data.items : [];

  return (
    <section
      aria-label="Apps overview"
      className="overflow-hidden flex flex-col"
    >
      <PageBreadcrumbs
        items={[
          {
            type: "link",
            label: "Dashboard",
            href: "/",
          },
          {
            type: "page",
            label: "Platform",
          },
          {
            type: "page",
            label: "Apps",
          },
        ]}
      />

      <div className="flex flex-col flex-1 min-h-0">
        <div className="border-gray-200 dark:border-gray-800">
          <div className="px-4 md:px-6 pt-4 md:pt-6 pb-4">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
              Apps
            </h1>
            <p className="text-muted-foreground">
              Connect and manage third-party applications and integrations
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <AppsPageClient existingApps={existingApps} />
        </div>
      </div>

      {/* OAuth Install Dialog */}
      {shouldShowInstall && oauthParams && (
        <OAuthInstallDialog 
          isOpen={true}
          oauthParams={oauthParams}
        />
      )}
    </section>
  );
}