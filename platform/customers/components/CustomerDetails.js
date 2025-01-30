import React from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@ui/form";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
import { CustomerOrders } from "./CustomerOrders";
import { CustomerGroups } from "./CustomerGroups";
import { AddressBook } from "./AddressBook";

const USER_QUERY = gql`
  query User($where: UserWhereUniqueInput!) {
    user(where: $where) {
      id
      name
      email
      phone
      hasAccount
      metadata
    }
  }
`;

const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($where: UserWhereUniqueInput!, $data: UserUpdateInput!) {
    updateUser(where: $where, data: $data) {
      id
      name
      email
      phone
      metadata
    }
  }
`;

export function CustomerDetails({ userId }) {
  const { data, loading } = useQuery(USER_QUERY, {
    variables: { where: { id: userId } }
  });

  const [updateUser, { loading: updating }] = useMutation(UPDATE_USER_MUTATION);

  if (loading) return <div>Loading...</div>;
  if (!data?.user) return <div>Customer not found</div>;

  const onSubmit = async (formData) => {
    try {
      await updateUser({
        variables: {
          where: { id: userId },
          data: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          }
        }
      });
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="groups">Groups</TabsTrigger>
        <TabsTrigger value="addresses">Addresses</TabsTrigger>
      </TabsList>

      <TabsContent value="details">
        <Form onSubmit={onSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                name="name"
                defaultValue={data.user.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="email"
                defaultValue={data.user.email}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="phone"
                defaultValue={data.user.phone}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={updating}>
                {updating ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </Form>
      </TabsContent>

      <TabsContent value="orders">
        <CustomerOrders userId={userId} />
      </TabsContent>

      <TabsContent value="groups">
        <CustomerGroups userId={userId} />
      </TabsContent>

      <TabsContent value="addresses">
        <AddressBook userId={userId} />
      </TabsContent>
    </Tabs>
  );
} 