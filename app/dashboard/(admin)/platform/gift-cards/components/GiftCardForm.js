import React from "react";
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@ui/form";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const UPDATE_GIFT_CARD_MUTATION = gql`
  mutation UpdateGiftCard($where: GiftCardWhereUniqueInput!, $data: GiftCardUpdateInput!) {
    updateGiftCard(where: $where, data: $data) {
      id
      value
      balance
      status
      recipient {
        email
        name
      }
      expiresAt
    }
  }
`;

const formSchema = z.object({
  value: z.string().min(1, "Value is required"),
  recipientEmail: z.string().email("Invalid email").optional().nullable(),
  recipientName: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
});

export function GiftCardForm({ giftCard }) {
  const [updateGiftCard] = useMutation(UPDATE_GIFT_CARD_MUTATION);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: giftCard.value?.toString() || "",
      recipientEmail: giftCard.recipient?.email || "",
      recipientName: giftCard.recipient?.name || "",
      expiresAt: giftCard.expiresAt ? new Date(giftCard.expiresAt).toISOString().split("T")[0] : "",
    },
  });

  const onSubmit = async (values) => {
    try {
      await updateGiftCard({
        variables: {
          where: { id: giftCard.id },
          data: {
            value: parseFloat(values.value),
            recipient: {
              email: values.recipientEmail,
              name: values.recipientName,
            },
            expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : null,
          },
        },
      });
    } catch (error) {
      console.error("Failed to update gift card:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gift Card Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recipientEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recipientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 