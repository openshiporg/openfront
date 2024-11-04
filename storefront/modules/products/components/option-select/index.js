import { clx } from "@medusajs/ui"
import React from "react"

import { onlyUnique } from "@storefront/lib/util/only-unique"

// Add this size order mapping at the top of the file
const SIZE_ORDER = {
  "XXS": 1,
  "XS": 2,
  "S": 3,
  "M": 4,
  "L": 5,
  "XL": 6,
  "XXL": 7,
  "XXXL": 8
};

const OptionSelect = ({
  option,
  current,
  updateOption,
  title,
}) => {
  // Change the filtering and sorting logic
  const filteredOptions = option.productOptionValues
    .map((v) => v.value)
    .filter(onlyUnique)
    .sort((a, b) => {
      // If it's a size option, use the size order mapping
      if (title.toLowerCase() === "size") {
        return (SIZE_ORDER[a] || 999) - (SIZE_ORDER[b] || 999);
      }
      // For other options, use alphabetical sorting
      return a.localeCompare(b);
    });

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm">Select {title}</span>
      <div className="flex flex-wrap justify-between gap-2">
        {filteredOptions.map((v) => {
          return (
            <button
              onClick={() => updateOption({ [option.id]: v })}
              key={v}
              className={clx(
                "border-ui-border-base bg-ui-bg-subtle border text-small-regular h-10 rounded-rounded p-2 flex-1 ",
                {
                  "border-ui-border-interactive": v === current,
                  "hover:shadow-elevation-card-rest transition-shadow ease-in-out duration-150":
                    v !== current,
                }
              )}>
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default OptionSelect
