import React from "react";
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@ui/form";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
import { Checkbox } from "@ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const UPDATE_DRAFT_ORDER_MUTATION = gql`
  mutation UpdateDraftOrder($where: DraftOrderWhereUniqueInput!, $data: DraftOrderUpdateInput!) {
    updateDraftOrder(where: $where, data: $data) {
      id
      status
      noNotificationOrder
      cart {
        id
        email
      }
    }
  }
`;

const formSchema = z.object({
  email: z.string().email("Invalid email").optional().nullable(),
  noNotification: z.boolean().optional(),
  shippingAddress: z.object({
    address1: z.string().min(1, "Address is required"),
    address2: z.string().optional().nullable(),
    city: z.string().min(1, "City is required"),
    country: z.string().min(1, "Country is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    province: z.string().optional().nullable(),
  }).optional().nullable(),
  billingAddress: z.object({
    address1: z.string().min(1, "Address is required"),
    address2: z.string().optional().nullable(),
    city: z.string().min(1, "City is required"),
    country: z.string().min(1, "Country is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    province: z.string().optional().nullable(),
  }).optional().nullable(),
});

export function DraftOrderForm({ draftOrder }) {
  const [updateDraftOrder] = useMutation(UPDATE_DRAFT_ORDER_MUTATION);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: draftOrder.cart?.email || "",
      noNotification: draftOrder.noNotificationOrder || false,
      shippingAddress: draftOrder.cart?.shippingAddress || {},
      billingAddress: draftOrder.cart?.billingAddress || {},
    },
  });

  const onSubmit = async (values) => {
    try {
      await updateDraftOrder({
        variables: {
          where: { id: draftOrder.id },
          data: {
            noNotificationOrder: values.noNotification,
            cart: {
              update: {
                email: values.email,
                shippingAddress: {
                  create: values.shippingAddress,
                },
                billingAddress: {
                  create: values.billingAddress,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error("Failed to update draft order:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="font-medium">Shipping Address</h3>
                <FormField
                  control={form.control}
                  name="shippingAddress.address1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shippingAddress.address2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apartment, suite, etc.</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="shippingAddress.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shippingAddress.province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="shippingAddress.postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shippingAddress.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Billing Address</h3>
                <FormField
                  control={form.control}
                  name="billingAddress.address1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billingAddress.address2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apartment, suite, etc.</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="billingAddress.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="billingAddress.province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="billingAddress.postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="billingAddress.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="noNotification"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Don't send order confirmation email
                    </FormLabel>
                  </div>
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