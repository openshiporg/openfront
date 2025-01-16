"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, useMemo, useState } from "react";
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
import { AdminLink } from "@keystone/themes/Tailwind/orion/components/AdminLink";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@keystone/themes/Tailwind/orion/primitives/default/ui/breadcrumb";
import {
  Pagination,
  PaginationDropdown,
  PaginationNavigation,
  PaginationStats,
} from "@keystone/themes/Tailwind/orion/components/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@keystone/themes/Tailwind/orion/primitives/default/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@keystone/themes/Tailwind/orion/primitives/default/ui/collapsible";
import { OrdersTable } from "./OrdersTable";

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

  const currentPage = typeof query.page === "string" && !Number.isNaN(parseInt(query.page))
    ? Number(query.page)
    : 1;
  const pageSize = typeof query.pageSize === "string" && !Number.isNaN(parseInt(query.pageSize))
    ? parseInt(query.pageSize)
    : list.pageSize;

  const metaQuery = useQuery(listMetaGraphqlQuery, { variables: { listKey } });

  let { listViewFieldModesByField, filterableFields, orderableFields } = useMemo(() => {
    const listViewFieldModesByField = {};
    const orderableFields = new Set();
    const filterableFields = new Set();
    for (const field of metaQuery.data?.keystone.adminMeta.list?.fields || []) {
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

  const searchFields = Object.keys(list.fields).filter((key) => list.fields[key].search);
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

  let selectedFields = useMemo(() => new Set([
    'id',
    'displayId',
    'status',
    'fulfillmentStatus',
    'paymentStatus',
    'total',
    'createdAt',
    'user',
    'billingAddress',
    'shippingAddress',
    'lineItems'
  ]), []);

  let { data: newData, error: newError, refetch } = useQuery(
    useMemo(() => {
      return gql`
        query ($where: ${list.gqlNames.whereInputName}, $take: Int!, $skip: Int!, $orderBy: [${list.gqlNames.listOrderName}!]) {
          items: ${list.gqlNames.listQueryName}(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
            id
            displayId
            status
            fulfillmentStatus
            paymentStatus
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
              fulfilledQuantity
              returnedQuantity
              shippedQuantity
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
        orderBy: sort ? [{ [sort.field]: sort.direction.toLowerCase() }] : undefined,
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

  const showCreate = !(metaQuery.data?.keystone.adminMeta.list?.hideCreate ?? true) || null;

  // Custom field views for Order list
  const fieldViews = {
    status: {
      render: ({ item }) => (
        <div className="flex flex-col gap-1">
          <Badge 
            color={
              item.status === 'PENDING' ? 'amber' :
              item.status === 'COMPLETED' ? 'green' :
              item.status === 'CANCELLED' ? 'red' : 
              'blue'
            }
          >
            {item.status}
          </Badge>
          <Badge 
            color={
              item.fulfillmentStatus === 'NOT_FULFILLED' ? 'zinc' :
              item.fulfillmentStatus === 'FULFILLED' ? 'green' :
              item.fulfillmentStatus === 'PARTIALLY_FULFILLED' ? 'amber' :
              'blue'
            }
          >
            {item.fulfillmentStatus}
          </Badge>
        </div>
      )
    },
    user: {
      render: ({ item }) => (
        <div>
          <div className="font-medium">{item.user?.name}</div>
          <div className="text-muted-foreground text-xs">{item.user?.email}</div>
          {item.user?.phone && (
            <div className="text-muted-foreground text-xs">{item.user.phone}</div>
          )}
        </div>
      )
    },
    billingAddress: {
      render: ({ item }) => item.billingAddress ? (
        <div className="text-sm">
          <div>{item.billingAddress.line1}</div>
          {item.billingAddress.line2 && <div>{item.billingAddress.line2}</div>}
          <div>{item.billingAddress.city}, {item.billingAddress.state} {item.billingAddress.postalCode}</div>
          <div className="text-muted-foreground">{item.billingAddress.country}</div>
        </div>
      ) : null
    }
  };

  return (
    <>
      {metaQuery.error ? (
        "Error..."
      ) : data && metaQuery.data ? (
        <main className="items-start gap-2 sm:py-0 md:gap-4">
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <AdminLink href="/">Dashboard</AdminLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>{list.label}</BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex flex-col sm:flex-row mt-2 mb-4 gap-4 justify-between">
            <div className="flex-col items-center">
              <h1 className="text-lg font-semibold md:text-2xl">
                {list.label}
              </h1>
              <p className="text-muted-foreground">
                {list.description || `Create and manage ${list.label.toLowerCase()}`}
              </p>
            </div>
            {data.count || query.search || filters.filters.length ? (
              <div>{showCreate && <CreateButtonLink list={list} />}</div>
            ) : null}
          </div>
          <div className="no-scrollbar overflow-x-auto border rounded-lg divide-y dark:bg-zinc-950">
            <div className="flex gap-3 py-3 px-3">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground" />
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateSearch(searchString);
                  }}
                >
                  <Input
                    type="search"
                    className="w-full rounded-md bg-muted/40 pl-10"
                    value={searchString}
                    onChange={(e) => updateSearchString(e.target.value)}
                    placeholder={`Search by ${searchLabels.length ? searchLabels.join(", ").toLowerCase() : "ID"}`}
                  />
                </form>
              </div>
            </div>

            <div className="flex flex-col items-start bg-zinc-300/20 dark:bg-muted/10 px-3 py-2">
              <div className="flex flex-wrap gap-2 w-full items-center">
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
                <SortSelection
                  list={list}
                  orderableFields={orderableFields}
                  dropdownTrigger={
                    <button
                      type="button"
                      className="flex gap-1.5 pr-2 pl-2 tracking-wider items-center text-xs shadow-sm border p-[.15rem] font-medium text-zinc-600 bg-white dark:bg-zinc-800 rounded-md hover:bg-zinc-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-zinc-600 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-600 dark:focus:ring-blue-500 dark:focus:text-white"
                    >
                      <ArrowUpDown size={12} className="stroke-muted-foreground" />
                      SORT
                    </button>
                  }
                />
                <FieldSelection
                  list={list}
                  fieldModesByFieldPath={listViewFieldModesByField}
                  rightSection={
                    <Button
                      variant="plain"
                      size="xs"
                      onClick={resetToDefaults}
                      className="opacity-85 text-red-800"
                      isDisabled={!Boolean(filters.filters.length || query.sortBy || query.fields || query.search)}
                    >
                      Reset
                    </Button>
                  }
                  dropdownTrigger={
                    <button
                      type="button"
                      className="flex gap-1.5 pr-2 pl-2 tracking-wider items-center text-xs shadow-sm border p-[.15rem] font-medium text-zinc-600 bg-white dark:bg-zinc-800 rounded-md hover:bg-zinc-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-zinc-600 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-600 dark:focus:ring-blue-500 dark:focus:text-white"
                    >
                      <Columns3 size={12} className="stroke-muted-foreground" />
                      COLUMNS
                    </button>
                  }
                />
                <FilterAdd
                  listKey={listKey}
                  filterableFields={filterableFields}
                  dropdownTrigger={
                    <button
                      type="button"
                      className="flex gap-1.5 pr-2 pl-2 tracking-wider items-center text-xs shadow-sm border p-[.15rem] font-medium text-zinc-600 bg-white dark:bg-zinc-800 rounded-md hover:bg-zinc-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-zinc-600 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-600 dark:focus:ring-blue-500 dark:focus:text-white"
                    >
                      <PlusIcon size={13} className="stroke-muted-foreground" />
                      FILTER
                    </button>
                  }
                />
              </div>
            </div>

            {filters.filters.length > 0 && (
              <div className="py-2 px-3 flex gap-2">
                <div>
                  <Badge
                    color="zinc"
                    className="flex items-center gap-2 py-0.5 border text-muted-foreground text-xs font-medium tracking-wide uppercase"
                  >
                    <Filter className="w-2.5 h-2.5" />
                    Filters
                    <SquareArrowRight className="w-3 h-3 opacity-75" />
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <FilterList filters={filters.filters} list={list} />
                  </div>
                </div>
              </div>
            )}
            {selectedItemsState.selectedItems.size > 0 && (
              <div className="py-2 pr-2 pl-3 border fixed bottom-4 z-50 shadow-lg rounded-lg bg-white dark:bg-zinc-800">
                <div className="flex gap-4 items-center">
                  <span className="text-sm text-muted-foreground font-medium">
                    {selectedItemsState.selectedItems.size} of {data.items.length} {list.label} selected
                  </span>
                  {!(metaQuery.data?.keystone.adminMeta.list?.hideDelete ?? true) && (
                    <DeleteManyButton
                      list={list}
                      selectedItems={selectedItemsState.selectedItems}
                      refetch={refetch}
                    />
                  )}
                </div>
              </div>
            )}
            <div className="pb-1 pr-2 pl-3.5">
              <PaginationStats
                list={list}
                total={data.count}
                currentPage={currentPage}
                pageSize={pageSize}
              />
            </div>
            {data.count ? (
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
            ) : (
              <div>
                <div className="flex flex-col items-center p-10 border-dashed border-2 rounded-lg m-5">
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
                        Found {searchParam ? "matching your search" : "matching your filters"}{" "}
                      </span>
                      <Button
                        variant="secondary"
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
              </div>
            )}
          </div>
        </main>
      ) : null}
    </>
  );
}