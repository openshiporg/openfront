import { StoreSettingsPageClient } from './StoreSettingsPageClient';
import { getStoreSettings } from '../actions';
import { PageBreadcrumbs } from '@/features/dashboard/components/PageBreadcrumbs';

export default async function StoreSettingsPage() {
  const response = await getStoreSettings();

  return (
    <section className="overflow-hidden flex flex-col">
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
            label: "Store Settings",
          },
        ]}
      />
      <StoreSettingsPageClient
        initialData={response.success ? response.data : null}
        initialError={response.success ? null : (response.error ?? null)}
      />
    </section>
  );
}
