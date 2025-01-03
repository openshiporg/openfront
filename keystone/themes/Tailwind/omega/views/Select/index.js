import { CellContainer } from "../../components/CellContainer";
import { FieldContainer } from "../../components/FieldContainer";
import { FieldLabel } from "../../components/FieldLabel";
import { Select, MultiSelect } from "../../components/Select";
import { CellLink } from "../../components/CellLink";

import { SelectField } from "./SelectField";

export const Field = SelectField

export const Cell = ({ item, field, linkTo }) => {
  let value = item[field.path] + "";
  const label = field.options.find((x) => x.value === value)?.label;
  return linkTo ? (
    <CellLink {...linkTo}>{label}</CellLink>
  ) : (
    <CellContainer>{label}</CellContainer>
  );
};
Cell.supportsLinkTo = true;

export const CardValue = ({ item, field }) => {
  let value = item[field.path] + "";
  const label = field.options.find((x) => x.value === value)?.label;

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {label}
    </FieldContainer>
  );
};

function validate(value, isRequired) {
  if (isRequired) {
    // if you got null initially on the update screen, we want to allow saving
    // since the user probably doesn't have read access control
    if (value.kind === "update" && value.initial === null) {
      return true;
    }
    return value.value !== null;
  }
  return true;
}

export const controller = (config) => {
  const optionsWithStringValues = config.fieldMeta.options.map((x) => ({
    label: x.label,
    value: x.value.toString(),
  }));

  // Transform from string value to type appropriate value
  const t = (v) =>
    v === null ? null : config.fieldMeta.type === "integer" ? parseInt(v) : v;

  const stringifiedDefault = config.fieldMeta.defaultValue?.toString();

  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: {
      kind: "create",
      value:
        optionsWithStringValues.find((x) => x.value === stringifiedDefault) ??
        null,
    },
    type: config.fieldMeta.type,
    displayMode: config.fieldMeta.displayMode,
    isRequired: config.fieldMeta.isRequired,
    options: optionsWithStringValues,
    deserialize: (data) => {
      for (const option of config.fieldMeta.options) {
        if (option.value === data[config.path]) {
          const stringifiedOption = {
            label: option.label,
            value: option.value.toString(),
          };
          return {
            kind: "update",
            initial: stringifiedOption,
            value: stringifiedOption,
          };
        }
      }
      return { kind: "update", initial: null, value: null };
    },
    serialize: (value) => ({ [config.path]: t(value.value?.value ?? null) }),
    validate: (value) => validate(value, config.fieldMeta.isRequired),
    filter: {
      Filter(props) {
        return (
          <MultiSelect
            onChange={props.onChange}
            options={optionsWithStringValues}
            value={props.value}
            autoFocus
            className={props.className}
          />
        );
      },
      graphql: ({ type, value: options }) => ({
        [config.path]: {
          [type === "not_matches" ? "notIn" : "in"]: options.map((x) =>
            t(x.value)
          ),
        },
      }),
      Label({ type, value }) {
        if (!value.length) {
          return type === "not_matches" ? `is set` : `has no value`;
        }
        if (value.length > 1) {
          const values = value.map((i) => i.label).join(", ");
          return type === "not_matches"
            ? `is not in [${values}]`
            : `is in [${values}]`;
        }
        const optionLabel = value[0].label;
        return type === "not_matches"
          ? `is not ${optionLabel}`
          : `is ${optionLabel}`;
      },
      types: {
        matches: {
          label: "Matches",
          initialValue: [],
        },
        not_matches: {
          label: "Does not match",
          initialValue: [],
        },
      },
    },
  };
};
