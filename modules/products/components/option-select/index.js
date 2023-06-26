import { onlyUnique } from "@storefront/util/only-unique";
import clsx from "clsx";
import React from "react";

const OptionSelect = ({ option, current, updateOption, title }) => {
  const filteredOptions = option.values.map((v) => v.value).filter(onlyUnique);

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-base-semi">Select {title}</span>
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
        {filteredOptions.map((v) => {
          return (
            <button
              onClick={() => updateOption({ [option.id]: v })}
              key={v}
              className={clsx(
                "border-gray-200 border text-xsmall-regular h-[50px] transition-all duration-200",
                { "border-gray-900": v === current }
              )}
            >
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OptionSelect;
