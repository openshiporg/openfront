import { FieldContainer } from "../../components/FieldContainer";
import { FieldDescription } from "../../components/FieldDescription";
import { FieldLabel } from "../../components/FieldLabel";
import { TextInput } from "../../components/TextInput";
import { CellContainer } from "../../components/CellContainer";
import { CellLink } from "../../components/CellLink";
import { FloatInput } from "./FloatInput";

function validate(value, validation, label) {
  const val = value.value;

  // if we recieve null initially on the item view and the current value is null,
  // we should always allow saving it because:
  // - the value might be null in the database and we don't want to prevent saving the whole item because of that
  // - we might have null because of an access control error
  if (value.kind === "update" && value.initial === null && val === null) {
    return undefined;
  }

  if (value.kind === "create" && value.value === null) {
    return undefined;
  }

  if (validation.isRequired && val === null) {
    return `${label} is required`;
  }

  // we don't parse infinite numbers into +-Infinity/NaN so that we don't lose the text that the user wrote
  // so we need to try parsing it again here to provide good messages
  if (typeof val === "string") {
    const number = parseFloat(val);
    if (isNaN(number)) {
      return `${label} must be a number`;
    }
    return `${label} must be finite`;
  }

  if (typeof val === "number") {
    if (typeof validation?.min === "number" && val < validation.min) {
      return `${label} must be greater than or equal to ${validation.min}`;
    }
    if (typeof validation?.max === "number" && val > validation?.max) {
      return `${label} must be less than or equal to ${validation.max}`;
    }
  }

  return undefined;
}

export const Field = ({
  field,
  value,
  onChange,
  autoFocus,
  forceValidation,
}) => {
  const message = validate(value, field.validation, field.label);
  return (
    <FieldContainer>
      <FieldLabel htmlFor={field.path}>{field.label}</FieldLabel>
      <FieldDescription id={`${field.path}-description`}>
        {field.description}
      </FieldDescription>
      {onChange ? (
        <span>
          <FloatInput
            id={field.path}
            autoFocus={autoFocus}
            onChange={(val) => {
              onChange({ ...value, value: val });
            }}
            aria-describedby={
              field.description === null
                ? undefined
                : `${field.path}-description`
            }
            value={value.value}
            forceValidation={forceValidation}
            validationMessage={message}
          />
        </span>
      ) : (
        value.value
      )}
    </FieldContainer>
  );
};

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

export const controller = (config) => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    validation: config.fieldMeta.validation,
    defaultValue: {
      kind: "create",
      value: config.fieldMeta.defaultValue,
    },
    deserialize: (data) => ({
      kind: "update",
      initial: data[config.path],
      value: data[config.path],
    }),
    serialize: (value) => ({ [config.path]: value.value }),
    validate: (value) =>
      validate(value, config.fieldMeta.validation, config.label) === undefined,
    filter: {
      Filter({ autoFocus, type, onChange, value }) {
        return (
          <TextInput
            onChange={(event) => {
              if (type === "in" || type === "not_in") {
                onChange(event.target.value.replace(/[^\d\.,\s-]/g, ""));
                return;
              }
              onChange(event.target.value.replace(/[^\d\.\s-]/g, ""));
            }}
            value={value}
            autoFocus={autoFocus}
          />
        );
      },

      graphql: ({ type, value }) => {
        const valueWithoutWhitespace = value.replace(/\s/g, "");
        const parsed =
          type === "in" || type === "not_in"
            ? valueWithoutWhitespace.split(",").map((x) => parseFloat(x))
            : parseFloat(valueWithoutWhitespace);
        if (type === "not") {
          return { [config.path]: { not: { equals: parsed } } };
        }
        const key =
          type === "is" ? "equals" : type === "not_in" ? "notIn" : type;
        return { [config.path]: { [key]: parsed } };
      },
      Label({ label, value, type }) {
        let renderedValue = value;
        if (["in", "not_in"].includes(type)) {
          renderedValue = value
            .split(",")
            .map((value) => value.trim())
            .join(", ");
        }
        return `${label.toLowerCase()}: ${renderedValue}`;
      },
      types: {
        is: {
          label: "Is exactly",
          initialValue: "",
        },
        not: {
          label: "Is not exactly",
          initialValue: "",
        },
        gt: {
          label: "Is greater than",
          initialValue: "",
        },
        lt: {
          label: "Is less than",
          initialValue: "",
        },
        gte: {
          label: "Is greater than or equal to",
          initialValue: "",
        },
        lte: {
          label: "Is less than or equal to",
          initialValue: "",
        },
        in: {
          label: "Is one of",
          initialValue: "",
        },
        not_in: {
          label: "Is not one of",
          initialValue: "",
        },
      },
    },
  };
};
