"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { Fragment, useMemo, useState } from "react";
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
  Search,
  PlusIcon,
  Filter,
  Columns3,
  ChevronDown,
  FilterIcon,
  Circle,
  Triangle,
  Square,
} from "lucide-react";
import { CreateButtonLink } from "@keystone/themes/Tailwind/orion/components/CreateButtonLink";
import { DeleteManyButton } from "@keystone/themes/Tailwind/orion/components/DeleteManyButton";
import { FieldSelection } from "@keystone/themes/Tailwind/orion/components/FieldSelection";
import { FilterAdd } from "@keystone/themes/Tailwind/orion/components/FilterAdd";
import { FilterList } from "@keystone/themes/Tailwind/orion/components/FilterList";
import { SortSelection } from "@keystone/themes/Tailwind/orion/components/SortSelection";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Badge } from "@ui/badge";
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
import { ProductsTable } from "./ProductsTable";
import { PageBreadcrumbs } from "@keystone/themes/Tailwind/orion/components/PageBreadcrumbs";
import { cn } from "@keystone/utils/cn";
import { AdminLink } from "@keystone/themes/Tailwind/orion/components/AdminLink";

const statusColors = {
  draft: "bg-zinc-500/10 text-zinc-500/90 dark:bg-white/5 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700/50",
  proposed: "bg-blue-500/15 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-800/50",
  published: "bg-green-500/15 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-300 dark:border-green-900/50",
  rejected: "bg-red-500/15 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-900/50",
};

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

const StatusSquare = ({ className, children }) => (
  <span
    data-square
    className={cn(
      "flex h-5 w-6 items-center justify-center rounded text-xs font-medium",
      className
    )}
    aria-hidden="true"
  >
    {children}
  </span>
);

