import React from "react";
import { gql } from "@keystone-6/core/admin-ui/apollo";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Button } from "@ui/button";
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react";
import { Badge } from "@ui/badge";

const SHIPPING_PROFILES_QUERY = gql`
  query ShippingProfiles($where: ShippingProfileWhereInput = {}) {
    shippingProfiles(where: $where) {
      id
      name
      type
      metadata
      products {
        id
        title
      }
      shippingOptions {
        id
        name
        priceType
        amount
      }
    }
  }
`;

export function ShippingProfiles({ profiles }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Shipping Profiles</CardTitle>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Profile
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-1">
                <h3 className="font-medium">{profile.name}</h3>
                <Badge variant="secondary">
                  {profile.type}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 