import { StoreSettingsPageClient } from './StoreSettingsPageClient';
import { getStoreSettings } from '../actions';

export default async function StoreSettingsPage() {
  const response = await getStoreSettings();

  return (
    <StoreSettingsPageClient
      initialData={response.success ? response.data : null}
      initialError={response.success ? null : response.error}
    />
  );
}
