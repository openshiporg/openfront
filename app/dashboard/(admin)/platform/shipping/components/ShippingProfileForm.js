import React from "react";
import { gql, useMutation, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
import { Loader2 } from "lucide-react";
import { Textarea } from "@ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ui/popover";
import { Badge } from "@ui/badge";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@keystone/utils";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["default", "gift_card", "custom"]),
  description: z.string().optional(),
  products: z.array(z.string()).optional(),
  metadata: z.record(z.string()).optional(),
});

const GET_FORM_DATA = gql`
  query GetShippingProfileFormData {
    products {
      id
      title
      thumbnail
    }
  }
`;

const CREATE_SHIPPING_PROFILE = gql`
  mutation CreateShippingProfile($data: ShippingProfileCreateInput!) {
    createShippingProfile(data: $data) {
      id
    }
  }
`;

const UPDATE_SHIPPING_PROFILE = gql`
  mutation UpdateShippingProfile($where: ShippingProfileWhereUniqueInput!, $data: ShippingProfileUpdateInput!) {
    updateShippingProfile(where: $where, data: $data) {
      id
    }
  }
`;

export function ShippingProfileForm({ profile, onSuccess }) {
  const { data, loading: loadingFormData } = useQuery(GET_FORM_DATA);
  const [createShippingProfile, { loading: creatingProfile }] = useMutation(CREATE_SHIPPING_PROFILE);
  const [updateShippingProfile, { loading: updatingProfile }] = useMutation(UPDATE_SHIPPING_PROFILE);
  const [open, setOpen] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: profile || {
      name: "",
      type: "default",
      description: "",
      products: [],
      metadata: {},
    },
  });

  const onSubmit = async (values) => {
    try {
      if (profile) {
        await updateShippingProfile({
          variables: {
            where: { id: profile.id },
            data: values,
          },
        });
      } else {
        await createShippingProfile({
          variables: {
            data: values,
          },
        });
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error saving shipping profile:", error);
    }
  };

  if (loadingFormData) {
    return <div>Loading...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                A name to identify this shipping profile
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="gift_card">Gift Card</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The type of products this profile will be used for
              </FormDescription>
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
              <FormDescription>
                A description of this shipping profile
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="products"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Products</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {field.value?.length > 0
                        ? `${field.value.length} products selected`
                        : "Select products..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search products..." />
                    <CommandEmpty>No products found.</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-y-auto">
                      {data.products.map((product) => (
                        <CommandItem
                          key={product.id}
                          value={product.id}
                          onSelect={() => {
                            const currentValue = field.value || [];
                            const newValue = currentValue.includes(product.id)
                              ? currentValue.filter((id) => id !== product.id)
                              : [...currentValue, product.id];
                            field.onChange(newValue);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value?.includes(product.id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex items-center gap-2">
                            {product.thumbnail && (
                              <img
                                src={product.thumbnail}
                                alt={product.title}
                                className="h-8 w-8 rounded object-cover"
                              />
                            )}
                            <span>{product.title}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <div className="mt-2">
                {field.value?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((productId) => {
                      const product = data.products.find((p) => p.id === productId);
                      return (
                        <Badge
                          key={productId}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {product?.title}
                          <button
                            type="button"
                            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            onClick={() => {
                              field.onChange(
                                field.value.filter((id) => id !== productId)
                              );
                            }}
                          >
                            ×
                          </button>
                        </Badge>
                      )}
                    )}
                  </div>
                )}
              </div>
              <FormDescription>
                Select the products that will use this shipping profile
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={creatingProfile || updatingProfile}>
            {(creatingProfile || updatingProfile) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {profile ? "Update" : "Create"} Profile
          </Button>
        </div>
      </form>
    </Form>
  );
}