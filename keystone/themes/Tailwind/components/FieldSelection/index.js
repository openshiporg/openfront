import { Box } from "@keystone-ui/core";
import { ChevronDownIcon } from "@keystone-ui/icons/icons/ChevronDownIcon";
import { CheckMark, OptionPrimitive, Options } from "@keystone-ui/options";
import { Popover } from "@keystone-ui/popover";
import { useSelectedFields } from "@keystone/utils/useSelectedFields";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "../../primitives/default/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../../primitives/default/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";

function isArrayEqual(arrA, arrB) {
  if (arrA.length !== arrB.length) return false;
  for (let i = 0; i < arrA.length; i++) {
    if (arrA[i] !== arrB[i]) {
      return false;
    }
  }
  return true;
}

const Option = (props) => {
  return (
    <OptionPrimitive {...props}>
      {props.children}
      <CheckMark
        isDisabled={props.isDisabled}
        isFocused={props.isFocused}
        isSelected={props.isSelected}
      />
    </OptionPrimitive>
  );
};

// TODO: return type required by pnpm :(
export const fieldSelectionOptionsComponents = {
  Option,
};

export function FieldSelection({ list, fieldModesByFieldPath }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Create a query object that behaves like the old query object
  const query = {};
  for (let [key, value] of searchParams.entries()) {
    query[key] = value;
  }
  const selectedFields = useSelectedFields(list, fieldModesByFieldPath);

  console.log({ selectedFields });
  const setNewSelectedFields = (selectedFields) => {
    if (isArrayEqual(selectedFields, list.initialColumns)) {
      const { fields: _ignore, ...otherQueryFields } = query;
      router.push(
        pathname +
          "?" +
          new URLSearchParams({
            otherQueryFields,
          })
      );
    } else {
      router.push(
        pathname +
          "?" +
          new URLSearchParams({
            ...query,
            fields: selectedFields.join(","),
          })
      );
    }
  };
  const fields = [];
  Object.keys(fieldModesByFieldPath).forEach((fieldPath) => {
    if (fieldModesByFieldPath[fieldPath] === "read") {
      fields.push({
        value: fieldPath,
        label: list.fields[fieldPath].label,
        isDisabled: selectedFields.size === 1 && selectedFields.has(fieldPath),
      });
    }
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-dashed hidden lg:flex data-[state=open]:bg-muted"
        >
          <MixerHorizontalIcon className="mr-2 h-4 w-4" />
          Viewing {selectedFields.size} column
          {selectedFields.size === 1 ? "" : "s"}{" "}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {fields.map((field) => {
          return (
            <DropdownMenuCheckboxItem
              key={field.value}
              className="capitalize"
              checked={selectedFields.has(field.value)}
              onCheckedChange={(isChecked) => {
                const newSelectedFields = new Set(selectedFields);
                if (isChecked) {
                  newSelectedFields.add(field.value);
                } else {
                  newSelectedFields.delete(field.value);
                }
                setNewSelectedFields(Array.from(newSelectedFields));
              }}
            >
              {field.label}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
