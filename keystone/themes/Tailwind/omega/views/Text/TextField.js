"use client";

import { Checkbox } from "../../components/Checkbox";
import { FieldContainer } from "../../components/FieldContainer";
import { FieldDescription } from "../../components/FieldDescription";
import { FieldLabel } from "../../components/FieldLabel";
import { TextArea } from "../../components/TextArea";
import { TextInput } from "../../components/TextInput";
import { useState } from "react";

export const TextField = ({
    field,
    value,
    onChange,
    autoFocus,
    forceValidation,
  }) => {
    const [shouldShowErrors, setShouldShowErrors] = useState(false);
    const validationMessages = validate(value, field.validation, field.label);
    return (
      <FieldContainer>
        <FieldLabel htmlFor={field.path}>{field.label}</FieldLabel>
        <FieldDescription id={`${field.path}-description`}>
          {field.description}
        </FieldDescription>
        {onChange ? (
          <div>
            {field.displayMode === "textarea" ? (
              <TextArea
                id={field.path}
                autoFocus={autoFocus}
                onChange={(event) =>
                  onChange({
                    ...value,
                    inner: { kind: "value", value: event.target.value },
                  })
                }
                value={value.inner.kind === "null" ? "" : value.inner.value}
                disabled={value.inner.kind === "null"}
                onBlur={() => {
                  setShouldShowErrors(true);
                }}
                aria-describedby={
                  field.description === null
                    ? undefined
                    : `${field.path}-description`
                }
              />
            ) : (
              <TextInput
                id={field.path}
                autoFocus={autoFocus}
                onChange={(event) =>
                  onChange({
                    ...value,
                    inner: { kind: "value", value: event.target.value },
                  })
                }
                value={value.inner.kind === "null" ? "" : value.inner.value}
                disabled={value.inner.kind === "null"}
                onBlur={() => {
                  setShouldShowErrors(true);
                }}
                aria-describedby={
                  field.description === null
                    ? undefined
                    : `${field.path}-description`
                }
              />
            )}
            {field.isNullable && (
              <Checkbox
                autoFocus={autoFocus}
                disabled={onChange === undefined}
                onChange={() => {
                  if (value.inner.kind === "value") {
                    onChange({
                      ...value,
                      inner: {
                        kind: "null",
                        prev: value.inner.value,
                      },
                    });
                  } else {
                    onChange({
                      ...value,
                      inner: {
                        kind: "value",
                        value: value.inner.prev,
                      },
                    });
                  }
                }}
                checked={value.inner.kind === "null"}
              >
                <span>Set field as null</span>
              </Checkbox>
            )}
            {!!validationMessages.length &&
              (shouldShowErrors || forceValidation) &&
              validationMessages.map((message, i) => (
                <span key={i} className="text-red-600 dark:text-red-700 text-sm">
                  {message}
                </span>
              ))}
          </div>
        ) : value.inner.kind === "null" ? null : (
          value.inner.value
        )}
      </FieldContainer>
    );
  };