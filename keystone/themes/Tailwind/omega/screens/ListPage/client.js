"use client";

import { Fragment, useMemo, useState } from "react";
import { useFormState } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { makeDataGetter } from "@keystone-6/core/admin-ui/utils";
import { useFilter } from "@keystone/utils/useFilter";
import { useFilters } from "@keystone/utils/useFilters";
import { useQueryParamsFromLocalStorage } from "@keystone/utils/useQueryParamsFromLocalStorage";
import { useSelectedFields } from "@keystone/utils/useSelectedFields";
import { useSort } from "@keystone/utils/useSort";
import { fieldViews } from "@keystone/fieldViews";

import {
  ArrowUpDown,
  Circle,
  Search,
  Square,
  SquareArrowRight,
  Triangle,
  PlusCircleIcon,
  PlusIcon as PlusIcon2,
  ChevronDown,
  SearchIcon,
  Filter,
  ArrowRight,
  ChevronRight,
  Columns3,
} from "lucide-react";

import { CreateButtonLink } from "../../components/CreateButtonLink";
import { DeleteManyButton } from "../../components/DeleteManyButton";
import { FieldSelection } from "../../components/FieldSelection";
import { FilterAdd } from "../../components/FilterAdd";
import { FilterList } from "../../components/FilterList";
import { ListTable } from "../../components/ListTable";
import { SortSelection } from "../../components/SortSelection";
import { Button } from "../../primitives/default/ui/button";
import { LoadingIcon } from "../../components/LoadingIcon";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../primitives/default/ui/breadcrumb";
import {
  Pagination,
  PaginationDropdown,
  PaginationNavigation,
  PaginationStats,
} from "../../components/Pagination";
import { Input } from "../../primitives/default/ui/input";
import { Badge } from "../../primitives/default/ui/badge";
import { AdminLink } from "../../components/AdminLink";
import Link from "next/link";

const expectedExports = new Set(["Cell", "Field", "controller", "CardValue"]);

