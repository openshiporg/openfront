import { CellContainer } from "../../components/CellContainer";
import { CellLink } from "../../components/CellLink";
import { FieldContainer } from "../../components/FieldContainer";
import { FieldLabel } from "../../components/FieldLabel";
import { TextInput } from "../../components/TextInput";
import { TextField } from "./TextField";

export const Field = TextField

export const Cell = ({ item, field, linkTo }) => {
  let value = item[field.path] + "";
  return linkTo ? (
    <CellLink {...linkTo}>{value}</CellLink>
  ) : (
    <CellContainer>{value}</CellContainer>
  );
};
Cell.supportsLinkTo = true;

export const CardValue = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {item[field.path]}
    </FieldContainer>
  );
};

function validate(value, validation, fieldLabel) {
  // if the value is the same as the initial for an update, we don't want to block saving
  // since we're not gonna send it anyway if it's the same
  // and going "fix this thing that is unrelated to the thing you're doing" is bad
  // and also bc it could be null bc of read access control
  if (
    value.kind === "update" &&
    ((value.initial.kind === "null" && value.inner.kind === "null") ||
      (value.initial.kind === "value" &&
        value.inner.kind === "value" &&
        value.inner.value === value.initial.value))
  ) {
    return [];
  }

  if (value.inner.kind === "null") {
    if (validation.isRequired) {
      return [`${fieldLabel} is required`];
    }
    return [];
  }

  const val = value.inner.value;

  let messages = [];
  if (validation.length.min !== null && val.length < validation.length.min) {
    if (validation.length.min === 1) {
      messages.push(`${fieldLabel} must not be empty`);
    } else {
      messages.push(
        `${fieldLabel} must be at least ${validation.length.min} characters long`
      );
    }
  }
  if (validation.length.max !== null && val.length > validation.length.max) {
    messages.push(
      `${fieldLabel} must be no longer than ${validation.length.max} characters`
    );
  }
  if (validation.match && !validation.match.regex.test(val)) {
    messages.push(
      validation.match.explanation ||
        `${fieldLabel} must match ${validation.match.regex}`
    );
  }
  return messages;
}

function deserializeTextValue(value) {
  if (value === null) {
    return { kind: "null", prev: "" };
  }
  return { kind: "value", value };
}

export const controller = (config) => {
  const validation = {
    isRequired: config.fieldMeta.validation.isRequired,
    length: config.fieldMeta.validation.length,
    match: config.fieldMeta.validation.match
      ? {
          regex: new RegExp(
            config.fieldMeta.validation.match.regex.source,
            config.fieldMeta.validation.match.regex.flags
          ),
          explanation: config.fieldMeta.validation.match.explanation,
        }
      : null,
  };
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: {
      kind: "create",
      inner: deserializeTextValue(config.fieldMeta.defaultValue),
    },
    displayMode: config.fieldMeta.displayMode,
    isNullable: config.fieldMeta.isNullable,
    deserialize: (data) => {
      const inner = deserializeTextValue(data[config.path]);
      return { kind: "update", inner, initial: inner };
    },
    serialize: (value) => ({
      [config.path]: value.inner.kind === "null" ? null : value.inner.value,
    }),
    validation,
    validate: (val) => validate(val, validation, config.label).length === 0,
    filter: {
      Filter(props) {
        return (
          <TextInput
            onChange={(event) => {
              props.onChange(event.target.value);
            }}
            value={props.value}
            autoFocus={props.autoFocus}
            className={props.className}
          />
        );
      },

      graphql: ({ type, value }) => {
        const isNot = type.startsWith("not_");
        const key =
          type === "is_i" || type === "not_i"
            ? "equals"
            : type
                .replace(/_i$/, "")
                .replace("not_", "")
                .replace(/_([a-z])/g, (_, char) => char.toUpperCase());
        const filter = { [key]: value };
        return {
          [config.path]: {
            ...(isNot ? { not: filter } : filter),
            mode: config.fieldMeta.shouldUseModeInsensitive
              ? "insensitive"
              : undefined,
          },
        };
      },
      Label({ label, value }) {
        return `${label.toLowerCase()}: "${value}"`;
      },
      types: {
        contains_i: {
          label: "Contains",
          initialValue: "",
        },
        not_contains_i: {
          label: "Does not contain",
          initialValue: "",
        },
        is_i: {
          label: "Is exactly",
          initialValue: "",
        },
        not_i: {
          label: "Is not exactly",
          initialValue: "",
        },
        starts_with_i: {
          label: "Starts with",
          initialValue: "",
        },
        not_starts_with_i: {
          label: "Does not start with",
          initialValue: "",
        },
        ends_with_i: {
          label: "Ends with",
          initialValue: "",
        },
        not_ends_with_i: {
          label: "Does not end with",
          initialValue: "",
        },
      },
    },
  };
};
