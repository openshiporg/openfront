"use client";

import { useCallback, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@keystone/themes/Tailwind/orion/primitives/default/ui/table";
import { Badge } from "@keystone/themes/Tailwind/orion/primitives/default/ui/badge";
import { Button } from "@keystone/themes/Tailwind/orion/primitives/default/ui/button";
import { AdminLink } from "@keystone/themes/Tailwind/orion/components/AdminLink";
import { formatDistanceToNow } from "date-fns";
import { Checkbox } from "@keystone/themes/Tailwind/orion/primitives/default/ui/checkbox";
import { cn } from "@keystone/utils/cn";
import { TrashIcon } from "@heroicons/react/24/outline";

export function CustomersTable({
  data,
  error,
  listKey,
  list,
  query,
  filters,
  searchParam,
  updateSearchString,
  push,
  selectedItems,
  onSelectedItemsChange,
}) {
  const users = data?.users || [];
  const [selectedUsers, setSelectedUsers] = useState([]);

  const toggleAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  const toggleRow = useCallback(
    (id) => {
      if (selectedUsers.includes(id)) {
        setSelectedUsers(selectedUsers.filter((userId) => userId !== id));
      } else {
        setSelectedUsers([...selectedUsers, id]);
      }
      if (onSelectedItemsChange) {
        onSelectedItemsChange(selectedUsers);
      }
    },
    [selectedUsers, onSelectedItemsChange]
  );

  if (!data || error) {
    return null;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40px] px-2">
            <Checkbox
              checked={selectedUsers.length === users.length}
              onCheckedChange={toggleAll}
              aria-label="Select all"
              className="translate-y-[2px]"
            />
          </TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Groups</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="w-[40px] px-2">
              <Checkbox
                checked={selectedUsers.includes(user.id)}
                onCheckedChange={() => toggleRow(user.id)}
                aria-label={`Select ${user.name}`}
                className="translate-y-[2px]"
              />
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium">{user.name}</span>
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                {user.phone && (
                  <span className="text-sm text-muted-foreground">
                    {user.phone}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>
              {user.role ? (
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize",
                    user.role.name === "admin"
                      ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
                      : user.role.name === "member"
                      ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400"
                      : "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400"
                  )}
                >
                  {user.role.name}
                </Badge>
              ) : (
                <Badge variant="outline" className="capitalize">
                  Customer
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {user.customerGroups?.map((group) => (
                  <Badge
                    key={group.id}
                    variant="outline"
                    className="border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                  >
                    {group.name}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">
                  {user.orders?.length || 0} orders
                </span>
                {user.orders?.[0] && (
                  <span className="text-sm text-muted-foreground">
                    Last order:{" "}
                    {formatDistanceToNow(new Date(user.orders[0].createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>
              {formatDistanceToNow(new Date(user.createdAt), {
                addSuffix: true,
              })}
            </TableCell>
            <TableCell className="text-right">
              <AdminLink href={`/${list.path}/${user.id}`}>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </AdminLink>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 