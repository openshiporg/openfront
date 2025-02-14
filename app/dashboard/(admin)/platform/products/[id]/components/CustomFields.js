import { memo, useId, useMemo } from "react";
import { FieldDescription } from "@keystone/themes/Tailwind/orion/components/FieldDescription";
import { Separator } from "@ui/separator";
import { Button, buttonVariants } from "@ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@keystone/utils/cn";
import { Badge } from "@ui/badge";

const RenderField = memo(function RenderField({
  field,
  value,
  autoFocus,
  forceValidation,
  onChange,
  fieldTypeViews = {},  // Views that apply to all fields of a certain type
  fieldViews = {}       // Views that apply to specific fields by path
}) {
  const memoizedOnChange = useMemo(() => {
    if (onChange === undefined) return undefined;
    return (value) => {
      onChange((val) => ({
        ...val,
        [field.controller.path]: { kind: "value", value },
      }));
    };
  }, [onChange, field.controller.path]);

  // First check for a specific field override by path
  if (fieldViews[field.path]) {
    const CustomField = fieldViews[field.path].Field;
    return (
      <CustomField
        field={field.controller}
        value={value}
        onChange={memoizedOnChange}
        autoFocus={autoFocus}
        forceValidation={forceValidation}
      />
    );
  }

  // Then check for a field type override
  const fieldType = field.controller.fieldType || field.views.Field?.fieldType;
  if (fieldType && fieldTypeViews[fieldType]) {
    const CustomField = fieldTypeViews[fieldType].Field;
    return (
      <CustomField
        field={field.controller}
        value={value}
        onChange={memoizedOnChange}
        autoFocus={autoFocus}
        forceValidation={forceValidation}
      />
    );
  }

  // Finally fall back to the default field view
  return (
    <field.views.Field
      field={{
        ...field.controller,
        hideButtons: field.fieldMeta?.hideButtons,
      }}
      onChange={memoizedOnChange}
      value={value}
      autoFocus={autoFocus}
      forceValidation={forceValidation}
    />
  );
});

export function CustomFields({
  fields,
  value,
  fieldModes = null,
  fieldPositions = null,
  forceValidation,
  invalidFields,
  position = "form",
  groups = [],
  onChange,
  fieldTypeViews = {},  // Views that apply to all fields of a certain type
  fieldViews = {}       // Views that apply to specific fields by path
}) {
  const renderedFields = Object.fromEntries(
    Object.keys(fields).map((fieldKey) => {
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
          <div key={fieldKey}>
            {field.label}:{" "}
            <span className="text-red-600 dark:text-red-700 text-sm">
              {val.errors[0].message}
            </span>
          </div>,
        ];
      }
      return [
        fieldKey,
        <RenderField
          key={fieldKey}
          field={field}
          value={val.value}
          forceValidation={forceValidation}
          invalidFields={invalidFields?.has(fieldKey)}
          onChange={fieldMode === "edit" ? onChange : undefined}
          fieldTypeViews={fieldTypeViews}
          fieldViews={fieldViews}
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
        <FieldGroup
          key={group.label}
          count={group.fields.length}
          label={group.label}
          description={group.description}
          collapsed={group.collapsed}
        >
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
    <div className="grid w-full items-center gap-4">
      {rendered.length === 0
        ? "There are no fields that you can read or edit"
        : rendered}
    </div>
  );
}

function FieldGroup(props) {
  const descriptionId = useId();
  const labelId = useId();
  
  const divider = <Separator orientation="vertical" />;

  // Count actual fields (excluding virtual fields in create view)
  const actualFieldCount = props.children.filter(
    (item) =>
      item !== undefined &&
      !(typeof item.props?.value === 'symbol' && 
        item.props?.value.toString() === 'Symbol(create view virtual field value)')
  ).length;

  if (actualFieldCount === 0) {
    return null;
  }

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      aria-describedby={props.description === null ? undefined : descriptionId}
    >
      <details open={!props.collapsed} className="group">
        <summary className="list-none outline-none [&::-webkit-details-marker]:hidden cursor-pointer">
          <div className="flex gap-1.5">
            <span>
              <div
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" }),
                  "border self-start transition-transform group-open:rotate-90 [&_svg]:size-3 h-6 w-6"
                )}
              >
                <ChevronRight />
              </div>
            </span>
            {divider}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <text id={labelId} className="relative text-lg/5 font-medium">
                  {props.label}
                </text>
                <Badge className="text-[.7rem] py-0.5 uppercase tracking-wide font-medium">
                  {actualFieldCount} FIELD{actualFieldCount !== 1 && "S"}
                </Badge>
              </div>
              {props.description !== null && (
                <FieldDescription
                  className="opacity-50 text-sm"
                  id={descriptionId}
                >
                  {props.description}
                </FieldDescription>
              )}
            </div>
          </div>
        </summary>
        <div className="flex ml-[2.25rem] mt-2">
          {divider}
          <div className="w-full">
            <div className="space-y-4">{props.children}</div>
          </div>
        </div>
      </details>
    </div>
  );
} 