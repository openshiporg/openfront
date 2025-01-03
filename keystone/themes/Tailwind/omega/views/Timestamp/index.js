

import { FieldContainer } from "../../components/FieldContainer";
import { FieldLabel } from "../../components/FieldLabel";
import { CellContainer } from "../../components/CellContainer";
import { CellLink } from "../../components/CellLink";
import {
  constructTimestamp,
  deconstructTimestamp,
  formatOutput,
  parseTime,
  formatTime,
} from "./utils";
import { TimestampField } from "./TimestampField";

export const Field = TimestampField

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
