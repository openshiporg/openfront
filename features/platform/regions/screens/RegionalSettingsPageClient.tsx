"use client";

import { PageContainer } from "../../../dashboard/components/PageContainer";
import { RegionalSettingsTabs, TabType } from "../components/RegionalSettingsTabs";
import { Region } from "../actions";
import { Country } from "../actions/country-actions";
import { Currency } from "../actions/currency-actions";

interface RegionalSettingsPageClientProps {
  list: any;
  initialTab: TabType;
  regionData: {
    items: Region[];
    count: number;
  };
  countryData: {
    items: Country[];
    count: number;
  };
  currencyData: {
    items: Currency[];
    count: number;
  };
  statusCounts: {
    regions: Record<string, number>;
    countries: Record<string, number>;
    currencies: Record<string, number>;
  };
  initialSearchParams: {
    page: number;
    pageSize: number;
    search: string;
  };
  initialErrors?: string[] | null;
}

export function RegionalSettingsPageClient({
  list,
  initialTab,
  regionData,
  countryData,
  currencyData,
  statusCounts,
  initialSearchParams,
  initialErrors,
}: RegionalSettingsPageClientProps) {
  
  if (initialErrors && initialErrors.length > 0) {
    console.error('Regional Settings errors:', initialErrors);
  }

  return (
    <PageContainer
      header={{
        title: "Regional Settings",
        description: "Manage regions, countries, and currencies for your store",
      }}
    >
      <RegionalSettingsTabs
        initialTab={initialTab}
        regionData={regionData}
        countryData={countryData}
        currencyData={currencyData}
        statusCounts={statusCounts}
        list={list}
      />
    </PageContainer>
  );
}