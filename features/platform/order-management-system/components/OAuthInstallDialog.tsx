import { OAuthInstallDialogClient } from "./OAuthInstallDialogClient";
import { getOAuthApp } from "../actions/oauth";

interface OAuthParams {
  clientId: string;
  scope: string;
  redirectUri: string;
  state: string;
  responseType: string;
}

interface OAuthInstallDialogProps {
  isOpen: boolean;
  oauthParams: OAuthParams;
}

export async function OAuthInstallDialog({ isOpen, oauthParams }: OAuthInstallDialogProps) {
  if (!isOpen) return null;

  // Fetch OAuth app data on the server
  const result = await getOAuthApp(
    oauthParams.clientId,
    oauthParams.scope,
    oauthParams.redirectUri,
    oauthParams.responseType
  );

  return (
    <OAuthInstallDialogClient
      isOpen={isOpen}
      oauthParams={oauthParams}
      initialData={result}
    />
  );
}