"use client";

import { Fragment, useState } from "react";
import { cn } from "@keystone/utils/cn";

import { CellContainer } from "../../components/CellContainer";
import { FieldContainer } from "../../components/FieldContainer";
import { FieldDescription } from "../../components/FieldDescription";
import { FieldLabel } from "../../components/FieldLabel";
import { FieldLegend } from "../../components/FieldLegend";
import { AdminLink } from "../../components/AdminLink";
import { CreateItemDrawer } from "../../components/CreateItemDrawer";
import { RelationshipSelect } from "../../components/RelationshipSelect";
import { Cards } from "../../components/Cards";
import { Button, buttonVariants } from "../../primitives/default/ui/button";

function LinkToRelatedItems({ itemId, value, list, refFieldKey }) {
  function constructQuery({ refFieldKey, itemId, value }) {
    if (!!refFieldKey && itemId) {
      return `!${refFieldKey}_matches="${itemId}"`;
    }
    return `!id_in="${(value?.value)
      .slice(0, 100)
      .map(({ id }) => id)
      .join(",")}"`;
  }
  if (value.kind === "many") {
    const query = constructQuery({ refFieldKey, value, itemId });
    return (
      <Button variant="light" className="bg-transparent">
        <AdminLink href={`/${list.path}?${query}`}>
          View related {list.plural}
        </AdminLink>
      </Button>
    );
  }

  return (
    <AdminLink
      className={cn(buttonVariants({ variant: "light" }), "bg-transparent")}
      href={`/${list.path}/${value.value?.id}`}
    >
      View {list.singular} details
    </AdminLink>
  );
}

export function Field({
  field,
  autoFocus,
  value,
  onChange,
  forceValidation,
  list,
  foreignList,
  authenticatedItem,
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (value.kind === "cards-view") {
    return (
      <FieldContainer as="fieldset">
        <FieldLegend>{field.label}</FieldLegend>
        <FieldDescription id={`${field.path}-description`}>
          {field.description}
        </FieldDescription>
        <Cards
          forceValidation={forceValidation}
          field={field}
          id={value.id}
          value={value}
          onChange={onChange}
          foreignList={foreignList}
          list={list}
        />
      </FieldContainer>
    );
  }

  if (value.kind === "count") {
    return (
      <fieldset className="space-y-4">
        <FieldLegend>{field.label}</FieldLegend>
        <FieldDescription id={`${field.path}-description`}>
          {field.description}
        </FieldDescription>
        <div>
          {value.count === 1
            ? `There is 1 ${foreignList.singular} `
            : `There are ${value.count} ${foreignList.plural} `}
          linked to this {list.singular}
        </div>
      </fieldset>
    );
  }

  return (
    <FieldContainer as="fieldset">
      <FieldLabel as="legend">{field.label}</FieldLabel>
      <FieldDescription id={`${field.path}-description`}>
        {field.description}
      </FieldDescription>
      <Fragment>
        <div className="space-y-4">
          <RelationshipSelect
            controlShouldRenderValue
            aria-describedby={
              field.description === null
                ? undefined
                : `${field.path}-description`
            }
            autoFocus={autoFocus}
            isDisabled={onChange === undefined}
            labelField={field.refLabelField}
            searchFields={field.refSearchFields}
            list={foreignList}
            portalMenu
            state={
              value.kind === "many"
                ? {
                    kind: "many",
                    value: value.value,
                    onChange(newItems) {
                      onChange?.({
                        ...value,
                        value: newItems,
                      });
                    },
                  }
                : {
                    kind: "one",
                    value: value.value,
                    onChange(newVal) {
                      if (value.kind === "one") {
                        onChange?.({
                          ...value,
                          value: newVal,
                        });
                      }
                    },
                  }
            }
          />
          {!field.hideButtons && (
            <div className="flex space-x-2">
              {onChange !== undefined &&
                !field.hideCreate &&
                onChange !== undefined && (
                  <CreateItemDrawer
                    listKey={foreignList.key}
                    isDrawerOpen={isDrawerOpen}
                    setIsDrawerOpen={setIsDrawerOpen}
                    trigger={
                      <Button variant="secondary">
                        Create related {foreignList.singular}
                      </Button>
                    }
                    onClose={() => {
                      setIsDrawerOpen(false);
                    }}
                    onCreate={(val) => {
                      setIsDrawerOpen(false);
                      if (value.kind === "many") {
                        onChange({
                          ...value,
                          value: [...value.value, val],
                        });
                      } else if (value.kind === "one") {
                        onChange({
                          ...value,
                          value: val,
                        });
                      }
                    }}
                  />
                )}
              {onChange !== undefined &&
                authenticatedItem.state === "authenticated" &&
                authenticatedItem.listKey === field.refListKey &&
                (value.kind === "many"
                  ? value.value.find((x) => x.id === authenticatedItem.id) ===
                    undefined
                  : value.value?.id !== authenticatedItem.id) && (
                  <Button
                    onClick={() => {
                      const val = {
                        label: authenticatedItem.label,
                        id: authenticatedItem.id,
                      };
                      if (value.kind === "many") {
                        onChange({
                          ...value,
                          value: [...value.value, val],
                        });
                      } else {
                        onChange({
                          ...value,
                          value: val,
                        });
                      }
                    }}
                  >
                    {value.kind === "many" ? "Add " : "Set as "}
                    {authenticatedItem.label}
                  </Button>
                )}
              {!!(value.kind === "many"
                ? value.value.length
                : value.kind === "one" && value.value) && (
                <LinkToRelatedItems
                  itemId={value.id}
                  refFieldKey={field.refFieldKey}
                  list={foreignList}
                  value={value}
                />
              )}
            </div>
          )}
        </div>
      </Fragment>
    </FieldContainer>
  );
}

export function Cell({ field, item, list }) {
  if (field.display === "count") {
    const count = item[`${field.path}Count`] ?? 0;
    return (
      <CellContainer>
        {count} {count === 1 ? list.singular : list.plural}
      </CellContainer>
    );
  }

  const data = item[field.path];
  const items = (Array.isArray(data) ? data : [data]).filter((item) => item);
  const displayItems = items.length < 5 ? items : items.slice(0, 3);
  const overflow = items.length < 5 ? 0 : items.length - 3;

  return (
    <CellContainer>
      {displayItems.map((item, index) => (
        <Fragment key={item.id}>
          {!!index ? ", " : ""}
          <AdminLink href={`/${list.path}/${item.id}`}>
            {item.label || item.id}
          </AdminLink>
        </Fragment>
      ))}
      <span className="opacity-50 font-medium">
        {overflow ? `, and ${overflow} more` : null}
      </span>
    </CellContainer>
  );
}

export function CardValue({ field, item, list }) {
  const data = item[field.path];
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {(Array.isArray(data) ? data : [data])
        .filter((item) => item)
        .map((item, index) => (
          <Fragment key={item.id}>
            {!!index ? ", " : ""}
            <AdminLink href={`/${list.path}/${item.id}`}>
              {item.label || item.id}
            </AdminLink>
          </Fragment>
        ))}
    </FieldContainer>
  );
} 