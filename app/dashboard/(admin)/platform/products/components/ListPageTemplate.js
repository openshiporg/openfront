"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import React, { Fragment, useMemo, useState, useRef, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowLeft,
  ArrowRight,
  X,
  Check,
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
import { ProductsTable } from "./ProductsTable";
import { PageBreadcrumbs } from "@keystone/themes/Tailwind/orion/components/PageBreadcrumbs";
import { cn } from "@keystone/utils/cn";
import { AdminLink } from "@keystone/themes/Tailwind/orion/components/AdminLink";
import {
  Pagination as UIPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@ui/pagination";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ui/accordion";
import { StatusTabs } from "./StatusTabs";
import { ScrollArea, ScrollBar } from "@ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { DropdownMenuContent as UIPaginationDropdownMenuContent } from "@ui/pagination";

const statusColors = {
  draft:
    "bg-zinc-500/10 text-zinc-500/90 dark:bg-white/5 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700/50",
  proposed:
    "bg-blue-500/15 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-800/50",
  published:
    "bg-green-500/15 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-300 dark:border-green-900/50",
  rejected:
    "bg-red-500/15 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-900/50",
};

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

// Exact copy of original pagination components
function PaginationStats({ list, currentPage, total, pageSize }) {
  let stats;

  if (total > pageSize) {
    const start = pageSize * (currentPage - 1) + 1;
    const end = Math.min(start + pageSize - 1, total);
    stats = (
      <>
        <strong>{start}</strong>{" "}
        {start !== end ? (
          <>
            - <strong>{end}</strong>
          </>
        ) : (
          ""
        )}{" "}
        of <strong>{total}</strong> {list.plural.toLowerCase()}
      </>
    );
  } else {
    if (total > 1 && list.plural) {
      stats = (
        <>
          <strong>{total}</strong> {list.plural.toLowerCase()}
        </>
      );
    } else if (total === 1 && list.singular.toLowerCase()) {
      stats = (
        <>
          <strong>{total}</strong> {list.singular.toLowerCase()}
        </>
      );
    } else {
      stats = <>0 {list.plural.toLowerCase()}</>;
    }
  }

  return (
    <span className="text-xs sm:text-sm text-muted-foreground">
      Showing {stats}
    </span>
  );
}

function PaginationNavigation({ currentPage, total, pageSize }) {
  const [currentPageInput, setCurrentPageInput] = useState(currentPage);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = {};

  for (let [key, value] of searchParams.entries()) {
    query[key] = value;
  }

  // Add useEffect to sync input with currentPage changes
  useEffect(() => {
    setCurrentPageInput(currentPage.toString());
  }, [currentPage]);

  const minPage = 1;
  const limit = Math.ceil(total / pageSize);

  const getQueryString = (newParams) => {
    const allParams = new URLSearchParams(query);
    Object.keys(newParams).forEach((key) => {
      allParams.set(key, newParams[key]);
    });
    return allParams.toString();
  };

  const handlePageChange = (newPage) => {
    const page = Math.max(minPage, Math.min(limit, Number(newPage)));
    const newQuery = getQueryString({ page });
    router.push(`${pathname}?${newQuery}`);
    setCurrentPageInput(page.toString());
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    if (newValue === "" || /^\d+$/.test(newValue)) {
      setCurrentPageInput(newValue);
    }
  };

  const handleInputBlur = () => {
    if (currentPageInput === "") {
      setCurrentPageInput(currentPage.toString());
    } else {
      handlePageChange(currentPageInput);
    }
  };

  return (
    <div className="h-5 sm:h-6 text-xs bg-white dark:bg-zinc-800 dark:border-zinc-600 shadow-sm flex items-center border rounded-md overflow-hidden">
      <button
        type="button"
        className="text-xs sm:text-sm border-0 h-full flex border-r items-center gap-1.5 pr-1.5 pl-1.5 uppercase p-[.15rem] font-medium text-zinc-600 hover:bg-zinc-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-zinc-600 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-600 dark:focus:ring-blue-500 dark:focus:text-white"
        onClick={() => handlePageChange(parseInt(currentPageInput) - 1)}
        disabled={parseInt(currentPageInput) <= minPage}
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <div className="text-nowrap flex items-center border-r-0 px-1 text-xs h-full">
        <input
          className={`mx-1 bg-transparent border-0 text-zinc-800 focus:ring-0 dark:text-zinc-100 text-center appearance-none`}
          style={{
            width: `${Math.max(0.5, Math.max(currentPageInput.toString().length) * 0.75)}em`,
          }}
          type="text"
          value={currentPageInput}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handlePageChange(e.target.value);
            }
          }}
        />
        <span className="mr-1.5 text-zinc-500 dark:text-zinc-400">
          / {limit}
        </span>
      </div>
      <button
        type="button"
        className="text-xs sm:text-sm border-0 h-full flex border-l items-center gap-1.5 pr-1.5 pl-1.5 uppercase p-[.15rem] font-medium text-zinc-600 hover:bg-zinc-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-zinc-600 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-600 dark:focus:ring-blue-500 dark:focus:text-white"
        onClick={() => handlePageChange(parseInt(currentPageInput) + 1)}
        disabled={parseInt(currentPageInput) >= limit}
      >
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function PaginationDropdown({
  currentPage,
  total,
  pageSize,
  list,
  dropdownTrigger,
}) {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const query = {};
  for (let [key, value] of searchParams.entries()) {
    query[key] = value;
  }

  const pageSizeOptions = [1, 5, 10, 25, 50, 100];
  const [pageSizeInput, setPageSizeInput] = useState(pageSize.toString());
  const [selectedPageSize, setSelectedPageSize] = useState(
    pageSizeOptions.includes(pageSize) ? pageSize : "Custom"
  );
  const [isCustomizing, setIsCustomizing] = useState(false);

  const handlePageSizeInputChange = (e) => {
    const newValue = e.target.value;
    if (newValue === "" || /^\d+$/.test(newValue)) {
      setPageSizeInput(newValue);
    }
  };

  const handlePageSizeInputBlur = () => {
    if (pageSizeInput === "") {
      setPageSizeInput(pageSize.toString());
    } else {
      handlePageSizeInputCommit(pageSizeInput);
    }
  };

  const handlePageSizeChange = (newSize) => {
    if (newSize === "Custom") {
      setSelectedPageSize("Custom");
      setPageSizeInput(pageSize.toString());
      setIsCustomizing(true);
    } else {
      const size = Math.max(1, Number(newSize));
      const newQuery = getQueryString({ pageSize: size, page: 1 });
      push(`${pathname}?${newQuery}`);
      setSelectedPageSize(size);
      setPageSizeInput(size.toString());
      setIsCustomizing(false);
    }
  };

  const handlePageSizeInputCommit = (value) => {
    const newSize = Math.max(1, parseInt(value, 10) || 1);
    const newQuery = getQueryString({ pageSize: newSize, page: 1 });
    push(`${pathname}?${newQuery}`);
    setSelectedPageSize(newSize);
    setPageSizeInput(newSize.toString());
    setIsCustomizing(false);
  };

  const handlePageSizeInputCancel = () => {
    setSelectedPageSize(pageSize);
    setPageSizeInput(pageSize.toString());
    setIsCustomizing(false);
  };

  const getQueryString = (newParams) => {
    const allParams = new URLSearchParams(query);
    Object.keys(newParams).forEach((key) => {
      allParams.set(key, newParams[key]); // Use `set` to ensure unique keys
    });
    return allParams.toString();
  };

  const defaultTrigger = (
    <button
      type="button"
      className="h-5 text-xs sm:h-6 sm:text-sm text-nowrap flex items-center gap-1.5 pr-2 pl-2 uppercase shadow-sm border p-[.15rem] font-medium text-zinc-600 bg-white dark:bg-zinc-800 rounded-md hover:bg-zinc-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-zinc-600 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-600 dark:focus:ring-blue-500 dark:focus:text-white"
    >
      {selectedPageSize === "Custom" ? "Custom" : selectedPageSize} Per Page
    </button>
  );

  return isCustomizing ? (
    <CustomInput
      value={pageSizeInput}
      onChange={handlePageSizeInputChange}
      onCommit={handlePageSizeInputCommit}
      onCancel={handlePageSizeInputCancel}
    />
  ) : (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {dropdownTrigger
          ? cloneElement(dropdownTrigger, { asChild: true })
          : defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Page Size</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea vpClassName="max-h-72">
          {pageSizeOptions.map((size) => (
            <DropdownMenuItem
              key={size}
              onSelect={() => handlePageSizeChange(size)}
            >
              {size}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onSelect={() => handlePageSizeChange("Custom")}>
            Custom
          </DropdownMenuItem>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Add CustomInput component definition
const CustomInput = ({ value, onChange, onCommit, onCancel }) => (
  <div className="flex items-center">
    <div className="p-0.5 mr-1.5 flex items-center bg-white dark:bg-zinc-800 dark:border-zinc-600 border rounded-md h-[1.45rem]">
      <input
        className="text-sm bg-transparent border-0 text-zinc-800 focus:ring-0 dark:text-zinc-100 text-center appearance-none"
        style={{
          width: `${Math.max(1.4, value.length * 0.7)}em`,
        }}
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onCommit(e.target.value);
          }
        }}
        autoFocus
      />
    </div>
    <button
      type="button"
      className="flex border-r-0 rounded-r-none items-center gap-1.5 pr-1.5 pl-1.5 uppercase text-xs shadow-sm border p-[.15rem] font-medium text-zinc-600 bg-white dark:bg-zinc-800 rounded-md hover:bg-zinc-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-zinc-600 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-600 dark:focus:ring-blue-500 dark:focus:text-white"
      onClick={onCancel}
    >
      <X className="h-4 w-3" />
    </button>
    <button
      type="button"
      className="flex rounded-l-none items-center gap-1.5 pr-1.5 pl-1.5 uppercase text-xs shadow-sm border p-[.15rem] font-medium text-zinc-600 bg-white dark:bg-zinc-800 rounded-md hover:bg-zinc-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-zinc-600 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-600 dark:focus:ring-blue-500 dark:focus:text-white"
      onClick={() => onCommit(value)}
    >
      <Check className="h-4 w-3" />
    </button>
  </div>
);

export function ListPageTemplate({ listKey = "Product" }) {
  const list = useList(listKey);
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const [loadingActions, setLoadingActions] = useState({});
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const tabRefs = useRef([]);

  // // Call it once during initial render
  // React.useEffect(() => {
  //   // Handle setting default status filter
  //   const handleDefaultStatus = () => {
  //     const params = new URLSearchParams(searchParams);
  //     if (!params.get("!status_matches")) {
  //       const filterValue = [
  //         {
  //           label: "Published",
  //           value: "published",
  //         },
  //       ];
  //       params.set("!status_matches", JSON.stringify(filterValue));
  //       push(`?${params.toString()}`, { shallow: true });
  //     }
  //   };

  //   handleDefaultStatus();
  // }, [searchParams, push]);

  const query = {};
  for (let [key, value] of searchParams.entries()) {
    query[key] = value;
  }

  const searchFields = Object.keys(list.fields).filter(
    (key) => list.fields[key].search
  );
  const searchLabels = searchFields.map((key) => list.fields[key].label);

  const searchParam = typeof query.search === "string" ? query.search : "";
  const [searchString, updateSearchString] = useState(searchParam);
  const search = useFilter(searchParam, list, searchFields);

  const updateSearch = (value) => {
    // Extract search and the rest of the queries from the current URL
    const { search, ...queries } = query;

    // Construct the new query string
    const newQueryString = new URLSearchParams(queries).toString();

    if (value.trim()) {
      // If there is a value, add it to the query string
      const searchQuery = `search=${encodeURIComponent(value)}`;
      const queryString = newQueryString
        ? `${newQueryString}&${searchQuery}`
        : searchQuery;
      push(`?${queryString}`);
    } else {
      // If there is no value, just push the queries without 'search'
      push(`?${newQueryString}`);
    }
  };

  const handleStatusChange = (status) => {
    const params = new URLSearchParams(searchParams);
    if (status === selectedStatus) {
      params.delete("!status_matches");
    } else {
      const filterValue = [
        {
          label: status.charAt(0).toUpperCase() + status.slice(1),
          value: status,
        },
      ];
      params.set("!status_matches", JSON.stringify(filterValue));
    }
    push(`?${params.toString()}`);
  };

  // Get selected status from the parameter format
  const selectedStatusFromParams = useMemo(() => {
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

  let selectedFields = useMemo(
    () =>
      new Set([
        "id",
        "title",
        "handle",
        "status",
        "thumbnail",
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
            thumbnail
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
    return data?.items?.filter((item) => item.status === status).length || 0;
  };

  // Analytics data
  const analyticsData = {
    totalProducts: data?.count || 0,
    publishedProducts:
      data?.items?.filter((item) => item.status === "published").length || 0,
    draftProducts:
      data?.items?.filter((item) => item.status === "draft").length || 0,
  };

  const publishedRatio =
    (analyticsData.publishedProducts / analyticsData.totalProducts) * 100 || 0;
  const variantsCount =
    data?.items?.reduce(
      (acc, item) => acc + (item.productVariants?.length || 0),
      0
    ) || 0;
  const imagesRatio =
    (data?.items?.filter((item) => item.productImages?.length > 0).length /
      analyticsData.totalProducts) *
      100 || 0;

  // Calculate metrics - hardcoded for now until we have dedicated analytics
  const metrics = [
    {
      label: "Published Products",
      value: 0.7, // 75% published
      percentage: "70.0%",
      fraction: "150/200",
    },
    {
      label: "Catalog Growth (30d)",
      value: 0.55, // 85% growth in last 30 days
      percentage: "55.0%",
      fraction: "170/200", // Added 170 variants out of 200 possible
    },
    {
      label: "Inventory Coverage",
      value: 0.25, // 95% products have stock
      percentage: "25.0%",
      fraction: "190/200",
    },
  ];

  const getQueryString = (newParams) => {
    const allParams = new URLSearchParams(query);
    Object.keys(newParams).forEach((key) => {
      allParams.set(key, newParams[key]);
    });
    return allParams.toString();
  };

  return (
    <section
      aria-label="Products overview"
      className="h-screen overflow-hidden flex flex-col"
    >
      <PageBreadcrumbs
        items={[
          { type: "link", label: "Dashboard", href: "/" },
          {
            type: "page",
            label: "Platform",
            showModelSwitcher: true,
            switcherType: "platform",
          },
          { type: "page", label: "Products" },
        ]}
      />

      {metaQuery.error ? (
        <div className="p-4">Error loading products...</div>
      ) : !metaQuery.data ? (
        <div className="p-4">Loading...</div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Analytics Overview */}
          <div className="border-gray-200 dark:border-gray-800">
            <div className="px-4 pt-4 pb-0">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                Products
              </h1>
              <p className="text-muted-foreground">
                <span>Create and manage products</span>
              </p>
              {/* <dl className="mt-6 flex flex-wrap items-center gap-x-12 gap-y-8">
                {metrics.map((metric) => (
                  <MetricCard key={metric.label} metric={metric} />
                ))}
              </dl> */}
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
                  placeholder={`Search by ${searchLabels.length ? searchLabels.join(", ").toLowerCase() : "ID"}`}
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

              <AdminLink href={`/platform/products/create`}>
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
          <div className="pb-0 border-b bg-background">
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

          {/* Scrollable Products List */}
          <div className="flex-1 min-h-0 overflow-auto">
            {data?.items && (
              <ProductsTable
                data={data}
                error={error}
                listKey={listKey}
                list={list}
                handleProductAction={() => {}}
                loadingActions={loadingActions}
                query={query}
                filters={filters}
                searchParam={searchParam}
                updateSearchString={updateSearchString}
                push={push}
              />
            )}
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