export function ListPageClient({
  listKey,
  list,
  metaData,
  items,
  count,
  currentPage,
  pageSize,
  listTableData,
}) {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const query = {};
  for (let [key, value] of searchParams.entries()) {
    query[key] = value;
  }

  const { resetToDefaults } = useQueryParamsFromLocalStorage(listKey);

  const { listViewFieldModesByField, filterableFields, orderableFields } =
    useMemo(() => {
      const listViewFieldModesByField = {};
      const orderableFields = new Set();
      const filterableFields = new Set();

      for (const field of metaData?.fields || []) {
        listViewFieldModesByField[field.path] = field.listView.fieldMode;
        if (field.isOrderable) {
          orderableFields.add(field.path);
        }
        if (field.isFilterable) {
          filterableFields.add(field.path);
        }
      }

      return { listViewFieldModesByField, orderableFields, filterableFields };
    }, [metaData?.fields]);

  const sort = useSort(listKey, orderableFields);
  const filters = useFilters(list, filterableFields);

  const searchFields = ["name"]; // Default to name search
  const searchLabels = ["Name"];

  const searchParam = typeof query.search === "string" ? query.search : "";
  const [searchString, formAction] = useFormState(
    async (prevState, formData) => {
      const search = formData.get("search");
      const newParams = new URLSearchParams(query);
      if (search) {
        newParams.set("search", search);
      } else {
        newParams.delete("search");
      }
      newParams.set("page", "1");
      push(`?${newParams.toString()}`);
      return search;
    },
    searchParam
  );
  const search = useFilter(searchString, listKey, searchFields);

  const [selectedItemsState, setSelectedItems] = useState(() => ({
    itemsFromServer: undefined,
    selectedItems: new Set(),
  }));

  let selectedFields = useSelectedFields(list, listViewFieldModesByField);

  // Update selected items when items change
  if (items && selectedItemsState.itemsFromServer !== items) {
    const newSelectedItems = new Set();
    items.forEach((item) => {
      if (selectedItemsState.selectedItems.has(item.id)) {
        newSelectedItems.add(item.id);
      }
    });
    setSelectedItems({
      itemsFromServer: items,
      selectedItems: newSelectedItems,
    });
  }

  // Create data object in the format expected by makeDataGetter
  const data = useMemo(() => ({
    items,
    count
  }), [items, count]);

  const dataGetter = makeDataGetter(data, null);

  const showCreate = !(metaData?.hideCreate ?? true) || null;
  const showDelete = !(metaData?.hideDelete ?? true) || null;

  // Build runtime list data with controllers
  const runtimeListData = useMemo(() => {
    console.log("Building runtime list data on client side");
    const fields = {};

    for (const field of listTableData.fields) {
      const views = { ...fieldViews[field.viewsIndex] };
      const customViews = {};

      if (field.customViewsIndex !== null) {
        const customViewsSource = fieldViews[field.customViewsIndex];
        const allowedExportsOnCustomViews = new Set(
          views.allowedExportsOnCustomViews
        );
        Object.keys(customViewsSource).forEach((exportName) => {
          if (allowedExportsOnCustomViews.has(exportName)) {
            customViews[exportName] = customViewsSource[exportName];
          } else if (expectedExports.has(exportName)) {
            views[exportName] = customViewsSource[exportName];
          }
        });
      }

      const controller = views.controller({
        listKey,
        fieldMeta: field.fieldMeta,
        label: field.label,
        description: field.description,
        path: field.path,
        customViews,
      });

      fields[field.path] = {
        ...field,
        itemView: {
          fieldMode: field.itemView?.fieldMode ?? null,
          fieldPosition: field.itemView?.fieldPosition ?? null,
        },
        graphql: {
          isNonNull: field.isNonNull,
        },
        views,
        controller,
      };
    }

    return {
      ...listTableData,
      fields,
    };
  }, [listTableData, listKey]);

  return (
    <main className="items-start gap-2 sm:py-0 md:gap-4">
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <AdminLink href="/">Dashboard</AdminLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>{list.label}</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-col sm:flex-row mt-2 mb-4 gap-4 justify-between">
        <div className="flex-col items-center">
          <h1 className="text-lg font-semibold md:text-2xl">{list.label}</h1>
          <p className="text-muted-foreground">
            {list.description ? (
              <p>{list.description}</p>
            ) : (
              <span>
                Create and manage{" "}
                <span className="lowercase">{list.label}</span>
              </span>
            )}
          </p>
        </div>
        {count || query.search || filters.filters.length ? (
          <div>{showCreate && <CreateButtonLink list={list} />}</div>
        ) : null}
      </div>
      <div className="no-scrollbar overflow-x-auto border rounded-lg divide-y dark:bg-zinc-950">
        <div className="flex gap-3 py-3 px-3">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground" />
            <form action={formAction}>
              <Input
                type="search"
                name="search"
                className="w-full rounded-md bg-muted/40 pl-10"
                defaultValue={searchString}
                placeholder={`Search by ${
                  searchLabels.length
                    ? searchLabels.join(", ").toLowerCase()
                    : "ID"
                }`}
              />
            </form>
          </div>
        </div>

        <div className="flex flex-col items-start bg-zinc-300/20 dark:bg-muted/10 px-3 py-2">
          <div className="flex flex-wrap gap-2 w-full items-center">
            <PaginationNavigation
              list={list}
              total={count}
              currentPage={currentPage}
              pageSize={pageSize}
            />
            <PaginationDropdown
              list={list}
              total={count}
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
                  isDisabled={
                    !Boolean(
                      filters.filters.length ||
                        query.sortBy ||
                        query.fields ||
                        query.search
                    )
                  }
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
              list={list}
              filterableFields={filterableFields}
            >
              <button
                type="button"
                className="flex gap-1.5 pr-2 pl-2 tracking-wider items-center text-xs shadow-sm border p-[.15rem] font-medium text-zinc-600 bg-white dark:bg-zinc-800 rounded-md hover:bg-zinc-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-zinc-600 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-600 dark:focus:ring-blue-500 dark:focus:text-white"
              >
                <PlusIcon2 size={13} className="stroke-muted-foreground" />
                FILTER
              </button>
            </FilterAdd>
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
                {selectedItemsState.selectedItems.size} of {items.length}{" "}
                {list.label} selected
              </span>
              {showDelete && (
                <DeleteManyButton
                  list={list}
                  selectedItems={selectedItemsState.selectedItems}
                  totalItems={items.length}
                />
              )}
            </div>
          </div>
        )}
        <div className="pb-1 pr-2 pl-3.5">
          <PaginationStats
            list={list}
            total={count}
            currentPage={currentPage}
            pageSize={pageSize}
          />
        </div>
        {JSON.stringify(dataGetter.get("items"))}

        {count ? (
          <ListTable
            count={count}
            currentPage={currentPage}
            itemsGetter={dataGetter.get("items")}
            listKey={listKey}
            pageSize={pageSize}
            selectedFields={selectedFields}
            sort={sort}
            selectedItems={selectedItemsState.selectedItems}
            onSelectedItemsChange={(selectedItems) => {
              setSelectedItems({
                itemsFromServer: selectedItemsState.itemsFromServer,
                selectedItems,
              });
            }}
            orderableFields={orderableFields}
            listTableData={runtimeListData}
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
                    No <span className="lowercase"> {list.label} </span>{" "}
                  </span>
                  <span className="text-muted-foreground pb-4">
                    Found{" "}
                    {searchParam
                      ? `matching your search`
                      : `matching your filters`}{" "}
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      updateSearchString("");
                      const { search, ...queries } = query;
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
                    No <span className="lowercase"> {list.label} </span>
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
  );
}
