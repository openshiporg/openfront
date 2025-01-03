"use client";

import { useFormattedInput } from "@keystone/utils/useFormattedInput";
import { useState } from "react";
import { TextInput } from "../../components/TextInput";

export function FloatInput({
  value, onChange, id, autoFocus, forceValidation, validationMessage, placeholder,
}) {
  const [hasBlurred, setHasBlurred] = useState(false);
  const props = useFormattedInput(
    {
      format: (value) => (value === null ? "" : value.toString()),
      parse: (raw) => {
        raw = raw.trim();
        if (raw === "") {
          return null;
        }
        let parsed = parseFloat(raw);
        if (Number.isFinite(parsed)) {
          return parsed;
        }
        return raw;
      },
    },
    {
      value,
      onChange,
      onBlur: () => {
        setHasBlurred(true);
      },
    }
  );

  return (
    <span>
      <TextInput
        placeholder={placeholder}
        id={id}
        autoFocus={autoFocus}
        inputMode="numeric"
        {...props} />
      {(hasBlurred || forceValidation) && validationMessage && (
        <span className="text-red-600 dark:text-red-700 text-sm">{validationMessage}</span>
      )}
    </span>
  );
}
