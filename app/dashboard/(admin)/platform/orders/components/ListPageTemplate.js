"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { makeDataGetter } from "@keystone-6/core/admin-ui/utils";
import { useList } from "@keystone/keystoneProvider";
import { useFilter } from "@keystone/utils/useFilter";
import { useFilters } from "@keystone/utils/useFilters";
import { useQueryParamsFromLocalStorage } from "@keystone/utils/useQueryParamsFromLocalStorage";
import { useSort } from "@keystone/utils/useSort";
import {
  ArrowUpDown,
  Search,
  PlusIcon,
  FilterIcon,
  SlidersHorizontal,
} from "lucide-react";
import { FilterAdd } from "@keystone/themes/Tailwind/orion/components/FilterAdd";
import { FilterList } from "@keystone/themes/Tailwind/orion/components/FilterList";
import { SortSelection } from "@keystone/themes/Tailwind/orion/components/SortSelection";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Badge } from "@ui/badge";

import {
  Pagination,
  PaginationDropdown,
  PaginationNavigation,
  PaginationStats,
} from "@keystone/themes/Tailwind/orion/components/Pagination";
import { OrdersTable } from "./OrdersTable";
import { PageBreadcrumbs } from "@keystone/themes/Tailwind/orion/components/PageBreadcrumbs";
import { cn } from "@keystone/utils/cn";
import { StatusTabs } from "./StatusTabs";
import { AdminLink } from "@keystone/themes/Tailwind/orion/components/AdminLink";


const listMetaGraphqlQuery = gql`
  query ($listKey: String!) {
    keystone {
      adminMeta {
        list(key: $listKey) {
          hideDelete
          hideCreate
          fields {
            path
            isOrderable
            isFilterable
            listView {
              fieldMode
            }
          }
        }
      }
    }
  }
`;

const getCategory = (value) => {
  if (value < 0.3) return "red";
  if (value < 0.7) return "orange";
  return "emerald";
};

const categoryConfig = {
  red: {
    activeClass: "bg-red-500 dark:bg-red-500",
    bars: 1,
  },
  orange: {
    activeClass: "bg-orange-500 dark:bg-orange-500",
    bars: 2,
  },
  emerald: {
    activeClass: "bg-emerald-500 dark:bg-emerald-500",
    bars: 3,
  },
  gray: {
    activeClass: "bg-gray-300 dark:bg-gray-800",
    bars: 0,
  },
};

function Indicator({ number }) {
  const category = getCategory(number);
  const config = categoryConfig[category];
  const inactiveClass = "bg-gray-300 dark:bg-gray-800";

  return (
    <div className="flex gap-0.5">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`h-3.5 w-1 rounded-sm ${
            index < config.bars ? config.activeClass : inactiveClass
          }`}
        />
      ))}
    </div>
  );
}

function MetricCard({ metric }) {
  return (
    <div>
      <dt className="text-sm text-gray-500 dark:text-gray-500">
        {metric.label}
      </dt>
      <dd className="mt-1.5 flex items-center gap-2">
        <Indicator number={metric.value} />
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          {metric.percentage}{" "}
          <span className="font-medium text-gray-400 dark:text-gray-600">
            - {metric.fraction}
          </span>
        </p>
      </dd>
    </div>
  );
}

