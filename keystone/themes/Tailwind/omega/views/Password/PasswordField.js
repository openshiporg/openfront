"use client";

import { Fragment, useState } from "react";

import { FieldDescription } from "../../components/FieldDescription";
import { FieldContainer } from "../../components/FieldContainer";
import { FieldLabel } from "../../components/FieldLabel";
import { TextInput } from "../../components/TextInput";
import { Button } from "../../primitives/default/ui/button";
import { EyeIcon, EyeOffIcon, XIcon } from "lucide-react";

export const PasswordField = ({
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
    <span className="text-red-600 dark:text-red-700 text-sm">
      {validationMessage}
    </span>
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
            className="text-xs shadow-sm border border-zinc-200 dark:border-zinc-800 uppercase tracking-wide py-2.5 px-4 bg-muted/40 dark:bg-zinc-800/40"
            variant="light"
          >
            {value.isSet ? "Change Password" : "Set Password"}
          </Button>
          {validation}
        </Fragment>
      ) : (
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-2">
            {/* <VisuallyHidden as="label" htmlFor={`${field.path}-new-password`}>
                New Password
              </VisuallyHidden> */}
            <div style={{ flexGrow: 1, flexBasis: "250px" }}>
              <TextInput
                id={`${field.path}-new-password`}
                autoFocus
                invalid={validationMessage !== undefined}
                type={inputType}
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
            </div>
            <div style={{ flexGrow: 1, flexBasis: "250px" }}>
              <label
                htmlFor={`${field.path}-confirm-password`}
                className="sr-only"
              >
                Confirm Password
              </label>
              <TextInput
                id={`${field.path}-confirm-password`}
                invalid={validationMessage !== undefined}
                type={inputType}
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
            </div>
            <Button
              type="button"
              onClick={() => {
                setShowInputValue(!showInputValue);
              }}
              variant="secondary"
            >
              <span className="sr-only">
                {showInputValue ? "Hide Text" : "Show Text"}
              </span>
              {showInputValue ? (
                <EyeOffIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </Button>
            <Button
              type="button"
              onClick={() => {
                onChange({
                  kind: "initial",
                  isSet: value.isSet,
                });
              }}
              variant="secondary"
            >
              <span className="sr-only">Cancel</span>
              <XIcon className="w-5 h-5" />
            </Button>
          </div>
          {validation}
        </div>
      )}
    </FieldContainer>
  );
};
