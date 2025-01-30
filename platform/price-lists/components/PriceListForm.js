import React from "react";
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@ui/form";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
import { Textarea } from "@ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const UPDATE_PRICE_LIST_MUTATION = gql`
  mutation UpdatePriceList($where: PriceListWhereUniqueInput!, $data: PriceListUpdateInput!) {
    updatePriceList(where: $where, data: $data) {
      id
      name
      description
      status
      type
    }
  }
`;

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.enum(["sale", "override"]),
  status: z.enum(["active", "draft"]),
});

export function PriceListForm({ priceList }) {
  const [updatePriceList] = useMutation(UPDATE_PRICE_LIST_MUTATION);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: priceList.name,
      description: priceList.description || "",
      type: priceList.type,
      status: priceList.status,
    },
  });

  const onSubmit = async (values) => {
    try {
      await updatePriceList({
        variables: {
          where: { id: priceList.id },
          data: values,
        },
      });
    } catch (error) {
      console.error("Failed to update price list:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price List Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sale">Sale</SelectItem>
                        <SelectItem value="override">Override</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 