export function ListPageTemplate({ listKey = "Order" }) {
  const list = useList(listKey);
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const [loadingActions, setLoadingActions] = useState({});

  const query = {};
  for (let [key, value] of searchParams.entries()) {
    query[key] = value;
  }

  const { resetToDefaults } = useQueryParamsFromLocalStorage(listKey);

  const currentPage =
    typeof query.page === "string" && !Number.isNaN(parseInt(query.page))
      ? Number(query.page)
      : 1;
  const pageSize =
    typeof query.pageSize === "string" &&
    !Number.isNaN(parseInt(query.pageSize))
      ? parseInt(query.pageSize)
      : list.pageSize;

  const metaQuery = useQuery(listMetaGraphqlQuery, { variables: { listKey } });

  let { listViewFieldModesByField, filterableFields, orderableFields } =
    useMemo(() => {
      const listViewFieldModesByField = {};
      const orderableFields = new Set();
      const filterableFields = new Set();
      for (const field of metaQuery.data?.keystone.adminMeta.list?.fields ||
        []) {
        listViewFieldModesByField[field.path] = field.listView.fieldMode;
        if (field.isOrderable) {
          orderableFields.add(field.path);
        }
        if (field.isFilterable) {
          filterableFields.add(field.path);
        }
      }
      return { listViewFieldModesByField, orderableFields, filterableFields };
    }, [metaQuery.data?.keystone.adminMeta.list?.fields]);

  const sort = useSort(list, orderableFields);
  const filters = useFilters(list, filterableFields);

  const searchFields = Object.keys(list.fields).filter(
    (key) => list.fields[key].search
  );
  const searchLabels = searchFields.map((key) => list.fields[key].label);

  const searchParam = typeof query.search === "string" ? query.search : "";
  const [searchString, updateSearchString] = useState(searchParam);
  const search = useFilter(searchParam, list, searchFields);

  const updateSearch = (value) => {
    const { search, ...queries } = query;
    const newQueryString = new URLSearchParams(queries).toString();
    if (value.trim()) {
      const searchQuery = `search=${encodeURIComponent(value)}`;
      const queryString = newQueryString
        ? `${newQueryString}&${searchQuery}`
        : searchQuery;
      push(`?${queryString}`);
    } else {
      push(`?${newQueryString}`);
    }
  };

  let selectedFields = useMemo(
    () =>
      new Set([
        "id",
        "displayId",
        "status",
        "email",
        "total",
        "createdAt",
        "user",
        "billingAddress",
        "shippingAddress",
        "lineItems",
      ]),
    []
  );

  let {
    data: newData,
    error: newError,
    refetch,
  } = useQuery(
    useMemo(() => {
      return gql`
        query ($where: ${list.gqlNames.whereInputName}, $take: Int!, $skip: Int!, $orderBy: [${list.gqlNames.listOrderName}!]) {
          items: ${list.gqlNames.listQueryName}(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
            id
            displayId
            status
            email
            taxRate
            canceledAt
            createdAt
            updatedAt
            user {
              id
              name
              email
            }
            shippingAddress {
              id
              company
              firstName
              lastName
              address1
              address2
              city
              province
              postalCode
              phone
            }
            billingAddress {
              id
              company
              firstName
              lastName
              address1
              address2
              city
              province
              postalCode
              phone
            }
            lineItems {
              id
              quantity
              title
              sku
              thumbnail
              metadata
              variantTitle
              formattedUnitPrice
              formattedTotal
              variantData
              productData
              moneyAmount {
                amount
                originalAmount
              }
            }
          }
          count: ${list.gqlNames.listQueryCountName}(where: $where)
        }
      `;
    }, [list]),
    {
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
      skip: !metaQuery.data,
      variables: {
        where: { ...filters.where, ...search },
        take: pageSize,
        skip: (currentPage - 1) * pageSize,
        orderBy: sort
          ? [{ [sort.field]: sort.direction.toLowerCase() }]
          : undefined,
      },
    }
  );

  let [dataState, setDataState] = useState({ data: newData, error: newError });
  if (newData && dataState.data !== newData) {
    setDataState({ data: newData, error: newError });
  }

  const { data, error } = dataState;
  const dataGetter = makeDataGetter(data, error?.graphQLErrors);

  const [selectedItemsState, setSelectedItems] = useState(() => ({
    itemsFromServer: undefined,
    selectedItems: new Set(),
  }));

  if (data && data.items && selectedItemsState.itemsFromServer !== data.items) {
    const newSelectedItems = new Set();
    data.items.forEach((item) => {
      if (selectedItemsState.selectedItems.has(item.id)) {
        newSelectedItems.add(item.id);
      }
    });
    setSelectedItems({
      itemsFromServer: data.items,
      selectedItems: newSelectedItems,
    });
  }

  const showCreate =
    !(metaQuery.data?.keystone.adminMeta.list?.hideCreate ?? true) || null;

  // Analytics data for orders
  const analyticsData = {
    totalOrders: data?.count || 0,
    completedOrders:
      data?.items?.filter((item) => item.status === "COMPLETED").length || 0,
    pendingOrders:
      data?.items?.filter((item) => item.status === "PENDING").length || 0,
  };

  const completedRatio =
    (analyticsData.completedOrders / analyticsData.totalOrders) * 100 || 0;
  const lineItemsCount =
    data?.items?.reduce(
      (acc, item) => acc + (item.lineItems?.length || 0),
      0
    ) || 0;

  // Calculate metrics for orders
  const metrics = [
    {
      label: "Completed Orders",
      value: completedRatio / 100,
      percentage: `${completedRatio.toFixed(1)}%`,
      fraction: `${analyticsData.completedOrders}/${analyticsData.totalOrders}`,
    },
    {
      label: "Processing Rate (24h)",
      value: 0.55,
      percentage: "55.0%",
      fraction: "110/200",
    },
    {
      label: "Fulfillment Coverage",
      value: 0.75,
      percentage: "75.0%",
      fraction: "150/200",
    },
  ];

  return (
    <section
      aria-label="Orders overview"
      className="h-screen overflow-hidden flex flex-col"
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
            showModelSwitcher: true,
            switcherType: "platform",
          },
          {
            type: "page",
            label: "Orders",
          },
        ]}
      />

      {metaQuery.error ? (
        <div className="p-4">Error loading orders...</div>
      ) : !metaQuery.data ? (
        <div className="p-4">Loading...</div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Analytics Overview */}
          <div className="border-b border-gray-200 dark:border-gray-800">
            <div className="p-6">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                Orders
              </h1>
              <dl className="mt-6 flex flex-wrap items-center gap-x-12 gap-y-8">
                {metrics.map((metric) => (
                  <MetricCard key={metric.label} metric={metric} />
                ))}
              </dl>
            </div>
          </div>

          {/* Search and Filters - Fixed Position */}
          <div className="flex items-center gap-2 p-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateSearch(searchString);
                }}
              >
                <Input
                  type="search"
                  className="pl-9 w-full h-9 rounded-lg placeholder:text-muted-foreground/80 text-sm shadow-sm"
                  value={searchString}
                  onChange={(e) => updateSearchString(e.target.value)}
                  placeholder={`Search by email, idempotency key, external id, secret key, note`}
                />
              </form>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <FilterAdd listKey={listKey} filterableFields={filterableFields}>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:px-4 lg:py-2 lg:w-auto rounded-lg"
                >
                  <SlidersHorizontal className="stroke-muted-foreground" />
                  <span className="hidden lg:inline">Filter</span>
                </Button>
              </FilterAdd>

              <SortSelection list={list} orderableFields={orderableFields}>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:px-4 lg:py-2 lg:w-auto rounded-lg"
                >
                  <ArrowUpDown className="stroke-muted-foreground" />
                  <span className="hidden lg:inline">
                    {sort ? (
                      <>
                        {list.fields[sort.field].label}{" "}
                        <Badge
                          variant="blue"
                          className="ml-1 text-[10px] px-1 py-0 font-medium"
                        >
                          {sort.direction}
                        </Badge>
                      </>
                    ) : (
                      "Sort"
                    )}
                  </span>
                </Button>
              </SortSelection>

              <AdminLink href={`/platform/orders/create`}>
                <Button className="hidden sm:flex relative pe-12 rounded-lg">
                  Create {list.singular}
                  <span className="pointer-events-none absolute inset-y-0 end-0 flex w-9 items-center justify-center bg-primary-foreground/15">
                    <PlusIcon
                      className="opacity-60"
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </span>
                </Button>
                <Button size="icon" className="sm:hidden">
                  <PlusIcon />
                </Button>
              </AdminLink>
            </div>
          </div>

          {/* Status Tabs - Fixed Position */}
          <div className="px-4 pb-0 border-b bg-background">
            <StatusTabs />
          </div>

          {/* Active Filters - Fixed Position */}
          {filters.filters.length > 0 && (
            <div className="flex gap-1.5 border-b border-gray-200 bg-muted/40 py-2 px-5 items-center dark:border-gray-800">
              <div className="flex items-center gap-1.5 border-r border-muted-foreground/30 pr-2 mr-1.5">
                <FilterIcon
                  className="stroke-muted-foreground/50 size-4"
                  strokeWidth={1.5}
                />
              </div>
              <FilterList filters={filters.filters} list={list} />
            </div>
          )}

          {/* Scrollable Orders List */}
          <div className="flex-1 min-h-0 overflow-auto">
            <div>
              {data?.items && (
                <OrdersTable
                  data={data}
                  error={error}
                  listKey={listKey}
                  list={list}
                  handleOrderAction={() => {}}
                  loadingActions={loadingActions}
                  query={query}
                  filters={filters}
                  searchParam={searchParam}
                  updateSearchString={updateSearchString}
                  push={push}
                  showCreate={showCreate}
                />
              )}
            </div>
          </div>

          {/* Pagination - Fixed at Bottom */}
          {data?.count > 0 && (
            <div className="flex items-center justify-between gap-3 p-2 sm:p-4 border-t sticky bottom-0 shadow-sm z-10 bg-muted/40">
              <PaginationStats
                list={list}
                total={data.count}
                currentPage={currentPage}
                pageSize={pageSize}
              />
              <div className="flex items-center gap-2">
                <PaginationNavigation
                  list={list}
                  total={data.count}
                  currentPage={currentPage}
                  pageSize={pageSize}
                />
                <PaginationDropdown
                  list={list}
                  total={data.count}
                  currentPage={currentPage}
                  pageSize={pageSize}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
