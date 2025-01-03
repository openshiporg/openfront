"use client";

import { useState } from "react";

import { FieldContainer } from "../../components/FieldContainer";
import { FieldLabel } from "../../components/FieldLabel";
import { TextInput } from "../../components/TextInput";
import { FieldDescription } from "../../components/FieldDescription";
import { DatePicker } from "../../components/DatePicker";
import {
  constructTimestamp,
  deconstructTimestamp,
  formatOutput,
  parseTime,
  formatTime,
} from "./utils";
import { useFormattedInput } from "@keystone/utils/useFormattedInput";

export const TimestampField = ({ field, value, onChange, forceValidation }) => {
  const [touchedFirstInput, setTouchedFirstInput] = useState(false);
  const [touchedSecondInput, setTouchedSecondInput] = useState(false);
  const showValidation =
    (touchedFirstInput && touchedSecondInput) || forceValidation;

  const validationMessages = showValidation
    ? validate(value, field.fieldMeta, field.label)
    : undefined;

  const timeInputProps = useFormattedInput(
    {
      format({ value }) {
        if (value === null) {
          return "";
        }
        return formatTime(value);
      },
      parse(value) {
        value = value.trim();
        if (value === "") {
          return { kind: "parsed", value: null };
        }
        const parsed = parseTime(value);
        if (parsed !== undefined) {
          return { kind: "parsed", value: parsed };
        }
        return value;
      },
    },
    {
      value: value.value.timeValue,
      onChange(timeValue) {
        onChange?.({
          ...value,
          value: { ...value.value, timeValue },
        });
      },
      onBlur() {
        setTouchedSecondInput(true);
      },
    }
  );

  return (
    <FieldContainer as="fieldset">
      <FieldLabel as="legend">{field.label}</FieldLabel>
      <FieldDescription id={`${field.path}-description`}>
        {field.description}
      </FieldDescription>
      {onChange ? (
        <div className="flex gap-2">
          <div className="flex-1 flex flex-col">
            <DatePicker
              onUpdate={(date) => {
                onChange({
                  ...value,
                  value: {
                    dateValue: date,
                    timeValue:
                      typeof value.value.timeValue === "object" &&
                      value.value.timeValue.value === null
                        ? { kind: "parsed", value: "00:00:00.000" }
                        : value.value.timeValue,
                  },
                });
              }}
              onClear={() => {
                onChange({
                  ...value,
                  value: { ...value.value, dateValue: null },
                });
              }}
              onBlur={() => setTouchedFirstInput(true)}
              value={value.value.dateValue ?? ""}
            />
            {validationMessages?.date && (
              <p className="text-red-600 dark:text-red-700 text-sm">
                {validationMessages.date}
              </p>
            )}
          </div>
          <div className="flex-1 flex flex-col">
            <label htmlFor={`${field.path}--time-input`} className="sr-only">
              {`${field.label} time field`}
            </label>
            <TextInput
              id={`${field.path}--time-input`}
              {...timeInputProps}
              aria-describedby={`${field.path}-description`}
              disabled={onChange === undefined}
              placeholder="00:00"
            />
            {validationMessages?.time && (
              <p className="text-red-600 dark:text-red-700 text-sm">
                {validationMessages.time}
              </p>
            )}
          </div>
        </div>
      ) : (
        value.value.dateValue !== null &&
        typeof value.value.timeValue === "object" &&
        value.value.timeValue.value !== null && (
          <span>
            {formatOutput(
              constructTimestamp({
                dateValue: value.value.dateValue,
                timeValue: value.value.timeValue.value,
              })
            )}
          </span>
        )
      )}
      {((value.kind === "create" &&
        typeof field.fieldMeta.defaultValue !== "string" &&
        field.fieldMeta.defaultValue?.kind === "now") ||
        field.fieldMeta.updatedAt) && (
        <p className="text-sm text-foreground/80">
          When this item is saved, this field will be set to the current date
          and time.
        </p>
      )}
    </FieldContainer>
  );
};
