/**
 * PricingPage - Consolidated Server Component
 * Consolidates Discounts, Price Lists, and Gift Cards into tabs
 */

import { getListByPath } from '../../../dashboard/actions/getListByPath';
import { getAdminMetaAction } from '../../../dashboard/actions';
import { notFound } from 'next/navigation';
import { PricingPageClient } from './PricingPageClient';
import { 
  getFilteredDiscounts, 
  getDiscountStatusCounts 
} from '../actions/discount-actions';
import { 
  getFilteredGiftCards, 
  getGiftCardStatusCounts 
} from '../actions/gift-card-actions';
import { 
  getFilteredPriceLists, 
  getPriceListStatusCounts 
} from '../actions/price-list-actions';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function PricingPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const searchParamsObj = Object.fromEntries(
    Object.entries(resolvedSearchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value : value?.toString(),
    ])
  );

  // Get the list configuration (we'll use discounts as primary)
  const list = await getListByPath('discounts');
  if (!list) {
    notFound();
  }

  // Parse search params
  const currentPage = parseInt(searchParamsObj.page?.toString() || '1', 10) || 1;
  const pageSize = parseInt(searchParamsObj.pageSize?.toString() || list.pageSize?.toString() || '50', 10);
  const searchString = searchParamsObj.search?.toString() || '';
  
  // Get active tab (default to discounts)
  const activeTab = (searchParamsObj.tab?.toString() as 'discounts' | 'price-lists' | 'gift-cards') || 'discounts';
  
  // Extract status filter from URL params
  const statusFilter = searchParamsObj['!status_matches'];
  let status = 'all';
  if (statusFilter) {
    try {
      const parsed = JSON.parse(decodeURIComponent(statusFilter.toString()));
      if (Array.isArray(parsed) && parsed.length > 0) {
        status = typeof parsed[0] === 'string' ? parsed[0] : parsed[0].value;
      }
    } catch (e) {
      // Invalid JSON, ignore
    }
  }

  // Extract sort parameter
  const sortBy = searchParamsObj.sortBy?.toString();

  // Fetch data for all tabs (parallel loading)
  const [
    discountsResponse,
    priceListsResponse,
    giftCardsResponse,
    discountStatusCountsResponse,
    priceListStatusCountsResponse,
    giftCardStatusCountsResponse,
  ] = await Promise.all([
    // Discounts data
    getFilteredDiscounts(
      status === 'all' ? undefined : status,
      searchString || undefined,
      currentPage,
      pageSize,
      sortBy
    ),
    
    // Price Lists data
    getFilteredPriceLists(
      status === 'all' ? undefined : status,
      searchString || undefined,
      currentPage,
      pageSize,
      sortBy
    ),
    
    // Gift Cards data
    getFilteredGiftCards(
      status === 'all' ? undefined : status,
      searchString || undefined,
      currentPage,
      pageSize,
      sortBy
    ),
    
    // Status counts
    getDiscountStatusCounts(),
    getPriceListStatusCounts(),
    getGiftCardStatusCounts(),
  ]);

  // Process responses
  const discountData = discountsResponse.success 
    ? discountsResponse.data 
    : { items: [], count: 0 };
    
  const priceListData = priceListsResponse.success 
    ? priceListsResponse.data 
    : { items: [], count: 0 };
    
  const giftCardData = giftCardsResponse.success 
    ? giftCardsResponse.data 
    : { items: [], count: 0 };

  const statusCounts = {
    discounts: discountStatusCountsResponse.success 
      ? discountStatusCountsResponse.data 
      : { all: 0, active: 0, disabled: 0 },
    priceLists: priceListStatusCountsResponse.success 
      ? priceListStatusCountsResponse.data 
      : { all: 0, active: 0, draft: 0, scheduled: 0, expired: 0 },
    giftCards: giftCardStatusCountsResponse.success 
      ? giftCardStatusCountsResponse.data 
      : { all: 0, active: 0, depleted: 0, disabled: 0 },
  };

  // Get adminMeta for the list structure
  const adminMetaResponse = await getAdminMetaAction(list.key);
  const enhancedList = adminMetaResponse.success ? adminMetaResponse.data.list : list;

  // Collect any errors
  const errors = [
    !discountsResponse.success ? `Discounts: ${discountsResponse.error}` : null,
    !priceListsResponse.success ? `Price Lists: ${priceListsResponse.error}` : null,
    !giftCardsResponse.success ? `Gift Cards: ${giftCardsResponse.error}` : null,
  ].filter(Boolean);

  return (
    <PricingPageClient
      list={enhancedList}
      initialTab={activeTab}
      discountData={discountData}
      priceListData={priceListData}
      giftCardData={giftCardData}
      statusCounts={statusCounts}
      initialSearchParams={{
        page: currentPage,
        pageSize,
        search: searchString,
      }}
      initialErrors={errors.length > 0 ? errors : null}
    />
  );
}

export default PricingPage;