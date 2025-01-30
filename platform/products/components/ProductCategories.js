import React from "react";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
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
import { CheckIcon, PlusIcon } from "lucide-react";

export function ProductCategories({ categories = [], selectedCategories = [], onSelect }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Categories</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search categories..." />
              <CommandEmpty>No categories found.</CommandEmpty>
              <CommandGroup>
                {categories.map((category) => (
                  <CommandItem
                    key={category.id}
                    onSelect={() => onSelect(category)}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCategories.includes(category.id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {category.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedCategories.map((category) => (
          <Badge key={category.id} variant="secondary">
            {category.name}
          </Badge>
        ))}
      </div>
    </div>
  );
} 