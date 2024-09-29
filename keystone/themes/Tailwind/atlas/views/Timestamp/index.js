import { useState } from "react";

import { FieldContainer } from "@keystone/components/FieldContainer";
import { FieldLabel } from "@keystone/components/FieldLabel";
import { TextInput } from "@keystone/components/TextInput";
import { FieldDescription } from "@keystone/components/FieldDescription";
import { DatePicker } from "@keystone/components/DatePicker";
import { CellContainer } from "@keystone/components/CellContainer";
import { CellLink } from "@keystone/components/CellLink";
import {
  constructTimestamp,
  deconstructTimestamp,
  formatOutput,
  parseTime,
  formatTime,
} from "./utils";
import { useFormattedInput } from "@keystone/utils/useFormattedInput";

export const Field = ({ field, value, onChange, forceValidation }) => {
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
              <p className="text-red-600 dark:text-red-700 text-sm">{validationMessages.date}</p>
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
              <p className="text-red-600 dark:text-red-700 text-sm">{validationMessages.time}</p>
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

function validate(value, fieldMeta, label) {
  const val = value.value;
  const hasDateValue = val.dateValue !== null;
  const hasTimeValue =
    typeof val.timeValue === "string" ||
    typeof val.timeValue.value === "string";

  const isValueEmpty = !hasDateValue && !hasTimeValue;
  // if we recieve null initially on the item view and the current value is null,
  // we should always allow saving it because:
  // - the value might be null in the database and we don't want to prevent saving the whole item because of that
  // - we might have null because of an access control error
  if (value.kind === "update" && value.initial === null && isValueEmpty) {
    return undefined;
  }

  if (
    value.kind === "create" &&
    isValueEmpty &&
    ((typeof fieldMeta.defaultValue === "object" &&
      fieldMeta.defaultValue?.kind === "now") ||
      fieldMeta.updatedAt)
  ) {
    return undefined;
  }

  if (fieldMeta.isRequired && isValueEmpty) {
    return { date: `${label} is required` };
  }

  if (hasDateValue && !hasTimeValue) {
    return { time: `${label} requires a time to be provided` };
  }
  const timeError =
    typeof val.timeValue === "string"
      ? `${label} requires a valid time in the format hh:mm`
      : undefined;
  if (hasTimeValue && !hasDateValue) {
    return { date: `${label} requires a date to be selected`, time: timeError };
  }

  if (timeError) {
    return { time: timeError };
  }
  return undefined;
}

export const Cell = ({ item, field, linkTo }) => {
  let value = item[field.path];
  return linkTo ? (
    <CellLink {...linkTo}>{formatOutput(value)}</CellLink>
  ) : (
    <CellContainer>{formatOutput(value)}</CellContainer>
  );
};
Cell.supportsLinkTo = true;

export const CardValue = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {formatOutput(item[field.path])}
    </FieldContainer>
  );
};

export const controller = (config) => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    fieldMeta: config.fieldMeta,
    defaultValue: {
      kind: "create",
      value:
        typeof config.fieldMeta.defaultValue === "string"
          ? deconstructTimestamp(config.fieldMeta.defaultValue)
          : { dateValue: null, timeValue: { kind: "parsed", value: null } },
    },
    deserialize: (data) => {
      const value = data[config.path];
      return {
        kind: "update",
        initial: data[config.path],
        value: value
          ? deconstructTimestamp(value)
          : { dateValue: null, timeValue: { kind: "parsed", value: null } },
      };
    },
    serialize: ({ value: { dateValue, timeValue } }) => {
      if (
        dateValue &&
        typeof timeValue === "object" &&
        timeValue.value !== null
      ) {
        let formattedDate = constructTimestamp({
          dateValue,
          timeValue: timeValue.value,
        });
        return { [config.path]: formattedDate };
      }
      return { [config.path]: null };
    },
    validate: (value) =>
      validate(value, config.fieldMeta, config.label) === undefined,
  };
};
