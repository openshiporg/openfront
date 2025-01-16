"use client";

import { useCallback, useMemo } from "react";
import { gql, useQuery, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { useList } from "@keystone/keystoneProvider";
import { makeDataGetter } from "@keystone-6/core/admin-ui/utils";
import { formatDistance } from "date-fns";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@ui/breadcrumb";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Separator } from "@ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { Fields } from "@keystone/themes/Tailwind/orion/components/Fields";

const RETURN_QUERY = gql`
  query Return($where: ReturnWhereUniqueInput!) {
    return(where: $where) {
      id
      status
      order {
        id
        displayId
        email
        total
        user {
          id
          name
          email
        }
      }
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
            thumbnail
            unitPrice
          }
        }
        reason {
          id
          label
          description
        }
      }
      shippingMethod {
        id
        name
        price
      }
      refundAmount
      metadata
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_RETURN_STATUS = gql`
  mutation UpdateReturnStatus($where: ReturnWhereUniqueInput!, $data: ReturnUpdateInput!) {
    updateReturn(where: $where, data: $data) {
      id
      status
    }
  }
`;

const CREATE_REFUND = gql`
  mutation CreateRefund($data: RefundCreateInput!) {
    createRefund(data: $data) {
      id
      amount
    }
  }
`;

export function ItemPageTemplate({ listKey = "Return", id }) {
  const list = useList(listKey);

  const { data, loading, error, refetch } = useQuery(RETURN_QUERY, {
    variables: { where: { id } },
    errorPolicy: 'all',
  });

  const [updateStatus] = useMutation(UPDATE_RETURN_STATUS);
  const [createRefund] = useMutation(CREATE_REFUND);

  const dataGetter = makeDataGetter(data, error?.graphQLErrors);
  const returnData = dataGetter.get("return");

  // Action Handlers
  const handleReceiveItems = async () => {
    try {
      await updateStatus({
        variables: {
          where: { id: returnData.data.id },
          data: { status: "received" },
        },
      });
      refetch();
    } catch (err) {
      console.error("Failed to receive items:", err);
    }
  };

  const handleProcessRefund = async () => {
    try {
      const totalRefundAmount = returnData.data.returnItems.reduce((total, item) => {
        return total + (item.receivedQuantity * item.lineItem.productVariant.unitPrice);
      }, 0);

      await createRefund({
        variables: {
          data: {
            return: { connect: { id: returnData.data.id } },
            amount: totalRefundAmount,
            reason: "return_refund",
            note: "Refund for returned items",
          },
        },
      });

      await updateStatus({
        variables: {
          where: { id: returnData.data.id },
          data: { status: "completed" },
        },
      });
      
      refetch();
    } catch (err) {
      console.error("Failed to process refund:", err);
    }
  };

  const handleCancelReturn = async () => {
    try {
      await updateStatus({
        variables: {
          where: { id: returnData.data.id },
          data: { status: "cancelled" },
        },
      });
      refetch();
    } catch (err) {
      console.error("Failed to cancel return:", err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }
  if (!returnData.data) return <div>Return not found</div>;

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
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/platform/returns">Returns</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              Return #{returnData.data.id.slice(0, 8)}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">
              Return #{returnData.data.id.slice(0, 8)}
            </h1>
            <Badge 
              variant={
                returnData.data.status === 'requested' ? 'secondary' :
                returnData.data.status === 'received' ? 'default' :
                returnData.data.status === 'pending' ? 'warning' :
                returnData.data.status === 'completed' ? 'success' :
                'destructive'
              }
            >
              {returnData.data.status}
            </Badge>
          </div>
          <div className="flex gap-2">
            {returnData.data.status === "requested" && (
              <>
                <Button onClick={handleReceiveItems}>Receive Items</Button>
                <Button variant="destructive" onClick={handleCancelReturn}>
                  Cancel Return
                </Button>
              </>
            )}
            {returnData.data.status === "received" && !returnData.data.refundAmount && (
              <Button onClick={handleProcessRefund}>Process Refund</Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div>
                <span className="text-sm text-muted-foreground">Order Number</span>
                <p>#{returnData.data.order.displayId}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Customer</span>
                <p>{returnData.data.order.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {returnData.data.order.user.email}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Order Total</span>
                <p>${returnData.data.order.total / 100}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Return Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div>
                <span className="text-sm text-muted-foreground">Created</span>
                <p>{formatDistance(new Date(returnData.data.createdAt), new Date(), { addSuffix: true })}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Shipping Method</span>
                <p>{returnData.data.shippingMethod?.name || "Not specified"}</p>
              </div>
              {returnData.data.refundAmount > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">Refund Amount</span>
                  <p>${returnData.data.refundAmount / 100}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Created</Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDistance(new Date(returnData.data.createdAt), new Date(), { addSuffix: true })}
                </span>
              </div>
              {returnData.data.updatedAt !== returnData.data.createdAt && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Updated</Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDistance(new Date(returnData.data.updatedAt), new Date(), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Return Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {returnData.data.returnItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 border-b pb-4">
                {item.lineItem.productVariant.thumbnail && (
                  <img
                    src={item.lineItem.productVariant.thumbnail}
                    alt={item.lineItem.title}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{item.lineItem.productVariant.title}</h3>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Quantity: {item.quantity}</span>
                    <span>Requested: {item.requestedQuantity}</span>
                    {item.receivedQuantity > 0 && (
                      <span>Received: {item.receivedQuantity}</span>
                    )}
                  </div>
                  {item.reason && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Reason: {item.reason.label}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${(item.lineItem.productVariant.unitPrice * item.quantity) / 100}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* We can still use orion Fields for form sections if needed */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Fields
            fields={list.fields}
            fieldModes={{ id: 'read', status: 'read', order: 'read', items: 'read' }}
            fieldPositions={{ metadata: 'main' }}
            value={returnData.data}
          />
        </CardContent>
      </Card>
    </div>
  );
} 