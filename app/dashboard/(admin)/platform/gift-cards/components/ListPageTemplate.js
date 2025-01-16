'use client';

import React from 'react';
import { gql } from "@keystone-6/core/admin-ui/apollo";
import { useList } from "@keystone/keystonejs-client-core";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { PlusIcon } from "lucide-react";
import { ListTable } from "@keystone/components/ListTable";
import { useRouter } from "next/navigation";

const LIST_FIELDS = [
  { field: "code", label: "Code" },
  { field: "value", label: "Value" },
  { field: "balance", label: "Balance" },
  { field: "isDisabled", label: "Status" },
  { field: "createdAt", label: "Created" },
];

export function ListPageTemplate() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);

  const list = useList({
    listKey: "GiftCard",
    searchFields: ["code"],
    searchTerm,
    fields: LIST_FIELDS.map(f => f.field),
    pageSize: 50,
    currentPage,
  });

  const handleCreateNew = () => {
    router.push("/dashboard/admin/platform/gift-cards/new");
  };

  const formatters = {
    code: (item) => item.code,
    value: (item) => `$${item.value}`,
    balance: (item) => `$${item.balance}`,
    isDisabled: (item) => (
      <Badge variant={item.isDisabled ? "destructive" : "success"}>
        {item.isDisabled ? "Disabled" : "Active"}
      </Badge>
    ),
    createdAt: (item) => new Date(item.createdAt).toLocaleDateString(),
  };

  return (
    <div className="flex h-full flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gift Cards</h1>
          <p className="text-sm text-zinc-500">
            Manage and issue gift cards
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search gift cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
          <Button onClick={handleCreateNew}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Gift Card
          </Button>
        </div>
      </div>

      <ListTable
        listKey="GiftCard"
        fields={LIST_FIELDS}
        items={list.items}
        formatters={formatters}
        onItemClick={(item) => router.push(`/dashboard/admin/platform/gift-cards/${item.id}`)}
        isLoading={list.isLoading}
        pageSize={50}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        total={list.pageInfo?.total}
      />
    </div>
  );
} 