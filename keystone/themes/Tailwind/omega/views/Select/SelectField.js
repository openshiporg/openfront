"use client";

import { Fragment, useState } from "react";
import { FieldContainer } from "../../components/FieldContainer";
import { FieldDescription } from "../../components/FieldDescription";
import { FieldLabel } from "../../components/FieldLabel";
import { Select, MultiSelect } from "../../components/Select";
import { Radio } from "../../components/Radio";
import { Button } from "../../primitives/default/ui/button";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../primitives/default/ui/toggle-group";

export const SelectField = ({
    field,
    value,
    onChange,
    autoFocus,
    forceValidation,
  }) => {
    const [hasChanged, setHasChanged] = useState(false);
    const validationMessage =
      (hasChanged || forceValidation) && !validate(value, field.isRequired) ? (
        <span className="text-red-600 dark:text-red-700 text-sm">
          {field.label} is required
        </span>
      ) : null;
    return (
      <FieldContainer as={field.displayMode === "select" ? "div" : "fieldset"}>
        {field.displayMode === "select" ? (
          <Fragment>
            <FieldLabel htmlFor={field.path}>{field.label}</FieldLabel>
            <FieldDescription id={`${field.path}-description`}>
              {field.description}
            </FieldDescription>
            <Select
              id={field.path}
              isClearable
              autoFocus={autoFocus}
              options={field.options}
              isDisabled={onChange === undefined}
              onChange={(newVal) => {
                onChange?.({ ...value, value: newVal });
                setHasChanged(true);
              }}
              value={value.value}
              aria-describedby={
                field.description === null
                  ? undefined
                  : `${field.path}-description`
              }
              portalMenu
            />
            {validationMessage}
          </Fragment>
        ) : field.displayMode === "radio" ? (
          <Fragment>
            <FieldLabel as="legend">{field.label}</FieldLabel>
            <FieldDescription id={`${field.path}-description`}>
              {field.description}
            </FieldDescription>
            <div>
              {field.options.map((option) => (
                <Radio
                  key={option.value}
                  value={option.value}
                  checked={value.value?.value === option.value}
                  onChange={(event) => {
                    if (event.target.checked) {
                      onChange?.({ ...value, value: option });
                      setHasChanged(true);
                    }
                  }}
                >
                  {option.label}
                </Radio>
              ))}
              {value.value !== null &&
                onChange !== undefined &&
                !field.isRequired && (
                  <Button
                    onClick={() => {
                      onChange({ ...value, value: null });
                      setHasChanged(true);
                    }}
                  >
                    Clear
                  </Button>
                )}
            </div>
            {validationMessage}
          </Fragment>
        ) : (
          <Fragment>
            <FieldLabel as="legend">{field.label}</FieldLabel>
            <FieldDescription id={`${field.path}-description`}>
              {field.description}
            </FieldDescription>
            <div>
              <ToggleGroup
                type="single"
                value={
                  value.value
                    ? field.options.findIndex(
                        (x) => x.value === value.value.value
                      )
                    : undefined
                }
                onValueChange={(index) => {
                  onChange?.({ ...value, value: field.options[index] });
                  setHasChanged(true);
                }}
              >
                {field.options.map((x) => (
                  <ToggleGroupItem value={x.value}>{x.label}</ToggleGroupItem>
                ))}
              </ToggleGroup>
              {value.value !== null &&
                onChange !== undefined &&
                !field.isRequired && (
                  <Button
                    onClick={() => {
                      onChange({ ...value, value: null });
                      setHasChanged(true);
                    }}
                  >
                    Clear
                  </Button>
                )}
            </div>
            {validationMessage}
          </Fragment>
        )}
      </FieldContainer>
    );
  };