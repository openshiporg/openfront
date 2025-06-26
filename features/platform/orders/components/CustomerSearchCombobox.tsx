"use client";

import { useId, useState, useEffect } from "react";
import { CheckIcon, ChevronDownIcon, PlusIcon } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { searchCustomers } from "../actions";

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  addresses?: {
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
  }[];
};

interface CustomerSearchComboboxProps {
  value?: string;
  onValueChange: (customerId: string | null) => void;
  selectedCustomer?: Customer | null;
  label?: string;
  placeholder?: string;
  className?: string;
  onCreateCustomer?: () => void;
}

export function CustomerSearchCombobox({
  value,
  onValueChange,
  selectedCustomer,
  label = "Select Customer",
  placeholder = "Search customers...",
  className,
  onCreateCustomer,
}: CustomerSearchComboboxProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search function
  const searchCustomersData = async (search: string) => {
    setIsLoading(true);
    try {
      const result = await searchCustomers(search, 50);
      
      if (result.success && result.data?.users) {
        setCustomers(result.data.users);
      } else if (!result.success) {
        console.error("Error searching customers:", result.error);
      }
    } catch (error) {
      console.error("Error searching customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial customers
  useEffect(() => {
    searchCustomersData("");
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      searchCustomersData(searchTerm);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const handleSelect = (customerId: string) => {
    onValueChange(customerId === value ? null : customerId);
    setOpen(false);
  };

  const handleCreateCustomer = () => {
    if (onCreateCustomer) {
      onCreateCustomer();
    }
    setOpen(false);
  };

  return (
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
          >
            <span className={cn("truncate", !selectedCustomer && "text-muted-foreground")}>
              {selectedCustomer ? (
                <div className="flex items-center gap-2 text-left">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {selectedCustomer.email}
                    </span>
                  </div>
                </div>
              ) : (
                "Select customer"
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
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading customers...
                </div>
              ) : (
                <>
                  <CommandEmpty>No customers found.</CommandEmpty>
                  <CommandGroup>
                    {customers.map((customer) => (
                      <CommandItem
                        key={customer.id}
                        value={customer.id}
                        onSelect={handleSelect}
                        className="py-3"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-col gap-1">
                            <div className="font-medium">
                              {customer.firstName} {customer.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {customer.email}
                            </div>
                            {customer.phone && (
                              <div className="text-xs text-muted-foreground">
                                {customer.phone}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {value === customer.id && (
                              <CheckIcon size={16} className="text-primary" />
                            )}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup>
                    <Button
                      variant="ghost"
                      className="w-full justify-start font-normal"
                      onClick={handleCreateCustomer}
                    >
                      <PlusIcon
                        size={16}
                        className="-ms-2 opacity-60"
                        aria-hidden="true"
                      />
                      Create new customer
                    </Button>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}