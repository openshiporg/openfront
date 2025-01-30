import React from "react";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { TaxRateList } from "./components/TaxRateList";
import { Button } from "@ui/button";
import { PlusIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";

const TAX_RATES_QUERY = gql`
  query TaxRates($where: TaxRateWhereInput = {}, $take: Int, $skip: Int) {
    taxRates(where: $where, orderBy: [{ createdAt: desc }], take: $take, skip: $skip) {
      id
      name
      code
      rate
      isDefault
      region {
        id
        name
      }
      products {
        id
        title
      }
      productTypes {
        id
        name
      }
      shippingOptions {
        id
        name
      }
    }
    taxRatesCount(where: $where)
  }
`;

export default function TaxSettingsPage() {
  const [searchParams, setSearchParams] = React.useState({
    where: {},
    take: 20,
    skip: 0,
  });

  const { data, loading, error } = useQuery(TAX_RATES_QUERY, {
    variables: searchParams,
  });

  const handleRegionFilter = (regionId) => {
    setSearchParams(prev => ({
      ...prev,
      where: regionId === "all" ? {} : { region: { id: { equals: regionId } } },
      skip: 0,
    }));
  };

  return (
    <div className="flex h-full flex-col gap-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tax Settings</h1>
          <p className="text-sm text-zinc-500">
            Manage tax rates and rules for different regions
          </p>
        </div>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Tax Rate
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={handleRegionFilter}>
        <TabsList>
          <TabsTrigger value="all">All Regions</TabsTrigger>
          {data?.regions?.map(region => (
            <TabsTrigger key={region.id} value={region.id}>
              {region.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <TaxRateList 
            taxRates={data?.taxRates || []}
            isLoading={loading}
            error={error}
            onPageChange={(page) => {
              setSearchParams(prev => ({
                ...prev,
                skip: (page - 1) * prev.take
              }));
            }}
            total={data?.taxRatesCount || 0}
          />
        </TabsContent>

        {data?.regions?.map(region => (
          <TabsContent key={region.id} value={region.id} className="mt-4">
            <TaxRateList 
              taxRates={data?.taxRates || []}
              isLoading={loading}
              error={error}
              onPageChange={(page) => {
                setSearchParams(prev => ({
                  ...prev,
                  skip: (page - 1) * prev.take
                }));
              }}
              total={data?.taxRatesCount || 0}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 