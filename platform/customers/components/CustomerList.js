import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/table";
import { Badge } from "@ui/badge";
import { formatDistance } from "date-fns";
import { gql, useQuery } from "@apollo/client";

const USERS_LIST_QUERY = gql`
  query Users($where: UserWhereInput = {}, $orderBy: [UserOrderByInput!] = [], $take: Int, $skip: Int) {
    users(
      where: $where,
      orderBy: $orderBy,
      take: $take,
      skip: $skip
    ) {
      id
      name
      email
      phone
      hasAccount
      orders {
        id
        total
      }
      customerGroups {
        id
        name
      }
      createdAt
    }
    usersCount(where: $where)
  }
`;

export function CustomerList() {
  const [searchParams, setSearchParams] = React.useState({
    where: {},
    orderBy: [{ createdAt: 'desc' }],
    take: 20,
    skip: 0,
  });

  const { data, loading, error } = useQuery(USERS_LIST_QUERY, {
    variables: searchParams
  });

  if (error) {
    return <div>Error loading customers: {error.message}</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Groups</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Total Spent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">Loading...</TableCell>
            </TableRow>
          ) : (
            data?.users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-sm text-zinc-500">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>{user.orders?.length || 0}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {user.customerGroups?.map((group) => (
                      <Badge key={group.id} variant="secondary">
                        {group.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {formatDistance(new Date(user.createdAt), new Date(), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  ${user.orders?.reduce((acc, order) => acc + order.total, 0) || 0}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {/* Add pagination using data?.usersCount */}
    </div>
  );
} 