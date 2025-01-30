'use client';

import React from 'react';
import { gql, useQuery, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { useRouter } from "next/navigation";
import { useToast } from "@ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
import { GiftCardForm } from "./GiftCardForm";
import { GiftCardCustomization } from "./GiftCardCustomization";

const GIFT_CARD_QUERY = gql`
  query GiftCard($id: ID!) {
    giftCard(where: { id: $id }) {
      id
      code
      value
      balance
      isDisabled
      endsAt
      metadata
      order {
        id
        displayId
      }
      giftCardTransactions {
        id
        type
        amount
        createdAt
      }
      region {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_GIFT_CARD = gql`
  mutation UpdateGiftCard($id: ID!, $data: GiftCardUpdateInput!) {
    updateGiftCard(where: { id: $id }, data: $data) {
      id
      isDisabled
      metadata
    }
  }
`;

export function ItemPageTemplate({ id }) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState("details");

  const { data, loading, refetch } = useQuery(GIFT_CARD_QUERY, {
    variables: { id },
  });

  const [updateGiftCard] = useMutation(UPDATE_GIFT_CARD, {
    onCompleted: () => {
      toast({
        title: "Gift card updated",
        description: "The gift card has been updated successfully.",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error updating gift card",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!data?.giftCard) {
    return <div>Gift card not found</div>;
  }

  const giftCard = data.giftCard;

  const handleToggleStatus = () => {
    updateGiftCard({
      variables: {
        id: giftCard.id,
        data: {
          isDisabled: !giftCard.isDisabled,
        },
      },
    });
  };

  const handleUpdateCustomization = (customization) => {
    updateGiftCard({
      variables: {
        id: giftCard.id,
        data: {
          metadata: {
            ...giftCard.metadata,
            customization,
          },
        },
      },
    });
  };

  return (
    <div className="flex h-full flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Gift Card Details</h1>
            <Badge variant={giftCard.isDisabled ? "destructive" : "success"}>
              {giftCard.isDisabled ? "Disabled" : "Active"}
            </Badge>
          </div>
          <p className="text-sm text-zinc-500">Code: {giftCard.code}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleToggleStatus}>
            {giftCard.isDisabled ? "Enable" : "Disable"} Gift Card
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard/admin/platform/gift-cards")}>
            Back to List
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="customization">Customization</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <GiftCardForm giftCard={giftCard} onSuccess={refetch} />
        </TabsContent>

        <TabsContent value="customization" className="mt-4">
          <GiftCardCustomization
            customization={giftCard.metadata?.customization || {}}
            onChange={handleUpdateCustomization}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {giftCard.giftCardTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium capitalize">{transaction.type}</p>
                      <p className="text-sm text-zinc-500">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={transaction.type === "debit" ? "destructive" : "success"}>
                      {transaction.type === "debit" ? "-" : "+"}${transaction.amount}
                    </Badge>
                  </div>
                ))}
                {giftCard.giftCardTransactions.length === 0 && (
                  <p className="text-center text-zinc-500">No transactions found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 