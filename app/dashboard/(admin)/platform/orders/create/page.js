"use client";

import React, { useState } from "react";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { useList } from "@keystone/keystoneProvider";
import { Button } from "@ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { useCreateItem } from "@keystone/utils/useCreateItem";
import { PageBreadcrumbs } from "@keystone/themes/Tailwind/orion/components/PageBreadcrumbs";
import { MultipleSelector } from "@keystone/themes/Tailwind/orion/primitives/default/ui/multi-select";
import { GraphQLErrorNotice } from "@keystone/themes/Tailwind/orion/components/GraphQLErrorNotice";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

const GET_USERS = gql`
  query RelationshipSelect(
    $where: UserWhereInput!
    $take: Int!
    $skip: Int!
  ) {
    items: users(where: $where, take: $take, skip: $skip) {
      ____id____: id
      ____label____: name
      email
      phone
      __typename
    }
    count: usersCount(where: $where)
  }
`;

export default function CreateDraftOrderPage() {
  const router = useRouter();
  const list = useList("DraftOrder");
  const { create, props, state, error } = useCreateItem(list);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleSave = async () => {
    if (!selectedCustomer) {
      return;
    }

    try {
      const item = await create({
        data: {
          status: "open",
          user: { connect: { id: selectedCustomer[0].value } },
          metadata: {
            source: "admin",
            createdBy: "admin",
          },
        },
      });

      if (item?.id) {
        router.push(`/dashboard/platform/orders/${item.id}`);
      }
    } catch (err) {
      console.error("Failed to create draft order:", err);
    }
  };

  return (
    <div className="h-full">
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
            type: "link",
            label: "Orders",
            href: "/platform/orders",
          },
          {
            type: "page",
            label: "Create Draft Order",
          },
        ]}
      />

      <main className="w-full max-w-4xl p-4 md:p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex-col items-center">
            <h1 className="text-lg font-semibold md:text-2xl">
              Create Draft Order
            </h1>
            <p className="text-muted-foreground text-sm">
              Create a new draft order by selecting a customer and adding products
            </p>
          </div>
          <Button
            isLoading={state === "loading"}
            onClick={handleSave}
            size="default"
            className="h-9"
            disabled={!selectedCustomer}
          >
            <Save className="mr-2 h-4 w-4" />
            Create Draft Order
          </Button>
        </div>

        {error && (
          <GraphQLErrorNotice
            networkError={error?.networkError}
            errors={error?.graphQLErrors}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-muted/40">
              <CardHeader className="flex flex-row items-center justify-between p-3 pb-0">
                <CardTitle className="text-base">Products</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-3">
                <p className="text-sm text-muted-foreground">
                  Product search functionality coming soon...
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-muted/40">
              <CardHeader className="flex flex-row items-center justify-between p-3 pb-0">
                <CardTitle className="text-base">Customer</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-3">
                <MultipleSelector
                  placeholder="Search customers..."
                  maxSelected={1}
                  onSearch={async (searchTerm) => {
                    const { data } = await fetch("/api/graphql", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        query: GET_USERS.loc.source.body,
                        variables: {
                          where: {
                            OR: [
                              { name: { contains: searchTerm } },
                              { email: { contains: searchTerm } },
                            ],
                          },
                          take: 10,
                          skip: 0,
                        },
                      }),
                    }).then((res) => res.json());

                    return data.items.map((item) => ({
                      value: item.____id____,
                      label: `${item.____label____} (${item.email})`,
                    }));
                  }}
                  value={selectedCustomer}
                  onChange={setSelectedCustomer}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 