export function ListPageTemplate({ listKey = "Product" }) {
  const list = useList(listKey);
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const [loadingActions, setLoadingActions] = useState({});

  // Call it once during initial render
  React.useEffect(() => {
    // Handle setting default status filter
    const handleDefaultStatus = () => {
      const params = new URLSearchParams(searchParams);
      if (!params.get("!status_matches")) {
        const filterValue = [{
          label: "Published",
          value: "published"
        }];
        params.set("!status_matches", JSON.stringify(filterValue));
        push(`?${params.toString()}`, { shallow: true });
      }
    };

    handleDefaultStatus();
  }, [searchParams, push]);

  // Handle search updates
  const updateSearchParams = (value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set("search", value);
    } else {
      newParams.delete("search");
    }
    push(`?${newParams.toString()}`);
  };

  // Replace the search useEffect with direct updates
  const handleSearchChange = (value) => {
    updateSearchString(value);
    if (value !== searchParams.get("search")) {
      updateSearchParams(value);
    }
  };

  const handleStatusChange = (status) => {
    const params = new URLSearchParams(searchParams);
    if (status === selectedStatus) {
      params.delete("!status_matches");
    } else {
      const filterValue = [{
        label: status.charAt(0).toUpperCase() + status.slice(1),
        value: status
      }];
      params.set("!status_matches", JSON.stringify(filterValue));
    }
    push(`?${params.toString()}`);
  };

  // Get selected status from the parameter format
  const selectedStatus = useMemo(() => {
    const statusParam = searchParams.get("!status_matches");
    if (!statusParam) return null;
    try {
      const parsed = JSON.parse(statusParam);
      return parsed[0]?.value;
    } catch (e) {
      return null;
    }
  }, [searchParams]);

  const statuses = ["draft", "proposed", "published", "rejected"];

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

  const searchFields = ["title", "handle", "description"];
  const searchLabels = ["Title", "Handle", "Description"];

  const searchParam = typeof query.search === "string" ? query.search : "";
  const [searchString, updateSearchString] = useState(searchParam);
  const search = useFilter(searchParam, list, searchFields);

  let selectedFields = useMemo(
    () =>
      new Set([
        "id",
        "title",
        "handle",
        "status",
        "productCollections",
        "productVariants",
        "productImages",
        "createdAt",
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
            title
            handle
            status
            productCollections {
              id
              title
            }
            productVariants {
              id
              title
              sku
              inventoryQuantity
              manageInventory
              allowBackorder
            }
            productImages {
              id
              image {
                id
                url
              }
            }
            createdAt
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

  // Add this function to get status counts
  const getStatusCount = (status) => {
    return data?.items?.filter(item => item.status === status).length || 0;
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
            label: "Products",
          },
        ]}
      />
      {metaQuery.error ? (
        "Error..."
      ) : metaQuery.data ? (
        <main className="w-full h-full max-w-4xl mx-auto p-4 md:p-6 flex flex-col">
          <div className="flex flex-col gap-2">
            {/* Title Section */}
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold">{list.label}</h1>
              <p className="text-muted-foreground">
                {list.description ||
                  `Create and manage ${list.label.toLowerCase()}`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              {/* Left Side Controls */}
              <div className="relative flex-1 min-w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearchChange(searchString);
                  }}
                >
                  <Input
                    type="search"
                    className="pl-9 w-full h-9 rounded-lg placeholder:text-muted-foreground/80 text-sm shadow-sm"
                    value={searchString}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder={`Search by ${searchLabels.join(", ").toLowerCase()}`}
                  />
                </form>
              </div>
              <FilterAdd listKey={listKey} filterableFields={filterableFields}>
                <Button variant="outline" size="icon" className="rounded-lg">
                  <FilterIcon className="stroke-muted-foreground" />
                </Button>
              </FilterAdd>
              <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="shadow-sm w-auto min-w-40 max-w-full h-9 rounded-lg text-sm ps-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_[data-square]]:shrink-0">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="px-1 [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2">
                  <SelectGroup>
                    <SelectLabel className="ps-2 text-muted-foreground text-xs font-normal">
                      Status
                    </SelectLabel>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        <StatusSquare className={statusColors[status]}>
                          {getStatusCount(status)}
                        </StatusSquare>
                        <span className="uppercase text-muted-foreground font-medium tracking-wide text-xs truncate">
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <AdminLink href={`/platform/products/create`}>
                <Button className="rounded-lg">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Create {list.singular}
                </Button>
              </AdminLink>
            </div>
            {filters.filters.filter((filter) => filter.field !== "status")
              .length > 0 && (
              <div className="flex gap-1.5 mt-1 border bg-muted/40 rounded-lg p-2 items-center">
                <div className="flex items-center gap-1.5 border-r border-muted-foreground/30 pr-2 mr-1.5">
                  <FilterIcon
                    className="stroke-muted-foreground/50 size-4"
                    strokeWidth={1.5}
                  />
                </div>
                <FilterList
                  filters={filters.filters.reduce((acc, filter) => {
                    if (filter.field !== "status") {
                      acc.push(filter);
                    }
                    return acc;
                  }, [])}
                  list={list}
                />
              </div>
            )}

            {/* Filters and Sort Row */}
            <div className="flex items-center gap-2">
              <SortSelection list={list} orderableFields={orderableFields}>
                <Button
                  variant="link"
                  size="xs"
                  className="uppercase py-1 px-0 text-xs text-muted-foreground [&_svg]:size-3 ml-1"
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
          <div className="flex-1 min-h-0 overflow-auto mt-4 mb-10">
            {data?.count ? (
              <ProductsTable
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
              <div className="flex flex-col items-center p-10">
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
                    total={data?.count}
                    currentPage={currentPage}
                    pageSize={pageSize}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <PaginationNavigation
                    list={list}
                    total={data?.count}
                    currentPage={currentPage}
                    pageSize={pageSize}
                  />
                  <PaginationDropdown
                    list={list}
                    total={data?.count}
                    currentPage={currentPage}
                    pageSize={pageSize}
                  />
                </div>
              </>
            )}
          </div>
        </main>
      ) : null}
    </div>
  );
}