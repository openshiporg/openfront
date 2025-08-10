import { PageBreadcrumbs } from "@/features/dashboard/components/PageBreadcrumbs";
import { Settings } from "lucide-react";
import { OAuthInstallDialog } from "../components/OAuthInstallDialog";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function OrderManagementSystemPage({ searchParams }: PageProps) {
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

  return (
    <section
      aria-label="Order Management System overview"
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
            label: "Order Management System",
          },
        ]}
      />

      <div className="flex flex-col flex-1 min-h-0">
        <div className="border-gray-200 dark:border-gray-800">
          <div className="px-4 md:px-6 pt-4 md:pt-6 pb-4">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
              Order Management System
            </h1>
            <p className="text-muted-foreground">
              OAuth authorization and app installation for order management systems
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="flex items-center justify-center h-full py-10">
            <div className="text-center">
              <div className="relative h-11 w-11 mx-auto mb-2">
                <Settings className="w-11 h-11 text-gray-400" />
              </div>
              <p className="font-medium">Order Management System</p>
              <p className="text-muted-foreground text-sm">
                Configure OAuth applications and manage integrations
              </p>
            </div>
          </div>
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