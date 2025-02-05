"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, useMemo, useState, useEffect } from "react";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { makeDataGetter } from "@keystone-6/core/admin-ui/utils";
import { useList } from "@keystone/keystoneProvider";
import { useFilter } from "@keystone/utils/useFilter";
import { useFilters } from "@keystone/utils/useFilters";
import { useQueryParamsFromLocalStorage } from "@keystone/utils/useQueryParamsFromLocalStorage";
import { useSelectedFields } from "@keystone/utils/useSelectedFields";
import { useSort } from "@keystone/utils/useSort";
import {
  ArrowUpDown,
  Circle,
  Search,
  Square,
  SquareArrowRight,
  Triangle,
  PlusIcon,
  Filter,
  Columns3,
  ChevronDown,
  ListFilter,
  FilterIcon,
} from "lucide-react";
import { CreateButtonLink } from "@keystone/themes/Tailwind/orion/components/CreateButtonLink";
import { DeleteManyButton } from "@keystone/themes/Tailwind/orion/components/DeleteManyButton";
import { FieldSelection } from "@keystone/themes/Tailwind/orion/components/FieldSelection";
import { FilterAdd } from "@keystone/themes/Tailwind/orion/components/FilterAdd";
import { FilterList } from "@keystone/themes/Tailwind/orion/components/FilterList";
import { ListTable } from "@keystone/themes/Tailwind/orion/components/ListTable";
import { SortSelection } from "@keystone/themes/Tailwind/orion/components/SortSelection";
import { Button } from "@keystone/themes/Tailwind/orion/primitives/default/ui/button";
import { Input } from "@keystone/themes/Tailwind/orion/primitives/default/ui/input";
import { Badge } from "@keystone/themes/Tailwind/orion/primitives/default/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import {
  Pagination,
  PaginationDropdown,
  PaginationNavigation,
  PaginationStats,
} from "@keystone/themes/Tailwind/orion/components/Pagination";
import { OrdersTable } from "./OrdersTable";
import { PageBreadcrumbs } from "@keystone/themes/Tailwind/orion/components/PageBreadcrumbs";
import { cn } from "@keystone/utils/cn";
import { StatusSelect } from "./StatusSelect";

const ColoredSquare = ({ className, children }) => (
  <span
    data-square
    className={cn(
      "flex size-5 items-center justify-center rounded text-xs font-medium",
      className
    )}
    aria-hidden="true"
  >
    {children}
  </span>
);

