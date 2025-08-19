import { ApiKeyListPage } from "@/features/platform/api-keys/screens/ApiKeyListPage";

export default function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return <ApiKeyListPage searchParams={searchParams} />;
}