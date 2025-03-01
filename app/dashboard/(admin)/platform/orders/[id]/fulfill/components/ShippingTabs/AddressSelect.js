"use client";

import { useState, useId } from "react";
import { useForm } from "react-hook-form";
import { useQuery, gql } from "@keystone-6/core/admin-ui/apollo";
import { useList } from "@keystone/keystoneProvider";
import { useCreateItem } from "@keystone/utils/useCreateItem";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { RadioGroup, RadioGroupItem } from "@ui/radio-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@ui/select";
import { ChevronLeft } from "lucide-react";

const GET_USER_ADDRESSES = gql`
  query GetUserAddresses($userId: ID!, $take: Int!, $skip: Int!) {
    addresses(
      where: { user: { id: { equals: $userId } } }
      take: $take
      skip: $skip
    ) {
      id
      company
      firstName
      lastName
      address1
      address2
      city
      province
      postalCode
      phone
      label
    }
    addressesCount(where: { user: { id: { equals: $userId } } })
  }
`;

const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    authenticatedItem {
      ... on User {
        id
      }
    }
  }
`;

const GET_COUNTRIES = gql`
  query RelationshipSelect(
    $where: CountryWhereInput!
    $take: Int!
    $skip: Int!
  ) {
    items: countries(where: $where, take: $take, skip: $skip) {
      ____id____: id
      ____label____: name
      __typename
    }
    count: countriesCount(where: $where)
  }
