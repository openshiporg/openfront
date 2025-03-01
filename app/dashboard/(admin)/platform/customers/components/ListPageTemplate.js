"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@keystone-6/core/admin-ui/apollo";
import { useList } from "@keystone/keystoneProvider";
import { Button } from "@keystone/themes/Tailwind/orion/primitives/default/ui/button";
import { Input } from "@keystone/themes/Tailwind/orion/primitives/default/ui/input";
import { Pagination } from "@keystone/themes/Tailwind/orion/primitives/default/ui/pagination";
import { Skeleton } from "@keystone/themes/Tailwind/orion/primitives/default/ui/skeleton";
import { useToast } from "@keystone/themes/Tailwind/orion/primitives/default/ui/use-toast";
import { CustomersTable } from "./CustomersTable";
import { LIST_QUERY } from "./queries";

const PAGE_SIZE = 10;

export function ListPageTemplate({ listKey = "User" }) {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const list = useList(listKey);

  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Build the where clause for filtering
  const where = useMemo(() => {
    const filters = [];
    if (search) {
      filters.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
      });
    }
    return filters.length ? { AND: filters } : {};
  }, [search]);

  // Fetch customers data
  const { data, loading, error } = useQuery(LIST_QUERY, {
    variables: {
      where,
      orderBy: [{ createdAt: "desc" }],
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    },
    fetchPolicy: "cache-and-network",
  });

  const updateSearchString = useCallback(
    (newSearch) => {
      const params = new URLSearchParams(searchParams);
      if (newSearch) {
        params.set("search", newSearch);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const handlePageChange = useCallback(
    (newPage) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", newPage.toString());
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const handleCreateNew = useCallback(() => {
    router.push(`${pathname}/new`);
  }, [pathname, router]);

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load customers. Please try again.",
      variant: "destructive",
    });
  }

  return (
    <div className="space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Customers</h2>
          <p className="text-sm text-muted-foreground">
            Manage your platform customers
          </p>
        </div>
        <Button onClick={handleCreateNew}>Add Customer</Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => updateSearchString(e.target.value)}
          />
        </div>
      </div>

      {loading && !data ? (
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-10 w-[300px]" />
        </div>
      ) : (
        <>
          <CustomersTable
            data={data}
            error={error}
            listKey={listKey}
            list={list}
            query={LIST_QUERY}
            filters={where}
            searchParam={search}
            updateSearchString={updateSearchString}
            push={router.push}
            selectedItems={selectedItems}
            onSelectedItemsChange={setSelectedItems}
          />

          <Pagination
            className="justify-center"
            currentPage={page}
            totalItems={data?.usersCount || 0}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
} 