const DiamondPlus = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 4V16M4 10H16"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
    />
  </svg>
);

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
              metadata
              isReturn
              isGiftcard
              shouldMerge
              allowDiscounts
              hasShipping
              unitPrice
              originalPrice
              total
              percentageOff
              productVariant {
                id
                title
                sku
                barcode
                ean
                upc
                product {
                  id
                  title
                  thumbnail
                }
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

  // Custom field views for Order list
  const fieldViews = {
    status: {
      render: ({ item }) => (
        <div className="flex flex-col gap-1">
          <Badge
            color={
              item.status === "PENDING"
                ? "amber"
                : item.status === "COMPLETED"
                  ? "green"
                  : item.status === "CANCELLED"
                    ? "red"
                    : "blue"
            }
          >
            {item.status}
          </Badge>
        </div>
      ),
    },
    user: {
      render: ({ item }) => (
        <div>
          <div className="font-medium">{item.user?.name}</div>
          <div className="text-muted-foreground text-xs">
            {item.user?.email}
          </div>
          {item.user?.phone && (
            <div className="text-muted-foreground text-xs">
              {item.user.phone}
            </div>
          )}
        </div>
      ),
    },
    billingAddress: {
      render: ({ item }) =>
        item.billingAddress ? (
          <div className="text-sm">
            <div>{item.billingAddress.line1}</div>
            {item.billingAddress.line2 && (
              <div>{item.billingAddress.line2}</div>
            )}
            <div>
              {item.billingAddress.city}, {item.billingAddress.state}{" "}
              {item.billingAddress.postalCode}
            </div>
            <div className="text-muted-foreground">
              {item.billingAddress.country}
            </div>
          </div>
        ) : null,
    },
  };

  return (
    <div className="h-screen overflow-hidden">
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
        "Error..."
      ) : metaQuery.data ? (
        <main className="w-full h-full max-w-4xl mx-auto p-4 md:p-6 flex flex-col gap-1">
          <div className="flex flex-col gap-2">
            {/* Title Section */}
            <div className="flex flex-col">
              <h1 className="text-2xl font-semibold">{list.label}</h1>
              <p className="text-muted-foreground">
                {list.description ||
                  `Create and manage ${list.label.toLowerCase()}`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Left Side Controls */}
              <div className="relative flex-1 min-w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  className="pl-9 w-full h-9 rounded-lg placeholder:text-muted-foreground/80 text-sm"
                  value={searchString}
                  onChange={(e) => updateSearchString(e.target.value)}
                  placeholder={`Search by email, idempotency key, external id, secret key, note`}
                />
              </div>
              <StatusSelect />

              <FilterAdd listKey={listKey} filterableFields={filterableFields}>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:px-4 lg:py-2 lg:w-auto rounded-lg"
                >
                  <FilterIcon className="stroke-muted-foreground" />
                  <span className="hidden lg:inline">Filter</span>
                </Button>
              </FilterAdd>

              <Button
                size="icon"
                className="lg:px-4 lg:py-2 lg:w-auto rounded-lg"
              >
                <DiamondPlus className="h-4 w-4" />
                <span className="hidden lg:inline">Create Order</span>
              </Button>
            </div>

            {/* Filters and Sort Row */}
            <div className="flex items-center gap-2">
              <SortSelection list={list} orderableFields={orderableFields}>
                <Button
                  variant="link"
                  size="xs"
                  className="uppercase py-1 px-0 text-xs text-muted-foreground [&_svg]:size-3"
                >
                  Sorting by{" "}
                  {sort ? (
                    <>
                      {list.fields[sort.field].label}
                      {sort.direction === "ASC" ? (
                        <Badge className="h-4 border py-0 px-1 text-[.5rem] leading-[.85rem] -mr-1">
                          ASC
                        </Badge>
                      ) : (
                        <Badge className="h-4 border py-0 px-1 text-[.5rem] leading-[.85rem] -mr-1">
                          DESC
                        </Badge>
                      )}
                    </>
                  ) : (
                    <>default</>
                  )}
                  <ChevronDown />
                </Button>
              </SortSelection>
            </div>
          </div>

          {/* Table Section */}
          {data?.count ? (
            <>
              <div className="flex flex-col flex-1 min-h-0 mb-8">
                <div className="border rounded-lg">
                  <OrdersTable
                    data={data}
                    error={error}
                    listKey={listKey}
                    list={list}
                    query={query}
                    filters={filters}
                    searchParam={searchParam}
                    updateSearchString={updateSearchString}
                    push={push}
                    showCreate={showCreate}
                    loadingActions={loadingActions}
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-between p-3 rounded-t-xl sticky z-20 mt-8 bg-muted/40 gap-2 -mb-4 md:-mb-6 shadow-md bottom-0 border border-b-0">
                {selectedItemsState.selectedItems.size > 0 ? (
                  <div className="w-full flex flex-wrap gap-4 items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      <strong>{selectedItemsState.selectedItems.size}</strong>{" "}
                      selected
                    </span>
                    <DeleteManyButton
                      list={list}
                      selectedItems={selectedItemsState.selectedItems}
                      refetch={refetch}
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <PaginationStats
                        list={list}
                        total={data.count}
                        currentPage={currentPage}
                        pageSize={pageSize}
                      />
                    </div>
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
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center p-10 border rounded-lg">
              <div className="flex opacity-40">
                <Triangle className="w-8 h-8 fill-indigo-200 stroke-indigo-400 dark:stroke-indigo-600 dark:fill-indigo-950" />
                <Circle className="w-8 h-8 fill-emerald-200 stroke-emerald-400 dark:stroke-emerald-600 dark:fill-emerald-950" />
                <Square className="w-8 h-8 fill-orange-300 stroke-orange-500 dark:stroke-amber-600 dark:fill-amber-950" />
              </div>
              {query.search || filters.filters.length ? (
                <>
                  <span className="pt-4 font-semibold">
                    No <span className="lowercase">{list.label}</span>{" "}
                  </span>
                  <span className="text-muted-foreground pb-4">
                    Found{" "}
                    {searchParam
                      ? `matching your search`
                      : `matching your filters`}{" "}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => {
                      updateSearchString("");
                      const path = window.location.pathname;
                      push(path);
                    }}
                  >
                    Clear filters &amp; search
                  </Button>
                </>
              ) : (
                <>
                  <span className="pt-4 font-semibold">
                    No <span className="lowercase">{list.label}</span>
                  </span>
                  <span className="text-muted-foreground pb-4">
                    Get started by creating a new one.{" "}
                  </span>
                  {showCreate && <CreateButtonLink list={list} />}
                </>
              )}
            </div>
          )}
        </main>
      ) : null}
    </div>
  );
}
