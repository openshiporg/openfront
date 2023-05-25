import { memo, useId, useMemo } from "react";
import { Separator, Stack, Text } from "tamagui";
import { FieldDescription } from "@keystone/components/FieldDescription";

const RenderField = memo(function RenderField({
  field,
  value,
  autoFocus,
  forceValidation,
  onChange,
}) {
  return (
    <field.views.Field
      field={field.controller}
      onChange={useMemo(() => {
        if (onChange === undefined) return undefined;
        return (value) => {
          onChange((val) => ({
            ...val,
            [field.controller.path]: { kind: "value", value },
          }));
        };
      }, [onChange, field.controller.path])}
      value={value}
      autoFocus={autoFocus}
      forceValidation={forceValidation}
    />
  );
});

export function Tamagui({
  fields,
  value,
  fieldModes = null,
  fieldPositions = null,
  forceValidation,
  invalidFields,
  position = "form",
  groups = [],
  onChange,
}) {
  const renderedFields = Object.fromEntries(
    Object.keys(fields).map((fieldKey, index) => {
      const field = fields[fieldKey];
      const val = value[fieldKey];
      const fieldMode = fieldModes === null ? "edit" : fieldModes[fieldKey];
      const fieldPosition =
        fieldPositions === null ? "form" : fieldPositions[fieldKey];
      if (fieldMode === "hidden") return [fieldKey, null];
      if (fieldPosition !== position) return [fieldKey, null];
      if (val.kind === "error") {
        return [
          fieldKey,
          <Stack key={fieldKey}>
            {field.label}:{" "}
            <span css={{ color: "red" }}>{val.errors[0].message}</span>
          </Stack>,
        ];
      }
      return [
        fieldKey,
        <RenderField
          key={fieldKey}
          field={field}
          value={val.value}
          forceValidation={forceValidation && invalidFields.has(fieldKey)}
          onChange={fieldMode === "edit" ? onChange : undefined}
          autoFocus={index === 0}
        />,
      ];
    })
  );
  const rendered = [];
  const fieldGroups = new Map();
  for (const group of groups) {
    const state = { group, rendered: false };
    for (const field of group.fields) {
      fieldGroups.set(field.path, state);
    }
  }
  for (const field of Object.values(fields)) {
    const fieldKey = field.path;
    if (fieldGroups.has(fieldKey)) {
      const groupState = fieldGroups.get(field.path);
      if (groupState.rendered) {
        continue;
      }
      groupState.rendered = true;
      const { group } = groupState;
      const renderedFieldsInGroup = group.fields.map(
        (field) => renderedFields[field.path]
      );
      if (renderedFieldsInGroup.every((field) => field === null)) {
        continue;
      }
      rendered.push(
        <FieldGroup label={group.label} description={group.description}>
          {renderedFieldsInGroup}
        </FieldGroup>
      );
      continue;
    }
    if (renderedFields[fieldKey] === null) {
      continue;
    }
    rendered.push(renderedFields[fieldKey]);
  }

  return (
    <Stack gap="xlarge">
      {rendered.length === 0
        ? "There are no fields that you can read or edit"
        : rendered}
    </Stack>
  );
}

function FieldGroup(props) {
  const descriptionId = useId();
  const labelId = useId();
  const buttonSize = 24;

  return (
    <Stack
      role="group"
      aria-labelledby={labelId}
      aria-describedby={props.description === null ? undefined : descriptionId}
    >
      <details open>
        <summary
          style={{
            listStyle: "none",
            outline: 0,
            "::-webkit-details-marker": { display: "none" },
          }}
        >
          <Stack across gap="medium">
            <Stack
              style={{
                // ...buttonStyles,
                // "summary:focus &": buttonStyles[":focus"],
                padding: 0,
                height: buttonSize,
                width: buttonSize,
                "details[open] &": {
                  transform: "rotate(90deg)",
                },
              }}
            >
              {downChevron}
            </Stack>
            <Separator marginVertical={15} />
            <Text
              id={labelId}
              size="large"
              weight="bold"
              css={{ position: "relative" }}
            >
              {props.label}
            </Text>
          </Stack>
        </summary>
        <Stack across gap="medium">
          <Stack style={{ width: buttonSize }} />
          <Separator marginVertical={15} />

          <Stack>
            {props.description !== null && (
              <FieldDescription id={descriptionId}>
                {props.description}
              </FieldDescription>
            )}
            <Stack marginTop="xlarge" gap="xlarge">
              {props.children}
            </Stack>
          </Stack>
        </Stack>
      </details>
    </Stack>
  );
}

const downChevron = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M5 3L8.75 6L5 9L5 3Z" fill="currentColor" />
  </svg>
);