`;

export function AddressSelect({ value, onChange }) {
  const id = useId();
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const addressesPerPage = 5;

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      company: "",
      address1: "",
      address2: "",
      city: "",
      province: "",
      postalCode: "",
      phone: "",
      country: "",
    },
  });

  const { data: userData } = useQuery(GET_CURRENT_USER);
  const userId = userData?.authenticatedItem?.id;

  const {
    data: addressData,
    loading: addressesLoading,
    refetch,
  } = useQuery(GET_USER_ADDRESSES, {
    variables: {
      userId,
      take: addressesPerPage,
      skip: (currentPage - 1) * addressesPerPage,
    },
    skip: !userId,
  });

  const { data: countriesData, loading: countriesLoading } = useQuery(
    GET_COUNTRIES,
    {
      variables: {
        where: {},
        take: 250,
        skip: 0,
      },
    }
  );

  const addressList = useList("Address");
  const { createWithData: createAddress, state: createState } =
    useCreateItem(addressList);

  const addresses = addressData?.addresses || [];
  const totalAddresses = addressData?.addressesCount || 0;
  const totalPages = Math.ceil(totalAddresses / addressesPerPage);

  const countries = countriesData?.items || [];

  const onSubmit = async (data) => {
    try {
      const result = await createAddress({
        data: {
          ...data,
          user: { connect: { id: userId } },
          country: { connect: { id: data.country } },
        },
      });

      if (result?.id) {
        setShowNewAddress(false);
        onChange(result.id);
        refetch();
        form.reset();
      }
    } catch (error) {
      console.error("Failed to create address:", error);
    }
  };

  return (
    <div className="space-y-2 mt-2">
      <Label className="mb-1.5 text-xs">Shipping from Address</Label>

      {showNewAddress ? (
        <div className="space-y-4 rounded-lg border p-4 bg-muted/40">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setShowNewAddress(false);
                form.reset();
              }}
              className="[&_svg]:size-3 w-5 h-5"
            >
              <ChevronLeft />
            </Button>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <Label className="mb-1.5 block text-xs">First Name</Label>
                <Input
                  className="h-8 rounded-lg text-sm"
                  placeholder="John"
                  {...form.register("firstName", { required: true })}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label className="mb-1.5 block text-xs">Last Name</Label>
                <Input
                  className="h-8 rounded-lg text-sm"
                  placeholder="Doe"
                  {...form.register("lastName", { required: true })}
                />
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block text-xs">Company (Optional)</Label>
              <Input
                className="h-8 rounded-lg text-sm"
                placeholder="Acme Inc."
                {...form.register("company")}
              />
            </div>

            <div>
              <Label className="mb-1.5 block text-xs">Street Address</Label>
              <Input
                className="h-8 rounded-lg text-sm mb-2"
                placeholder="123 Main Street"
                {...form.register("address1", { required: true })}
              />
              <Input
                className="h-8 rounded-lg text-sm"
                placeholder="Suite 100 (Optional)"
                {...form.register("address2")}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <Label className="mb-1.5 block text-xs">City</Label>
                <Input
                  className="h-8 rounded-lg text-sm"
                  placeholder="San Francisco"
                  {...form.register("city", { required: true })}
                />
              </div>
              <div className="w-[100px]">
                <Label className="mb-1.5 block text-xs">State</Label>
                <Input
                  className="h-8 rounded-lg text-sm"
                  placeholder="CA"
                  {...form.register("province", { required: true })}
                />
              </div>
              <div className="w-[120px]">
                <Label className="mb-1.5 block text-xs">ZIP Code</Label>
                <Input
                  className="h-8 rounded-lg text-sm"
                  placeholder="94105"
                  {...form.register("postalCode", { required: true })}
                />
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block text-xs">Country</Label>
              <Select
                onValueChange={(value) => form.setValue("country", value)}
                value={form.watch("country")}
              >
                <SelectTrigger className="h-8 rounded-lg text-sm">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {countriesLoading ? (
                      <SelectItem value="" disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      countries.map((country) => (
                        <SelectItem
                          key={country.____id____}
                          value={country.____id____}
                        >
                          {country.____label____}
                        </SelectItem>
                      ))
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1.5 block text-xs">Phone Number</Label>
              <Input
                className="h-8 rounded-lg text-sm"
                placeholder="(555) 123-4567"
                {...form.register("phone")}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                className="h-8 rounded-lg"
                disabled={createState === "loading"}
                isLoading={createState === "loading"}
              >
                {createState === "loading" ? "Saving..." : "Save Address"}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <RadioGroup
            className="gap-2"
            value={value}
            onValueChange={(val) => {
              if (val === "new") {
                setShowNewAddress(true);
              } else {
                onChange(val);
              }
            }}
          >
            {addressesLoading ? (
              <div className="p-4 text-sm text-muted-foreground">
                Loading addresses...
              </div>
            ) : addresses.length === 0 ? (
              // <div className="p-4 text-sm text-muted-foreground">
              //   No addresses found
              // </div>
              null
            ) : (
              addresses.map((address) => (
                <div
                  key={address.id}
                  className="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring"
                >
                  <RadioGroupItem
                    value={address.id}
                    id={`${id}-${address.id}`}
                    aria-describedby={`${id}-${address.id}-description`}
                    className="order-1 after:absolute after:inset-0"
                  />
                  <div className="grid grow gap-2">
                    <Label htmlFor={`${id}-${address.id}`}>
                      {address.company ||
                        `${address.firstName} ${address.lastName}`}{" "}
                      {address.phone && (
                        <span className="text-xs font-normal leading-[inherit] text-muted-foreground">
                          ({address.phone})
                        </span>
                      )}
                    </Label>
                    <p
                      id={`${id}-${address.id}-description`}
                      className="text-xs text-muted-foreground"
                    >
                      {[
                        address.address1,
                        address.address2,
                        [address.city, address.province, address.postalCode]
                          .filter(Boolean)
                          .join(", "),
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              ))
            )}

            <div className="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring">
              <RadioGroupItem
                value="new"
                id={`${id}-new`}
                className="order-1 after:absolute after:inset-0"
              />
              <div className="grid grow gap-2">
                <Label htmlFor={`${id}-new`}>Create New Address</Label>
              </div>
            </div>
          </RadioGroup>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 