/**
 * RegionalSettingsPage - Consolidated Server Component
 * Consolidates Regions, Countries, and Currencies into tabs
 */

import { getListByPath } from '../../../dashboard/actions/getListByPath';
import { getAdminMetaAction } from '../../../dashboard/actions';
import { notFound } from 'next/navigation';
import { RegionalSettingsPageClient } from './RegionalSettingsPageClient';
import { 
  getFilteredRegions, 
  getRegionStatusCounts 
} from '../actions';
import { 
  getFilteredCountries, 
  getCountryStatusCounts 
} from '../actions/country-actions';
import { 
  getFilteredCurrencies, 
  getCurrencyStatusCounts 
} from '../actions/currency-actions';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function RegionalSettingsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const searchParamsObj = Object.fromEntries(
    Object.entries(resolvedSearchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value : value?.toString(),
    ])
  );

  // Get the list configuration (we'll use regions as primary)
  const list = await getListByPath('regions');
  if (!list) {
    notFound();
  }

  // Parse search params
  const currentPage = parseInt(searchParamsObj.page?.toString() || '1', 10) || 1;
  const pageSize = parseInt(searchParamsObj.pageSize?.toString() || list.pageSize?.toString() || '50', 10);
  const searchString = searchParamsObj.search?.toString() || '';
  
  // Get active tab (default to regions)
  const activeTab = (searchParamsObj.tab?.toString() as 'regions' | 'countries' | 'currencies') || 'regions';
  
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
    regionsResponse,
    countriesResponse,
    currenciesResponse,
    regionStatusCountsResponse,
    countryStatusCountsResponse,
    currencyStatusCountsResponse,
  ] = await Promise.all([
    // Regions data
    getFilteredRegions(
      status === 'all' ? undefined : status,
      searchString || undefined,
      currentPage,
      pageSize,
      sortBy
    ),
    
    // Countries data
    getFilteredCountries(
      status === 'all' ? undefined : status,
      searchString || undefined,
      currentPage,
      pageSize,
      sortBy
    ),
    
    // Currencies data
    getFilteredCurrencies(
      status === 'all' ? undefined : status,
      searchString || undefined,
      currentPage,
      pageSize,
      sortBy
    ),
    
    // Status counts
    getRegionStatusCounts(),
    getCountryStatusCounts(),
    getCurrencyStatusCounts(),
  ]);

  // Process responses
  const regionData = regionsResponse.success 
    ? regionsResponse.data 
    : { items: [], count: 0 };
    
  const countryData = countriesResponse.success 
    ? countriesResponse.data 
    : { items: [], count: 0 };
    
  const currencyData = currenciesResponse.success 
    ? currenciesResponse.data 
    : { items: [], count: 0 };

  const statusCounts = {
    regions: regionStatusCountsResponse.success 
      ? regionStatusCountsResponse.data 
      : { all: 0, active: 0, inactive: 0 },
    countries: countryStatusCountsResponse.success 
      ? countryStatusCountsResponse.data 
      : { all: 0, assigned: 0, unassigned: 0 },
    currencies: currencyStatusCountsResponse.success 
      ? currencyStatusCountsResponse.data 
      : { all: 0, active: 0, unused: 0 },
  };

  // Get adminMeta for the list structure
  const adminMetaResponse = await getAdminMetaAction(list.key);
  const enhancedList = adminMetaResponse.success ? adminMetaResponse.data.list : list;

  // Collect any errors
  const errors = [
    !regionsResponse.success ? `Regions: ${regionsResponse.error}` : null,
    !countriesResponse.success ? `Countries: ${countriesResponse.error}` : null,
    !currenciesResponse.success ? `Currencies: ${currenciesResponse.error}` : null,
  ].filter(Boolean);

  return (
    <RegionalSettingsPageClient
      list={enhancedList}
      initialTab={activeTab}
      regionData={regionData}
      countryData={countryData}
      currencyData={currencyData}
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

export default RegionalSettingsPage;