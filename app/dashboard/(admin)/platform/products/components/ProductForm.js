import React from "react";
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Textarea } from "@ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@ui/form";

const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct($data: ProductCreateInput!) {
    createProduct(data: $data) {
      id
      title
      description
      handle
      status
      metadata
    }
  }
`;

const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProduct($where: ProductWhereUniqueInput!, $data: ProductUpdateInput!) {
    updateProduct(where: $where, data: $data) {
      id
      title
      description
      handle
      status
      metadata
    }
  }
`;

export function ProductForm({ onSuccess }) {
  const [createProduct, { loading }] = useMutation(CREATE_PRODUCT_MUTATION);

  const onSubmit = async (data) => {
    try {
      await createProduct({
        variables: {
          data: {
            title: data.title,
            description: data.description,
            status: "draft"
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
      <div className="space-y-6">
        <FormField
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Product name" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Product description" />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Product"}
        </Button>
      </div>
    </Form>
  );
} 