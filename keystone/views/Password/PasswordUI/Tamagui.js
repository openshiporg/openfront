import { Fragment, useState } from "react";
import {
  Button,
  Stack,
  Text,
  VisuallyHidden,
  Input,
  styled,
  XStack,
} from "tamagui"; // Import from Tamagui

import { Eye, EyeOff, X } from "@tamagui/lucide-icons";
// // @ts-ignore
import dumbPasswords from "dumb-passwords";
import { CellContainer } from "@keystone/components/CellContainer";
import { FieldDescription } from "@keystone/components/FieldDescription";
import { FieldContainer } from "@keystone/components/FieldContainer";
import { FieldLabel } from "@keystone/components/FieldLabel";
import { TextInput } from "@keystone/components/TextInput";

// const FieldContainer = styled(Stack, {
//   marginBottom: "$medium",
//   display: "flex",
//   flexDirection: "column",
// });

const SegmentedControlButton = styled(Button, {
  borderRadius: 0,
  borderColor: "$gray300",
  borderWidth: 1,
  "&:first-child": {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  "&:last-child": {
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  "&:not(:first-child):not(:last-child)": {
    borderLeftWidth: 0,
  },
  "&[aria-pressed='true']": {
    backgroundColor: "$blue600",
    color: "$white",
  },
});

const SegmentedControl = ({ options, onChange, value }) => {
  return (
    <Stack>
      {options.map((option) => (
        <SegmentedControlButton
          key={option.value}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
        >
          {option.label}
        </SegmentedControlButton>
      ))}
    </Stack>
  );
};

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

export const Field = ({
  field,
  value,
  onChange,
  forceValidation,
  autoFocus,
}) => {
  const [showInputValue, setShowInputValue] = useState(false);
  const [touchedFirstInput, setTouchedFirstInput] = useState(false);
  const [touchedSecondInput, setTouchedSecondInput] = useState(false);
  const shouldShowValidation =
    forceValidation || (touchedFirstInput && touchedSecondInput);
  const validationMessage = shouldShowValidation
    ? validate(value, field.validation, field.label)
    : undefined;
  const validation = validationMessage && (
    <Text color="$red9" fontSize="$5">
      {validationMessage}
    </Text>
  );
  const inputType = showInputValue ? "text" : "password";
  return (
    <FieldContainer as="fieldset">
      <FieldLabel as="legend">{field.label}</FieldLabel>
      <FieldDescription id={`${field.path}-description`}>
        {field.description}
      </FieldDescription>
      {onChange === undefined ? (
        isSetText(value.isSet)
      ) : value.kind === "initial" ? (
        <Fragment>
          <div>
            <Button
              autoFocus={autoFocus}
              onClick={() => {
                onChange({
                  kind: "editing",
                  confirm: "",
                  value: "",
                  isSet: value.isSet,
                });
              }}
            >
              {value.isSet ? "Change Password" : "Set Password"}
            </Button>
          </div>
          {validation}
        </Fragment>
      ) : (
        <Stack space="$2">
          <XStack space="$2">
            <VisuallyHidden as="label" htmlFor={`${field.path}-new-password`}>
              New Password
            </VisuallyHidden>
            <TextInput
              id={`${field.path}-new-password`}
              autoFocus
              invalid={validationMessage !== undefined}
              secureTextEntry={!showInputValue}
              value={value.value}
              placeholder="New Password"
              onChange={(event) => {
                onChange({
                  ...value,
                  value: event.target.value,
                });
              }}
              onBlur={() => {
                setTouchedFirstInput(true);
              }}
            />
            <VisuallyHidden
              as="label"
              htmlFor={`${field.path}-confirm-password`}
            >
              Confirm Password
            </VisuallyHidden>
            <TextInput
              id={`${field.path}-confirm-password`}
              invalid={validationMessage !== undefined}
              secureTextEntry={!showInputValue}
              value={value.confirm}
              placeholder="Confirm Password"
              onChange={(event) => {
                onChange({
                  ...value,
                  confirm: event.target.value,
                });
              }}
              onBlur={() => {
                setTouchedSecondInput(true);
              }}
            />
            <Button
              onClick={() => {
                setShowInputValue(!showInputValue);
              }}
            >
              <VisuallyHidden>
                {showInputValue ? "Hide Text" : "Show Text"}
              </VisuallyHidden>
              {showInputValue ? <EyeOff /> : <Eye />}
            </Button>
            <Button
              onClick={() => {
                onChange({
                  kind: "initial",
                  isSet: value.isSet,
                });
              }}
            >
              <VisuallyHidden>Cancel</VisuallyHidden>
              <X />
            </Button>
          </XStack>
          {validation}
        </Stack>
      )}
    </FieldContainer>
  );
};

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
                <SegmentedControl
                  selectedIndex={Number(props.value)}
                  onChange={(value) => {
                    props.onChange(!!value);
                  }}
                  segments={["Is Not Set", "Is Set"]}
                />
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
