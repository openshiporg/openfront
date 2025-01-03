
// @ts-ignore
import dumbPasswords from "dumb-passwords";
import { CellContainer } from "../../components/CellContainer";
import { FieldContainer } from "../../components/FieldContainer";
import { FieldLabel } from "../../components/FieldLabel";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../primitives/default/ui/toggle-group";
import { PasswordField } from "./PasswordField";

function validate(value, validation, fieldLabel) {
  if (
    value.kind === "initial" &&
    (value.isSet === null || value.isSet === true)
  ) {
    return undefined;
  }
  if (value.kind === "initial" && validation?.isRequired) {
    return `${fieldLabel} is required`;
  }
  if (value.kind === "editing" && value.confirm !== value.value) {
    return `The passwords do not match`;
  }
  if (value.kind === "editing") {
    const val = value.value;
    if (val.length < validation.length.min) {
      if (validation.length.min === 1) {
        return `${fieldLabel} must not be empty`;
      }
      return `${fieldLabel} must be at least ${validation.length.min} characters long`;
    }
    if (validation.length.max !== null && val.length > validation.length.max) {
      return `${fieldLabel} must be no longer than ${validation.length.max} characters`;
    }
    if (validation.match && !validation.match.regex.test(val)) {
      return validation.match.explanation;
    }
    if (validation.rejectCommon && dumbPasswords.check(val)) {
      return `${fieldLabel} is too common and is not allowed`;
    }
  }
  return undefined;
}

function isSetText(isSet) {
  return isSet == null ? "Access Denied" : isSet ? "Is set" : "Is not set";
}

export const Field = PasswordField

export const Cell = ({ item, field }) => {
  return <CellContainer>{isSetText(item[field.path]?.isSet)}</CellContainer>;
};

export const CardValue = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {isSetText(item[field.path]?.isSet)}
    </FieldContainer>
  );
};

export const controller = (config) => {
  const validation = {
    ...config.fieldMeta.validation,
    match:
      config.fieldMeta.validation.match === null
        ? null
        : {
            regex: new RegExp(
              config.fieldMeta.validation.match.regex.source,
              config.fieldMeta.validation.match.regex.flags
            ),
            explanation: config.fieldMeta.validation.match.explanation,
          },
  };
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: `${config.path} {isSet}`,
    validation,
    defaultValue: {
      kind: "initial",
      isSet: false,
    },
    validate: (state) =>
      validate(state, validation, config.label) === undefined,
    deserialize: (data) => ({
      kind: "initial",
      isSet: data[config.path]?.isSet ?? null,
    }),
    serialize: (value) => {
      if (value.kind === "initial") return {};
      return { [config.path]: value.value };
    },
    filter:
      config.fieldMeta.isNullable === false
        ? undefined
        : {
            Filter(props) {
              return (
                <ToggleGroup
                  type="single"
                  value={props.value.toString()}
                  onValueChange={(value) => {
                    props.onChange(Number(value));
                  }}
                >
                  <ToggleGroupItem value="0">Is Not Set</ToggleGroupItem>
                  <ToggleGroupItem value="1">Is Set</ToggleGroupItem>
                </ToggleGroup>
              );
            },
            graphql: ({ value }) => {
              return { [config.path]: { isSet: value } };
            },
            Label({ value }) {
              return value ? "is set" : "is not set";
            },
            types: {
              is_set: {
                label: "Is Set",
                initialValue: true,
              },
            },
          },
  };
};
