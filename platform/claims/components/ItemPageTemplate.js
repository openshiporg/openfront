"use client";

import { useCallback } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { Fields } from "@keystone/themes/Tailwind/orion/components/Fields";

const CLAIM_QUERY = gql`
  query Claim($where: ClaimWhereUniqueInput!) {
    claim(where: $where) {
      id
      status
      type
      order {
        id
        displayId
        email
        user {
          id
          name
          email
        }
        total
      }
      claimItems {
        id
        quantity
        reason {
          id
          label
          description
        }
        item {
          id
          title
          productVariant {
            id
            title
            thumbnail
            unitPrice
          }
        }
      }
      refundAmount
      replacementItems {
        id
        quantity
        productVariant {
          id
          title
          thumbnail
          unitPrice
        }
      }
      fulfillment {
        id
        status
        trackingNumber
        trackingUrl
      }
      metadata
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_CLAIM_STATUS = gql`
  mutation UpdateClaimStatus($where: ClaimWhereUniqueInput!, $data: ClaimUpdateInput!) {
    updateClaim(where: $where, data: $data) {
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

const CREATE_FULFILLMENT = gql`
  mutation CreateFulfillment($data: FulfillmentCreateInput!) {
    createFulfillment(data: $data) {
      id
      status
    }
  }
`;

export function ItemPageTemplate({ listKey = "Claim", id }) {
  const list = useList(listKey);

  const { data, loading, error, refetch } = useQuery(CLAIM_QUERY, {
    variables: { where: { id } },
    errorPolicy: 'all',
  });

  const [updateStatus] = useMutation(UPDATE_CLAIM_STATUS);
  const [createRefund] = useMutation(CREATE_REFUND);
  const [createFulfillment] = useMutation(CREATE_FULFILLMENT);

  const dataGetter = makeDataGetter(data, error?.graphQLErrors);
  const claimData = dataGetter.get("claim");

  // Action Handlers
  const handleApproveClaim = async () => {
    try {
      await updateStatus({
        variables: {
          where: { id: claimData.data.id },
          data: { status: "approved" },
        },
      });
      refetch();
    } catch (err) {
      console.error("Failed to approve claim:", err);
    }
  };

  const handleRejectClaim = async () => {
    try {
      await updateStatus({
        variables: {
          where: { id: claimData.data.id },
          data: { status: "rejected" },
        },
      });
      refetch();
    } catch (err) {
      console.error("Failed to reject claim:", err);
    }
  };

  const handleProcessRefund = async () => {
    try {
      await createRefund({
        variables: {
          data: {
            claim: { connect: { id: claimData.data.id } },
            amount: claimData.data.refundAmount,
            reason: "claim_refund",
            note: "Refund for approved claim",
          },
        },
      });

      await updateStatus({
        variables: {
          where: { id: claimData.data.id },
          data: { status: "completed" },
        },
      });
      
      refetch();
    } catch (err) {
      console.error("Failed to process refund:", err);
    }
  };

  const handleCreateFulfillment = async () => {
    try {
      await createFulfillment({
        variables: {
          data: {
            claim: { connect: { id: claimData.data.id } },
            items: claimData.data.replacementItems.map(item => ({
              productVariant: { connect: { id: item.productVariant.id } },
              quantity: item.quantity,
            })),
          },
        },
      });
      refetch();
    } catch (err) {
      console.error("Failed to create fulfillment:", err);
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
  if (!claimData.data) return <div>Claim not found</div>;

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
              <BreadcrumbLink href="/dashboard/platform/claims">Claims</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              Claim #{claimData.data.id.slice(0, 8)}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">
              Claim #{claimData.data.id.slice(0, 8)}
            </h1>
            <Badge 
              variant={
                claimData.data.status === "approved" ? "success" :
                claimData.data.status === "rejected" ? "destructive" :
                claimData.data.status === "pending" ? "warning" :
                "secondary"
              }
            >
              {claimData.data.status}
            </Badge>
            <Badge variant={claimData.data.type === "refund" ? "default" : "secondary"}>
              {claimData.data.type}
            </Badge>
          </div>
          <div className="flex gap-2">
            {claimData.data.status === "pending" && (
              <>
                <Button onClick={handleApproveClaim}>Approve Claim</Button>
                <Button variant="destructive" onClick={handleRejectClaim}>
                  Reject Claim
                </Button>
              </>
            )}
            {claimData.data.status === "approved" && claimData.data.type === "refund" && !claimData.data.refund && (
              <Button onClick={handleProcessRefund}>Process Refund</Button>
            )}
            {claimData.data.status === "approved" && 
             claimData.data.type === "replace" && 
             !claimData.data.fulfillment && (
              <Button onClick={handleCreateFulfillment}>Create Fulfillment</Button>
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
                <p>
                  <a
                    href={`/dashboard/platform/orders/${claimData.data.order.id}`}
                    className="hover:underline"
                  >
                    #{claimData.data.order.displayId}
                  </a>
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Customer</span>
                <p>{claimData.data.order.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {claimData.data.order.user.email}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Order Total</span>
                <p>${claimData.data.order.total / 100}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Claim Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div>
                <span className="text-sm text-muted-foreground">Created</span>
                <p>{formatDistance(new Date(claimData.data.createdAt), new Date(), { addSuffix: true })}</p>
              </div>
              {claimData.data.refundAmount > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">Refund Amount</span>
                  <p>${claimData.data.refundAmount / 100}</p>
                </div>
              )}
              {claimData.data.fulfillment && (
                <div>
                  <span className="text-sm text-muted-foreground">Fulfillment Status</span>
                  <p>
                    <Badge variant="outline">{claimData.data.fulfillment.status}</Badge>
                  </p>
                  {claimData.data.fulfillment.trackingNumber && (
                    <a
                      href={claimData.data.fulfillment.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Track Package ({claimData.data.fulfillment.trackingNumber})
                    </a>
                  )}
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
                  {formatDistance(new Date(claimData.data.createdAt), new Date(), { addSuffix: true })}
                </span>
              </div>
              {claimData.data.updatedAt !== claimData.data.createdAt && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Updated</Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDistance(new Date(claimData.data.updatedAt), new Date(), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Claim Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {claimData.data.claimItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 border-b pb-4">
                {item.item.productVariant.thumbnail && (
                  <img
                    src={item.item.productVariant.thumbnail}
                    alt={item.item.title}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{item.item.productVariant.title}</h3>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Quantity: {item.quantity}</span>
                  </div>
                  {item.reason && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Reason: {item.reason.label}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${(item.item.productVariant.unitPrice * item.quantity) / 100}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {claimData.data.type === "replace" && claimData.data.replacementItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Replacement Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {claimData.data.replacementItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 border-b pb-4">
                  {item.productVariant.thumbnail && (
                    <img
                      src={item.productVariant.thumbnail}
                      alt={item.productVariant.title}
                      className="h-16 w-16 rounded-md object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium">{item.productVariant.title}</h3>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Quantity: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${(item.productVariant.unitPrice * item.quantity) / 100}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Fields
            fields={list.fields}
            fieldModes={{ id: 'read', status: 'read', type: 'read', order: 'read', items: 'read' }}
            fieldPositions={{ metadata: 'main' }}
            value={claimData.data}
          />
        </CardContent>
      </Card>
    </div>
  );
} 