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
import { gql } from "@apollo/client";

const DISCOUNTS_LIST_QUERY = gql`
  query Discounts($where: DiscountWhereInput = {}, $orderBy: [DiscountOrderByInput!] = [], $take: Int, $skip: Int) {
    discounts(
      where: $where,
      orderBy: $orderBy,
      take: $take,
      skip: $skip
    ) {
      id
      code
      type
      value
      startsAt
      endsAt
      usageLimit
      usageCount
      status
      metadata
      regions {
        id
        name
      }
    }
    discountsCount(where: $where)
  }
`;

export function DiscountList({ discounts, isLoading, error, onPageChange, total }) {
  if (error) {
    return <div>Error loading discounts: {error.message}</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : (
            discounts.map((discount) => (
              <TableRow key={discount.id}>
                <TableCell className="font-medium">{discount.code}</TableCell>
                <TableCell>{discount.type}</TableCell>
                <TableCell>
                  {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                </TableCell>
                <TableCell>
                  {discount.usageCount} / {discount.usageLimit || '∞'}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(discount.status)}>
                    {discount.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {discount.startsAt && (
                    <span className="text-sm text-zinc-500">
                      {formatDistance(new Date(discount.startsAt), new Date(), { addSuffix: true })}
                      {discount.endsAt && ' - '}
                      {discount.endsAt && formatDistance(new Date(discount.endsAt), new Date(), { addSuffix: true })}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function getStatusVariant(status) {
  switch (status) {
    case 'active':
      return 'success';
    case 'scheduled':
      return 'warning';
    case 'expired':
      return 'destructive';
    case 'disabled':
      return 'secondary';
    default:
      return 'secondary';
  }
} 