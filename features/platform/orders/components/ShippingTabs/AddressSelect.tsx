'use client';

import { useState, useId, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { getAddresses, getCountries, getCurrentUser, createAddress } from "@/features/platform/orders/actions";

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  postalCode: string;
  phone?: string;
  country?: {
    name: string;
    id: string;
  };
}

interface Country {
  id: string;
  name: string;
}

interface AddressSelectProps {
  value: string | null;
  onChange: (value: string) => void;
}

export function AddressSelect({ value, onChange }: AddressSelectProps) {
  const id = useId();
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const addressesPerPage = 5;

  // Form for new address
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load addresses
  useEffect(() => {
    async function loadAddresses() {
      // Only show loading on initial load, not when changing selection
      if (addresses.length === 0) {
        setLoading(true);
      }

      try {
        const userResponse = await getCurrentUser();
        if (!userResponse.success || !userResponse.data?.authenticatedItem?.id) {
          if (!userResponse.success) {
            console.error('Failed to get current user:', userResponse.error);
          }
          setAddresses([]);
          setLoading(false);
          return;
        }
        const userId = userResponse.data.authenticatedItem.id;

        const addressesResponse = await getAddresses(userId, addressesPerPage, (currentPage - 1) * addressesPerPage);
        if (addressesResponse.success) {
          const loadedAddresses = addressesResponse.data?.addresses || [];
          const totalAddresses = addressesResponse.data?.addressesCount || 0;
          setAddresses(loadedAddresses);
          setTotalPages(Math.ceil(totalAddresses / addressesPerPage));

          // If no address is selected and we have addresses, select the first one
          if (!value && loadedAddresses.length > 0) {
            onChange(loadedAddresses[0].id);
          }
        } else {
          console.error('Failed to load addresses:', addressesResponse.error);
          setAddresses([]);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Failed to load addresses:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAddresses();
  }, [currentPage, onChange, value, addresses.length]);

  // Load countries
  useEffect(() => {
    async function loadCountries() {
      setCountriesLoading(true);
      try {
        const countriesResponse = await getCountries();
        if (countriesResponse.success) {
          setCountries(countriesResponse.data?.countries || []);
        } else {
          console.error('Failed to load countries:', countriesResponse.error);
          setCountries([]);
        }
      } catch (error) {
        console.error('Failed to load countries:', error);
      } finally {
        setCountriesLoading(false);
      }
    }

    loadCountries();
  }, []);

  // Handle form submission
  const onSubmit = async (data: any) => {
    if (!data.firstName || !data.lastName || !data.address1 || !data.city ||
        !data.province || !data.postalCode || !data.country) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const createResponse = await createAddress({
        ...data,
      });

      if (createResponse.success && createResponse.data?.createAddress?.id) {
        const newAddressId = createResponse.data.createAddress.id;
        setShowNewAddress(false);
        onChange(newAddressId);
        form.reset();

        // Refresh addresses
        const userResponse = await getCurrentUser();
        if (userResponse.success && userResponse.data?.authenticatedItem?.id) {
          const userId = userResponse.data.authenticatedItem.id;
          const addressesResponse = await getAddresses(userId, addressesPerPage, 0);
          if (addressesResponse.success) {
            setAddresses(addressesResponse.data?.addresses || []);
            setTotalPages(Math.ceil((addressesResponse.data?.addressesCount || 0) / addressesPerPage));
            setCurrentPage(1);
          } else {
             console.error('Failed to refresh addresses after creation:', addressesResponse.error);
          }
        } else if (!userResponse.success) {
           console.error('Failed to get current user after address creation:', userResponse.error);
        }
      } else {
        console.error('Failed to create address:', createResponse.error);
        alert('Failed to create address: ' + (createResponse.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to create address:', error);
      // Error handling moved inside the createResponse.success check
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2 mt-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-2">
      {showNewAddress ? (
        <div className="space-y-4 rounded-lg border p-4 bg-muted/40">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowNewAddress(false);
                form.reset();
              }}
              className="h-8 px-2 text-xs flex items-center gap-1"
            >
              <ChevronLeft className="h-3 w-3" />
              Addresses
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <Label className="mb-1.5 block text-xs">First Name</Label>
                <Input
                  className="h-8 rounded-lg text-sm bg-background"
                  placeholder="John"
                  {...form.register("firstName", { required: true })}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label className="mb-1.5 block text-xs">Last Name</Label>
                <Input
                  className="h-8 rounded-lg text-sm bg-background"
                  placeholder="Doe"
                  {...form.register("lastName", { required: true })}
                />
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block text-xs">Company (Optional)</Label>
              <Input
                className="h-8 rounded-lg text-sm bg-background"
                placeholder="Acme Inc."
                {...form.register("company")}
              />
            </div>

            <div>
              <Label className="mb-1.5 block text-xs">Street Address</Label>
              <Input
                className="h-8 rounded-lg text-sm mb-2 bg-background"
                placeholder="123 Main Street"
                {...form.register("address1", { required: true })}
              />
              <Input
                className="h-8 rounded-lg text-sm bg-background"
                placeholder="Suite 100 (Optional)"
                {...form.register("address2")}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <Label className="mb-1.5 block text-xs">City</Label>
                <Input
                  className="h-8 rounded-lg text-sm bg-background"
                  placeholder="San Francisco"
                  {...form.register("city", { required: true })}
                />
              </div>
              <div className="w-[100px]">
                <Label className="mb-1.5 block text-xs">State</Label>
                <Input
                  className="h-8 rounded-lg text-sm bg-background"
                  placeholder="CA"
                  {...form.register("province", { required: true })}
                />
              </div>
              <div className="w-[120px]">
                <Label className="mb-1.5 block text-xs">ZIP Code</Label>
                <Input
                  className="h-8 rounded-lg text-sm bg-background"
                  placeholder="94105"
                  {...form.register("postalCode", { required: true })}
                />
              </div>

              <div className="flex-1 min-w-[200px]">
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
                            key={country.id}
                            value={country.id}
                          >
                            {country.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block text-xs">Phone Number</Label>
              <Input
                className="h-8 rounded-lg text-sm bg-background"
                placeholder="(555) 123-4567"
                {...form.register("phone")}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                className="h-8 px-3 text-xs"
                disabled={isSubmitting}
                onClick={form.handleSubmit(onSubmit)}
              >
                {isSubmitting ? "Saving..." : "Save Address"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <RadioGroup
            className="gap-2"
            value={value || ""}
            onValueChange={(val) => {
              if (val === "new") {
                setShowNewAddress(true);
              } else {
                onChange(val);
              }
            }}
          >
            {addresses.length === 0 ? (
              null
            ) : (
              addresses.map((address) => (
                <div
                  key={address.id}
                  className={`relative flex w-full items-start gap-2 rounded-lg border-2 p-4 shadow-sm transition-colors ${
                    value === address.id
                      ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 dark:border-blue-400'
                      : 'border-zinc-200 bg-zinc-50/20 dark:border-zinc-700 dark:bg-zinc-800/20'
                  }`}
                >
                  <RadioGroupItem
                    value={address.id}
                    id={`${id}-${address.id}`}
                    aria-describedby={`${id}-${address.id}-description`}
                    className="order-1 after:absolute after:inset-0 border-zinc-300 text-transparent data-[state=checked]:border-blue-500 data-[state=checked]:text-blue-500 dark:border-zinc-600 dark:data-[state=checked]:border-blue-400 dark:data-[state=checked]:text-blue-400"
                  />
                  <div className="grid grow gap-1">
                    <Label
                      htmlFor={`${id}-${address.id}`}
                      className="font-medium"
                    >
                      {address.company ||
                        `${address.firstName} ${address.lastName}`}{" "}
                      {address.phone && (
                        <span className="text-xs font-normal text-muted-foreground">
                          ({address.phone})
                        </span>
                      )}
                    </Label>
                    <p
                      id={`${id}-${address.id}-description`}
                      className="text-sm text-muted-foreground"
                    >
                      {[
                        address.address1,
                        address.address2,
                        [address.city, address.province, address.postalCode]
                          .filter(Boolean)
                          .join(", "),
                        address.country?.name
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              ))
            )}

            <div
              className={`relative flex w-full items-start gap-2 rounded-lg border-2 p-4 shadow-sm transition-colors ${
                value === "new"
                  ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 dark:border-blue-400'
                  : 'border-zinc-200 bg-zinc-50/20 dark:border-zinc-700 dark:bg-zinc-800/20'
              }`}
            >
              <RadioGroupItem
                value="new"
                id={`${id}-new`}
                className="order-1 after:absolute after:inset-0 border-zinc-300 text-transparent data-[state=checked]:border-blue-500 data-[state=checked]:text-blue-500 dark:border-zinc-600 dark:data-[state=checked]:border-blue-400 dark:data-[state=checked]:text-blue-400"
              />
              <div className="grid grow gap-1">
                <Label
                  htmlFor={`${id}-new`}
                  className="font-medium"
                >
                  Create New Address
                </Label>
                <p className="text-sm text-muted-foreground">
                  Add a new shipping address to your account
                </p>
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
                className="h-8 px-3 text-xs"
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="h-8 px-3 text-xs"
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
