import React from "react";
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@ui/form";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";

const CREATE_DISCOUNT_MUTATION = gql`
  mutation CreateDiscount($data: DiscountCreateInput!) {
    createDiscount(data: $data) {
      id
      code
    }
  }
`;

export function DiscountForm({ onSuccess }) {
  const [createDiscount, { loading }] = useMutation(CREATE_DISCOUNT_MUTATION);

  const onSubmit = async (data) => {
    try {
      await createDiscount({
        variables: {
          data: {
            code: data.code,
            type: data.type,
            value: parseFloat(data.value),
            startsAt: data.startsAt,
            endsAt: data.endsAt,
            usageLimit: parseInt(data.usageLimit),
            status: "active"
          }
        }
      });
      onSuccess?.();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Discount Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Code</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="SUMMER2024" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
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
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input {...field} type="number" />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Discount"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Form>
  );
} 