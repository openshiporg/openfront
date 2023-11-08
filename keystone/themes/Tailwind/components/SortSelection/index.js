import { Divider, Heading, Stack } from "@keystone-ui/core";
import { ChevronDownIcon } from "@keystone-ui/icons/icons/ChevronDownIcon";
import { Options } from "@keystone-ui/options";
import { PopoverDialog, usePopover } from "@keystone-ui/popover";
import { Fragment } from "react";
import { useSort } from "@keystone/utils/useSort";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { fieldSelectionOptionsComponents } from "@keystone/components/FieldSelection";
import { Button } from "../../primitives/default/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "../../primitives/default/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { MixerHorizontalIcon, MixerVerticalIcon } from "@radix-ui/react-icons";
import { ArrowDownAz, ArrowDownZa } from "lucide-react";

export function SortSelection({ list, orderableFields }) {
  const sort = useSort(list, orderableFields);
  const { isOpen, setOpen, trigger, dialog, arrow } = usePopover({
    placement: "bottom",
    modifiers: [{ name: "offset", options: { offset: [0, 8] } }],
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Create a query object that behaves like the old query object
  const query = {};
  for (let [key, value] of searchParams.entries()) {
    query[key] = value;
  }

  const sortIcons = {
    ASC: <ArrowDownAz />,
    DESC: <ArrowDownZa />,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto hidden lg:flex border-dashed data-[state=open]:bg-muted">
          {sort ? (
            <>
              {sort.direction === "ASC" ? (
                <ArrowDownZa className="mr-2 h-4 w-4" />
              ) : (
                <ArrowDownAz className="mr-2 h-4 w-4" />
              )}
              {list.fields[sort.field].label}
            </>
          ) : (
            <>
              <MixerVerticalIcon className="mr-2 h-4 w-4" />
              Sort
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {[...orderableFields, noFieldOption.value].map((fieldPath) => {
          const isNoFieldOption = fieldPath === noFieldOption.value;
          const option = isNoFieldOption
            ? noFieldOption
            : {
                label: list.fields[fieldPath].label,
                value: fieldPath,
              };

          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => {
                let newSortQuery;
                if (isNoFieldOption) {
                  newSortQuery = ""; // No sort is applied
                } else {
                  const newSortDirection =
                    sort?.field === option.value && sort.direction === "ASC"
                      ? "DESC"
                      : "ASC";
                  newSortQuery = `${newSortDirection === "DESC" ? "-" : ""}${
                    option.value
                  }`;
                }

                const newQueryParams = new URLSearchParams({
                  ...query,
                  sortBy: newSortQuery,
                }).toString();

                router.push(`${pathname}?${newQueryParams}`);
                setOpen(false); // Close the dropdown
              }}
            >
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const noFieldOption = {
  label: "Clear selection",
  value: "___________NO_FIELD___________",
};
