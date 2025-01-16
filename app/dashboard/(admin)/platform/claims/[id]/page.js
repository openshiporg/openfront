import React from "react";
import { gql, useQuery, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Separator } from "@ui/separator";
import { formatDistance } from "date-fns";

const CLAIM_QUERY = gql`
  query Claim($where: ClaimOrderWhereUniqueInput!) {
    claimOrder(where: $where) {
      id
      type
      status
      order {
        id
        displayId
        email
        total
      }
      claimItems {
        id
        item {
          id
          title
          thumbnail
          unitPrice
        }
        quantity
        reason {
          id
          label
          description
        }
        images {
          id
          url
        }
        tags {
          id
          value
        }
      }
      additionalItems {
        id
        title
        quantity
        unitPrice
      }
      shippingAddress {
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        countryCode
        phone
      }
      shippingMethod {
        id
        name
        price
      }
      refund {
        id
        amount
        reason
        note
      }
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_CLAIM_STATUS = gql`
  mutation UpdateClaimStatus($where: ClaimOrderWhereUniqueInput!, $data: ClaimOrderUpdateInput!) {
    updateClaimOrder(where: $where, data: $data) {
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

export default function ClaimDetailPage({ params }) {
  const { data, loading, error } = useQuery(CLAIM_QUERY, {
    variables: { where: { id: params.id } },
  });

  const [updateStatus] = useMutation(UPDATE_CLAIM_STATUS);
  const [createRefund] = useMutation(CREATE_REFUND);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const claim = data.claimOrder;
  if (!claim) return <div>Claim not found</div>;

  const handleReceiveItems = async () => {
    await updateStatus({
      variables: {
        where: { id: claim.id },
        data: { status: "received" },
      },
    });
  };

  const handleFulfillClaim = async () => {
    await updateStatus({
      variables: {
        where: { id: claim.id },
        data: { status: "fulfilled" },
      },
    });

    if (claim.type === "refund") {
      const totalRefundAmount = claim.claimItems.reduce((total, item) => {
        return total + (item.quantity * item.item.unitPrice);
      }, 0);

      await createRefund({
        variables: {
          data: {
            claimOrder: { connect: { id: claim.id } },
            amount: totalRefundAmount,
            reason: "claim_refund",
            note: "Refund for claimed items",
          },
        },
      });
    }
  };

  const handleCancelClaim = async () => {
    await updateStatus({
      variables: {
        where: { id: claim.id },
        data: { status: "cancelled" },
      },
    });
  };

  return (
    <div className="flex h-full flex-col gap-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Claim #{claim.id.slice(0, 8)}</h1>
          <Badge variant={claim.status === "fulfilled" ? "success" : "secondary"}>
            {claim.status}
          </Badge>
          <Badge variant="outline">{claim.type}</Badge>
        </div>
        <div className="flex gap-2">
          {claim.status === "created" && (
            <>
              <Button onClick={handleReceiveItems}>Receive Items</Button>
              <Button variant="destructive" onClick={handleCancelClaim}>
                Cancel Claim
              </Button>
            </>
          )}
          {claim.status === "received" && (
            <Button onClick={handleFulfillClaim}>
              {claim.type === "refund" ? "Process Refund" : "Fulfill Replacement"}
            </Button>
          )}
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
                <span className="text-sm text-zinc-500">Order Number</span>
                <p>#{claim.order.displayId}</p>
              </div>
              <div>
                <span className="text-sm text-zinc-500">Customer Email</span>
                <p>{claim.order.email}</p>
              </div>
              <div>
                <span className="text-sm text-zinc-500">Order Total</span>
                <p>${claim.order.total / 100}</p>
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
                <span className="text-sm text-zinc-500">Created</span>
                <p>{formatDistance(new Date(claim.createdAt), new Date(), { addSuffix: true })}</p>
              </div>
              <div>
                <span className="text-sm text-zinc-500">Shipping Method</span>
                <p>{claim.shippingMethod?.name || "Not specified"}</p>
              </div>
              {claim.refund && (
                <div>
                  <span className="text-sm text-zinc-500">Refund Amount</span>
                  <p>${claim.refund.amount / 100}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            {claim.shippingAddress ? (
              <div className="flex flex-col gap-1 text-sm">
                <p>{claim.shippingAddress.firstName} {claim.shippingAddress.lastName}</p>
                {claim.shippingAddress.company && <p>{claim.shippingAddress.company}</p>}
                <p>{claim.shippingAddress.address1}</p>
                {claim.shippingAddress.address2 && <p>{claim.shippingAddress.address2}</p>}
                <p>
                  {claim.shippingAddress.city}, {claim.shippingAddress.province} {claim.shippingAddress.postalCode}
                </p>
                <p>{claim.shippingAddress.countryCode}</p>
                {claim.shippingAddress.phone && <p>{claim.shippingAddress.phone}</p>}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No shipping address specified</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Claimed Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {claim.claimItems.map((item) => (
              <div key={item.id} className="flex items-start gap-4 border-b pb-4">
                {item.item.thumbnail && (
                  <img
                    src={item.item.thumbnail}
                    alt={item.item.title}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{item.item.title}</h3>
                  <div className="flex gap-4 text-sm text-zinc-500">
                    <span>Quantity: {item.quantity}</span>
                    <span>Reason: {item.reason.label}</span>
                  </div>
                  {item.tags.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      {item.tags.map((tag) => (
                        <Badge key={tag.id} variant="secondary">
                          {tag.value}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {item.images.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      {item.images.map((image) => (
                        <img
                          key={image.id}
                          src={image.url}
                          alt="Claim evidence"
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${(item.item.unitPrice * item.quantity) / 100}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {claim.additionalItems?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {claim.additionalItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 border-b pb-4">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <span className="text-sm text-zinc-500">
                      Quantity: {item.quantity}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${(item.unitPrice * item.quantity) / 100}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 