import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { PlusIcon, XIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { gql, useQuery, useMutation } from "@apollo/client";

const CUSTOMER_GROUPS_QUERY = gql`
  query CustomerGroups($where: CustomerGroupWhereInput = {}, $orderBy: [CustomerGroupOrderByInput!] = [], $take: Int, $skip: Int) {
    customerGroups(
      where: $where,
      orderBy: $orderBy,
      take: $take,
      skip: $skip
    ) {
      id
      name
      users {
        id
        name
      }
      metadata
    }
    customerGroupsCount(where: $where)
  }
`;

const CREATE_CUSTOMER_GROUP_MUTATION = gql`
  mutation CreateCustomerGroup($data: CustomerGroupCreateInput!) {
    createCustomerGroup(data: $data) {
      id
      name
      metadata
    }
  }
`;

export function CustomerGroups() {
  const [selectedGroup, setSelectedGroup] = React.useState("");
  
  const { data, loading } = useQuery(CUSTOMER_GROUPS_QUERY, {
    variables: {
      orderBy: [{ name: 'asc' }]
    }
  });

  const [createCustomerGroup] = useMutation(CREATE_CUSTOMER_GROUP_MUTATION);

  const handleCreateGroup = async (name) => {
    try {
      await createCustomerGroup({
        variables: {
          data: {
            name
          }
        },
        refetchQueries: [{ query: CUSTOMER_GROUPS_QUERY }]
      });
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Customer Groups</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                {data?.customerGroups?.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              size="sm"
              onClick={() => {
                handleCreateGroup(selectedGroup);
                setSelectedGroup("");
              }}
              disabled={!selectedGroup}
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {data?.customerGroups?.map((group) => (
            <Badge key={group.id} className="flex items-center gap-1">
              {group.name}
              <button
                onClick={() => {
                  // Implement remove group functionality
                }}
                className="ml-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 p-0.5"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 