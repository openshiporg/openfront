import React from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Button } from "@ui/button";
import { PlusIcon, TrashIcon } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@ui/form";
import { Input } from "@ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@ui/dialog";

const USER_ADDRESSES_QUERY = gql`
  query UserAddresses($where: UserWhereUniqueInput!) {
    user(where: $where) {
      id
      addresses {
        id
        address1
        address2
        city
        state
        postalCode
      }
    }
  }
`;

const CREATE_ADDRESS_MUTATION = gql`
  mutation CreateAddress($data: AddressCreateInput!) {
    createAddress(data: $data) {
      id
      address1
      address2
      city
      state
      postalCode
    }
  }
`;

const DELETE_ADDRESS_MUTATION = gql`
  mutation DeleteAddress($where: AddressWhereUniqueInput!) {
    deleteAddress(where: $where) {
      id
    }
  }
`;

export function AddressBook({ userId }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { data, loading } = useQuery(USER_ADDRESSES_QUERY, {
    variables: { where: { id: userId } }
  });

  const [createAddress, { loading: creating }] = useMutation(CREATE_ADDRESS_MUTATION, {
    refetchQueries: [{ query: USER_ADDRESSES_QUERY, variables: { where: { id: userId } } }]
  });

  const [deleteAddress] = useMutation(DELETE_ADDRESS_MUTATION, {
    refetchQueries: [{ query: USER_ADDRESSES_QUERY, variables: { where: { id: userId } } }]
  });

  const onSubmit = async (formData) => {
    try {
      await createAddress({
        variables: {
          data: {
            user: { connect: { id: userId } },
            address1: formData.address1,
            address2: formData.address2,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode
          }
        }
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create address:', error);
    }
  };

  if (loading) return <div>Loading addresses...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Addresses</CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Address
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Address</DialogTitle>
              </DialogHeader>
              <Form onSubmit={onSubmit}>
                <div className="space-y-4">
                  <FormField
                    name="address1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 1</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="address2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 2</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={creating}>
                    {creating ? "Adding..." : "Add Address"}
                  </Button>
                </div>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data?.user?.addresses.map((address) => (
            <div key={address.id} className="flex items-start justify-between rounded-lg border p-4">
              <div>
                <p>{address.address1}</p>
                {address.address2 && <p>{address.address2}</p>}
                <p>{address.city}, {address.state} {address.postalCode}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => deleteAddress({ variables: { where: { id: address.id } } })}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 