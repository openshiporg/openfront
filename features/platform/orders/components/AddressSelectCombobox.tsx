"use client";

import { useId, useState } from "react";
import { CheckIcon, ChevronDownIcon, PlusIcon, MapPinIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCustomerAddress } from "../actions";

type Address = {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  postalCode: string;
  phone?: string;
  company?: string;
  country: {
    iso2: string;
    name: string;
  };
};

interface AddressSelectComboboxProps {
  addresses?: Address[];
  value?: string;
  onValueChange: (addressId: string | null) => void;
  selectedAddress?: Address | null;
  label?: string;
  placeholder?: string;
  className?: string;
  customerId?: string;
  onAddressCreated?: (address: Address) => void;
  onCreateAddress?: () => void;
}

export function AddressSelectCombobox({
  addresses = [],
  value,
  onValueChange,
  selectedAddress,
  label = "Select Address",
  placeholder = "Search addresses...",
  className,
  customerId,
  onAddressCreated,
  onCreateAddress,
}: AddressSelectComboboxProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // New address form state
  const [newAddress, setNewAddress] = useState({
    firstName: "",
    lastName: "",
    company: "",
    address1: "",
    address2: "",
    city: "",
    province: "",
    postalCode: "",
    phone: "",
    countryCode: "us", // Default to US
  });

  // Filter addresses based on search term
  const filteredAddresses = addresses.filter((address) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      address.firstName.toLowerCase().includes(searchLower) ||
      address.lastName.toLowerCase().includes(searchLower) ||
      address.address1.toLowerCase().includes(searchLower) ||
      address.city.toLowerCase().includes(searchLower) ||
      (address.company && address.company.toLowerCase().includes(searchLower))
    );
  });

  // Format address for display
  const formatAddressLine = (address: Address) => {
    return [
      address.address1,
      address.address2,
      `${address.city}${address.province ? `, ${address.province}` : ""}`,
      `${address.postalCode} ${address.country.iso2.toUpperCase()}`,
    ].filter(Boolean).join(", ");
  };

  const handleSelect = (addressId: string) => {
    onValueChange(addressId === value ? null : addressId);
    setOpen(false);
  };

  const handleCreateAddress = async () => {
    if (!customerId) return;
    
    setIsCreating(true);
    try {
      const result = await createCustomerAddress(customerId, newAddress);
      
      if (result.success && result.data?.createAddress) {
        const createdAddress = result.data.createAddress;
        
        // Reset form
        setNewAddress({
          firstName: "",
          lastName: "",
          company: "",
          address1: "",
          address2: "",
          city: "",
          province: "",
          postalCode: "",
          phone: "",
          countryCode: "us",
        });
        
        setCreateDialogOpen(false);
        
        // Notify parent component
        if (onAddressCreated) {
          onAddressCreated(createdAddress);
        }
        
        // Select the newly created address
        onValueChange(createdAddress.id);
      } else {
        console.error("Error creating address:", result.error);
      }
    } catch (error) {
      console.error("Error creating address:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const countries = [
    { iso2: "us", name: "United States" },
    { iso2: "ca", name: "Canada" },
    { iso2: "gb", name: "United Kingdom" },
    { iso2: "au", name: "Australia" },
    // Add more countries as needed
  ];

  return (
    <>
      <div className={cn("space-y-2", className)}>
        <Label htmlFor={id}>{label}</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={id}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px] h-auto py-2"
              disabled={!addresses.length && !customerId}
            >
              <span className={cn("truncate", !selectedAddress && "text-muted-foreground")}>
                {selectedAddress ? (
                  <div className="flex items-start gap-2 text-left">
                    <MapPinIcon size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="font-medium">
                        {selectedAddress.firstName} {selectedAddress.lastName}
                      </span>
                      {selectedAddress.company && (
                        <span className="text-xs text-muted-foreground">
                          {selectedAddress.company}
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground truncate">
                        {formatAddressLine(selectedAddress)}
                      </span>
                    </div>
                  </div>
                ) : addresses.length === 0 ? (
                  customerId ? "Create new address" : "No customer selected"
                ) : (
                  "Select address"
                )}
              </span>
              <ChevronDownIcon
                size={16}
                className="text-muted-foreground/80 shrink-0"
                aria-hidden="true"
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
            align="start"
          >
            <Command>
              <CommandInput 
                placeholder={placeholder}
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandList>
                <CommandEmpty>No addresses found.</CommandEmpty>
                {filteredAddresses.length > 0 && (
                  <CommandGroup>
                    {filteredAddresses.map((address) => (
                      <CommandItem
                        key={address.id}
                        value={address.id}
                        onSelect={handleSelect}
                        className="py-3"
                      >
                        <div className="flex items-start justify-between w-full">
                          <div className="flex items-start gap-2 min-w-0 flex-1">
                            <MapPinIcon size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
                            <div className="flex flex-col gap-1 min-w-0">
                              <div className="font-medium">
                                {address.firstName} {address.lastName}
                              </div>
                              {address.company && (
                                <div className="text-xs text-muted-foreground">
                                  {address.company}
                                </div>
                              )}
                              <div className="text-sm text-muted-foreground break-words">
                                {formatAddressLine(address)}
                              </div>
                              {address.phone && (
                                <div className="text-xs text-muted-foreground">
                                  {address.phone}
                                </div>
                              )}
                            </div>
                          </div>
                          {value === address.id && (
                            <CheckIcon size={16} className="text-primary shrink-0 mt-0.5" />
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {customerId && (
                  <>
                    {filteredAddresses.length > 0 && <CommandSeparator />}
                    <CommandGroup>
                      <Button
                        variant="ghost"
                        className="w-full justify-start font-normal"
                        onClick={() => {
                          if (onCreateAddress) {
                            onCreateAddress();
                          } else {
                            setCreateDialogOpen(true);
                          }
                          setOpen(false);
                        }}
                      >
                        <PlusIcon
                          size={16}
                          className="-ms-2 opacity-60"
                          aria-hidden="true"
                        />
                        Create new address
                      </Button>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Create Address Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Address</DialogTitle>
            <DialogDescription>
              Add a new address for this customer.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={newAddress.firstName}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newAddress.lastName}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company (Optional)</Label>
              <Input
                id="company"
                value={newAddress.company}
                onChange={(e) => setNewAddress(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address1">Address Line 1</Label>
              <Input
                id="address1"
                value={newAddress.address1}
                onChange={(e) => setNewAddress(prev => ({ ...prev, address1: e.target.value }))}
                placeholder="Street address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address2">Address Line 2 (Optional)</Label>
              <Input
                id="address2"
                value={newAddress.address2}
                onChange={(e) => setNewAddress(prev => ({ ...prev, address2: e.target.value }))}
                placeholder="Apartment, suite, etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">State/Province</Label>
                <Input
                  id="province"
                  value={newAddress.province}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, province: e.target.value }))}
                  placeholder="State or province"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={newAddress.postalCode}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                  placeholder="Postal code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={newAddress.countryCode}
                  onValueChange={(value) => setNewAddress(prev => ({ ...prev, countryCode: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.iso2} value={country.iso2}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                value={newAddress.phone}
                onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateAddress}
              disabled={
                isCreating ||
                !newAddress.firstName ||
                !newAddress.lastName ||
                !newAddress.address1 ||
                !newAddress.city ||
                !newAddress.postalCode
              }
            >
              {isCreating ? "Creating..." : "Create Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}