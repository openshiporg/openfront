/**
 * SystemPage - Consolidated System Configuration
 * Consolidates Settings, Stores, and Payment Providers into tabs
 */

import { getListByPath } from '../../../dashboard/actions/getListByPath';
import { notFound } from 'next/navigation';
import { SystemPageClient } from './SystemPageClient';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function SystemPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const searchParamsObj = Object.fromEntries(
    Object.entries(resolvedSearchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value : value?.toString(),
    ])
  );

  // Get the list configuration (we'll use a generic one)
  const list = await getListByPath('stores');
  if (!list) {
    notFound();
  }

  // Get active tab (default to settings)
  const activeTab = (searchParamsObj.tab?.toString() as 'settings' | 'stores' | 'payment-providers') || 'settings';

  return (
    <SystemPageClient
      list={list}
      initialTab={activeTab}
    />
  );
}

export default SystemPage;