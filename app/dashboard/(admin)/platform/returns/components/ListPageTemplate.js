"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { useList } from "@keystone/keystoneProvider";
import { makeDataGetter } from "@keystone-6/core/admin-ui/utils";
import { useQueryParamsFromLocalStorage } from "@keystone/utils/useQueryParamsFromLocalStorage";
import { useSelectedFields } from "@keystone/utils/useSelectedFields";
import { useSort } from "@keystone/utils/useSort";
import { useFilters } from "@keystone/utils/useFilters";
import { useFilter } from "@keystone/utils/useFilter";
import { listMetaGraphqlQuery } from "@keystone/utils/listMetaGraphqlQuery";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@ui/breadcrumb";
import { Input } from "@ui/input";
import { Badge } from "@ui/badge";
import { CreateButtonLink } from "@keystone/themes/Tailwind/orion/components/CreateButtonLink";
import { FilterAdd } from "@keystone/themes/Tailwind/orion/components/FilterAdd";
import { FilterList } from "@keystone/themes/Tailwind/orion/components/FilterList";
import { FieldSelection } from "@keystone/themes/Tailwind/orion/components/FieldSelection";
import { SortSelection } from "@keystone/themes/Tailwind/orion/components/SortSelection";
import { ListTable } from "@keystone/themes/Tailwind/orion/components/ListTable";
import { DeleteManyButton } from "@keystone/themes/Tailwind/orion/components/DeleteManyButton";
import { Pagination, PaginationStats, PaginationNavigation, PaginationDropdown } from "@keystone/themes/Tailwind/orion/components/Pagination";
import { PlusIcon } from "lucide-react";

export function ListPageTemplate({ listKey = "Return" }) {
  const list = useList(listKey);
  const { push } = useRouter();
  const searchParams = useSearchParams();

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

  const searchFields = ["id", "order.id", "status"];
  const searchLabels = ["Return ID", "Order ID", "Status"];

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

  let selectedFields = useSelectedFields(list, listViewFieldModesByField);

  let { data: newData, error: newError, refetch } = useQuery(
    useMemo(() => {
      let selectedGqlFields = [...selectedFields]
        .map((fieldPath) => {
          if (fieldPath === 'order') {
            return `
              order {
                id
                displayId
                user {
                  id
                  name
                  email
                }
              }
            `;
          }
          if (fieldPath === 'returnItems') {
            return `
              returnItems {
                id
                quantity
                requestedQuantity
                receivedQuantity
                lineItem {
                  id
                  title
                  productVariant {
                    id
                    title
                  }
                }
              }
            `;
          }
          if (fieldPath === 'shippingMethod') {
            return `
              shippingMethod {
                id
                name
                provider {
                  id
                  name
                }
              }
            `;
          }
          return list.fields[fieldPath].controller.graphqlSelection;
        })
        .join("\n");
      return gql`
        query ($where: ${list.gqlNames.whereInputName}, $take: Int!, $skip: Int!, $orderBy: [${list.gqlNames.listOrderName}!]) {
          items: ${list.gqlNames.listQueryName}(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
            ${selectedFields.has("id") ? "" : "id"}
            ${selectedGqlFields}
          }
          count: ${list.gqlNames.listQueryCountName}(where: $where)
        }
      `;
    }, [list, selectedFields]),
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

  // Custom field views for Return list
  const fieldViews = {
    status: {
      render: ({ item }) => (
        <Badge 
          variant={
            item.status === 'requested' ? 'secondary' :
            item.status === 'received' ? 'default' :
            item.status === 'pending' ? 'warning' :
            item.status === 'completed' ? 'success' :
            'destructive'
          }
        >
          {item.status}
        </Badge>
      )
    },
    order: {
      render: ({ item }) => (
        <div>
          <div className="font-medium">#{item.order?.displayId}</div>
          {item.order?.user && (
            <div className="text-sm text-muted-foreground">
              {item.order.user.name} ({item.order.user.email})
            </div>
          )}
        </div>
      )
    },
    returnItems: {
      render: ({ item }) => (
        <div className="space-y-1">
          {item.returnItems?.map(returnItem => (
            <div key={returnItem.id} className="text-sm">
              {returnItem.quantity}x {returnItem.lineItem?.productVariant?.title}
              <div className="text-xs text-muted-foreground">
                Requested: {returnItem.requestedQuantity}, Received: {returnItem.receivedQuantity || 0}
              </div>
            </div>
          ))}
        </div>
      )
    },
    refundAmount: {
      render: ({ item }) => (
        <div className="font-medium">
          ${(item.refundAmount / 100).toFixed(2)}
        </div>
      )
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/oms">OMS</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Returns</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Returns</h1>
            <p className="text-sm text-muted-foreground">
              Manage return requests and refunds
            </p>
          </div>
          {showCreate && (
            <CreateButtonLink href={`/dashboard/platform/returns/new`}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Return
            </CreateButtonLink>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder={`Search by ${searchLabels.join(", ")}`}
            value={searchString}
            onChange={e => {
              updateSearchString(e.target.value);
              updateSearch(e.target.value);
            }}
            className="h-8 w-full"
          />
        </div>
        <FilterAdd type="button" listKey={listKey} fields={filterableFields} />
        <FieldSelection
          fields={selectedFields}
          fieldModesByField={listViewFieldModesByField}
          listKey={listKey}
        />
        <SortSelection
          orderableFields={orderableFields}
          sortKey={sort?.field}
          sortDirection={sort?.direction}
          listKey={listKey}
        />
      </div>

      <FilterList filters={filters} list={list} />

      <ListTable
        count={data?.count ?? 0}
        currentPage={currentPage}
        itemsGetter={dataGetter.get("items")}
        listKey={listKey}
        selectedFields={selectedFields}
        pageSize={pageSize}
        fieldModesByField={listViewFieldModesByField}
        fieldViews={fieldViews}
        selectedItems={selectedItemsState.selectedItems}
        onSelectedItemsChange={selectedItems => {
          setSelectedItems(state => ({
            itemsFromServer: state.itemsFromServer,
            selectedItems,
          }));
        }}
      />

      <div className="flex items-center justify-between">
        <DeleteManyButton
          list={list}
          selectedItems={selectedItemsState.selectedItems}
          refetch={refetch}
        />
        <Pagination count={data?.count ?? 0} currentPage={currentPage} pageSize={pageSize}>
          <PaginationStats />
          <PaginationNavigation />
          <PaginationDropdown />
        </Pagination>
      </div>
    </div>
  );
} 