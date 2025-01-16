import React from "react";
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@ui/form";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { Input } from "@ui/input";
import { PlusIcon, XIcon } from "lucide-react";
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

const UPDATE_PRICE_LIST_CONDITIONS_MUTATION = gql`
  mutation UpdatePriceListConditions(
    $where: PriceListWhereUniqueInput!
    $data: PriceListUpdateInput!
  ) {
    updatePriceList(where: $where, data: $data) {
      id
      customerGroups {
        id
        name
      }
      startsAt
      endsAt
    }
  }
`;

export function PriceListConditions({ customerGroups, type, startsAt, endsAt }) {
  const [updateConditions] = useMutation(UPDATE_PRICE_LIST_CONDITIONS_MUTATION);

  const handleDateChange = async (field, value) => {
    try {
      await updateConditions({
        variables: {
          where: { id: customerGroups[0]?.priceListId }, // Assuming all groups belong to same price list
          data: {
            [field]: value,
          },
        },
      });
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conditions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-2">Type</h3>
          <Badge variant="outline" className="text-sm">
            {type === "override" ? "Price Override" : "Sale Price"}
          </Badge>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Customer Groups</h3>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {customerGroups.map((group) => (
                <Badge key={group.id} variant="secondary" className="flex items-center gap-1">
                  {group.name}
                  <button
                    onClick={() => {
                      // Handle removing group
                    }}
                    className="ml-1 hover:bg-zinc-200 rounded-full p-0.5"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Group
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search groups..." />
                  <CommandEmpty>No groups found.</CommandEmpty>
                  <CommandGroup>
                    {/* Add available groups here */}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Configuration</h3>
          <Form>
            <div className="space-y-4">
              <FormField
                name="startsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        value={startsAt ? new Date(startsAt).toISOString().slice(0, 16) : ""}
                        onChange={(e) => handleDateChange("startsAt", e.target.value)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="endsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        value={endsAt ? new Date(endsAt).toISOString().slice(0, 16) : ""}
                        onChange={(e) => handleDateChange("endsAt", e.target.value)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
} 