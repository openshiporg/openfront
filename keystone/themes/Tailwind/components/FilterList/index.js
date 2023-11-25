import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@keystone/primitives/default/ui/popover";
import { Button } from "@keystone/primitives/default/ui/button";
import { ChevronDownIcon, XIcon } from "lucide-react";

export function FilterList({ filters, list }) {
  return (
    <div className="flex gap-2">
      {filters.map((filter) => {
        const field = list.fields[filter.field];
        return (
          <FilterPill
            key={`${filter.field}_${filter.type}`}
            field={field}
            filter={filter}
          />
        );
      })}
    </div>
  );
}

function FilterPill({ filter, field }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Create a query object that behaves like the old query object
  const query = {};
  for (let [key, value] of searchParams.entries()) {
    query[key] = value;
  }

  const Label = field.controller.filter.Label; // Assuming Label is a component

  const onRemove = () => {
    const { [`!${filter.field}_${filter.type}`]: _ignore, ...queryToKeep } =
      query;
    router.push(`${pathname}?${new URLSearchParams(queryToKeep).toString()}`);
  };

  return (
    <Popover
      open={popoverOpen}
      onOpenChange={setPopoverOpen}
      placement="bottom"
    >
      <PopoverTrigger asChild>
        {/* <div className="flex">
          <Button variant="secondary">
            {field.label}{" "}
            <Label
              label={field.controller.filter.types[filter.type].label}
              type={filter.type}
              value={filter.value}
            />
          </Button>
          <Button onClick={onRemove} variant="secondary" className="rounded-l-0">
            <XIcon size={16} className="stroke-muted-foreground" />
          </Button>
        </div> */}
        <div class="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 border-r-0 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
          >
            {field.label}{" "}
            <Label
              label={field.controller.filter.types[filter.type].label}
              type={filter.type}
              value={filter.value}
            />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            class="px-2.5 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white"
          >
            <XIcon size={16} className="stroke-muted-foreground" />
          </button>
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <EditDialog
          onClose={() => setPopoverOpen(false)}
          field={field}
          filter={filter}
          query={query}
          pathname={pathname}
        />
      </PopoverContent>
    </Popover>
  );
}

function EditDialog({ filter, field, onClose }) {
  const Filter = field.controller.filter.Filter;
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Create a query object that behaves like the old query object
  const query = {};
  for (let [key, value] of searchParams.entries()) {
    query[key] = value;
  }
  const [value, setValue] = useState(filter.value);

  const handleSubmit = (event) => {
    event.preventDefault();
    router.push(
      `${pathname}?${new URLSearchParams({
        ...query,
        [`!${filter.field}_${filter.type}`]: JSON.stringify(value),
      }).toString()}`
    );
    onClose();
  };

  return (
    <form className="space-y-2" onSubmit={handleSubmit}>
      <Filter type={filter.type} value={value} onChange={setValue} />
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
