"use client";

import { Fragment, useState } from "react";
import { useKeystone, useList } from "@keystone/keystoneProvider";
import { CellContainer } from "@keystone/themes/Tailwind/orion/components/CellContainer";
import { FieldContainer } from "@keystone/themes/Tailwind/orion/components/FieldContainer";
import { FieldDescription } from "@keystone/themes/Tailwind/orion/components/FieldDescription";
import { FieldLabel } from "@keystone/themes/Tailwind/orion/components/FieldLabel";
import { FieldLegend } from "@keystone/themes/Tailwind/orion/components/FieldLegend";
import { AdminLink } from "@keystone/themes/Tailwind/orion/components/AdminLink";
import { CreateItemDrawer } from "@keystone/themes/Tailwind/orion/components/CreateItemDrawer";
import { RelationshipSelect } from "@keystone/themes/Tailwind/orion/components/RelationshipSelect";
import { Cards } from "../../Cards";
import { Button } from "@ui/button";

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
      <Button variant="ghost">
        <AdminLink href={`/${list.path}?${query}`}>
          View related {list.plural}
        </AdminLink>
      </Button>
    );
  }

  return (
    <Button variant="ghost">
      <AdminLink href={`/${list.path}/${value.value?.id}`}>
        View {list.singular} details
      </AdminLink>
    </Button>
  );
}

export const Field = ({
  field,
  autoFocus,
  value,
  onChange,
  forceValidation,
}) => {
  const keystone = useKeystone();
  const foreignList = useList(field.refListKey);
  const localList = useList(field.listKey);
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
          localList={localList}
          onCreateItem={(callback) => {
            setIsDrawerOpen(true);
            return (val) => {
              callback?.(val);
            };
          }}
        />
        {!field.hideCreate && (
          <CreateItemDrawer
            listKey={foreignList.key}
            isDrawerOpen={isDrawerOpen}
            setIsDrawerOpen={setIsDrawerOpen}
            onClose={() => {
              setIsDrawerOpen(false);
            }}
            onCreate={(val) => {
              setIsDrawerOpen(false);
              if (value.kind === "cards-view") {
                // Convert currentIds and initialIds to arrays if they're objects
                const currentIds = new Set(
                  Array.isArray(value.currentIds)
                    ? value.currentIds
                    : value.currentIds instanceof Set
                      ? value.currentIds
                      : Object.keys(value.currentIds)
                );
                const initialIds = new Set(
                  Array.isArray(value.initialIds)
                    ? value.initialIds
                    : value.initialIds instanceof Set
                      ? value.initialIds
                      : Object.keys(value.initialIds)
                );

                // Add the new ID
                currentIds.add(val.id);
                initialIds.add(val.id);

                const newValue = {
                  ...value,
                  currentIds,
                  initialIds,
                };

                onChange(newValue);
              }
            }}
          />
        )}
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
          linked to this {localList.singular}
        </div>
      </fieldset>
    );
  }

  const authenticatedItem = keystone.authenticatedItem;

  return (
    <FieldContainer as="fieldset">
      <FieldLabel as="legend">{field.label}</FieldLabel>
      <FieldDescription id={`${field.path}-description`}>
        {field.description}
      </FieldDescription>
      <Fragment>
        <div className="space-y-2">
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
            <div className="flex gap-1 flex-wrap">
              {onChange !== undefined &&
                !field.hideCreate &&
                onChange !== undefined && (
                  <CreateItemDrawer
                    listKey={foreignList.key}
                    isDrawerOpen={isDrawerOpen}
                    setIsDrawerOpen={setIsDrawerOpen}
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
};

export const Cell = ({ field, item }) => {
  const list = useList(field.refListKey);

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
};

export const CardValue = ({ field, item }) => {
  const list = useList(field.refListKey);
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
};

export const controller = (config) => {
  const cardsDisplayOptions =
    config.fieldMeta.displayMode === "cards"
      ? {
          cardFields: config.fieldMeta.cardFields,
          inlineCreate: config.fieldMeta.inlineCreate,
          inlineEdit: config.fieldMeta.inlineEdit,
          linkToItem: config.fieldMeta.linkToItem,
          removeMode: config.fieldMeta.removeMode,
          inlineConnect: config.fieldMeta.inlineConnect,
        }
      : undefined;

  const refLabelField = config.fieldMeta.refLabelField;
  const refSearchFields = config.fieldMeta.refSearchFields;

  return {
    refFieldKey: config.fieldMeta.refFieldKey,
    many: config.fieldMeta.many,
    listKey: config.listKey,
    path: config.path,
    label: config.label,
    description: config.description,
    display:
      config.fieldMeta.displayMode === "count" ? "count" : "cards-or-select",
    refLabelField,
    refSearchFields,
    refListKey: config.fieldMeta.refListKey,
    graphqlSelection:
      config.fieldMeta.displayMode === "count"
        ? `${config.path}Count`
        : `${config.path} {
              id
              label: ${refLabelField}
            }`,
    hideCreate: config.fieldMeta.hideCreate,
    defaultValue:
      cardsDisplayOptions !== undefined
        ? {
            kind: "cards-view",
            currentIds: new Set(),
            id: null,
            initialIds: new Set(),
            itemBeingCreated: false,
            itemsBeingEdited: new Set(),
            displayOptions: cardsDisplayOptions,
          }
        : config.fieldMeta.many
          ? {
              id: null,
              kind: "many",
              initialValue: [],
              value: [],
            }
          : { id: null, kind: "one", value: null, initialValue: null },
    deserialize: (data) => {
      if (config.fieldMeta.displayMode === "count") {
        return {
          id: data.id,
          kind: "count",
          count: data[`${config.path}Count`] ?? 0,
        };
      }
      if (cardsDisplayOptions !== undefined) {
        const initialIds = new Set(
          (Array.isArray(data[config.path])
            ? data[config.path]
            : data[config.path]
              ? [data[config.path]]
              : []
          ).map((x) => x.id)
        );
        return {
          kind: "cards-view",
          id: data.id,
          itemsBeingEdited: new Set(),
          itemBeingCreated: false,
          initialIds,
          currentIds: initialIds,
          displayOptions: cardsDisplayOptions,
        };
      }
      if (config.fieldMeta.many) {
        let value = (data[config.path] || []).map((x) => ({
          id: x.id,
          label: x.label || x.id,
        }));
        return {
          kind: "many",
          id: data.id,
          initialValue: value,
          value,
        };
      }
      let value = data[config.path];
      if (value) {
        value = {
          id: value.id,
          label: value.label || value.id,
        };
      }
      return {
        kind: "one",
        id: data.id,
        value,
        initialValue: value,
      };
    },
    validate(value) {
      return (
        value.kind !== "cards-view" ||
        (value.itemsBeingEdited.size === 0 && !value.itemBeingCreated)
      );
    },
    serialize: (state) => {
      if (state.kind === "many") {
        const newAllIds = new Set(state.value.map((x) => x.id));
        const initialIds = new Set(state.initialValue.map((x) => x.id));
        let disconnect = state.initialValue
          .filter((x) => !newAllIds.has(x.id))
          .map((x) => ({ id: x.id }));
        let connect = state.value
          .filter((x) => !initialIds.has(x.id))
          .map((x) => ({ id: x.id }));
        if (disconnect.length || connect.length) {
          let output = {};

          if (disconnect.length) {
            output.disconnect = disconnect;
          }

          if (connect.length) {
            output.connect = connect;
          }

          return {
            [config.path]: output,
          };
        }
      } else if (state.kind === "one") {
        if (state.initialValue && !state.value) {
          return { [config.path]: { disconnect: true } };
        } else if (state.value && state.value.id !== state.initialValue?.id) {
          return {
            [config.path]: {
              connect: {
                id: state.value.id,
              },
            },
          };
        }
      } else if (state.kind === "cards-view") {
        let disconnect = [...state.initialIds]
          .filter((id) => !state.currentIds.has(id))
          .map((id) => ({ id }));
        let connect = [...state.currentIds]
          .filter((id) => !state.initialIds.has(id))
          .map((id) => ({ id }));

        if (config.fieldMeta.many) {
          if (disconnect.length || connect.length) {
            return {
              [config.path]: {
                connect: connect.length ? connect : undefined,
                disconnect: disconnect.length ? disconnect : undefined,
              },
            };
          }
        } else if (connect.length) {
          return {
            [config.path]: {
              connect: connect[0],
            },
          };
        } else if (disconnect.length) {
          return { [config.path]: { disconnect: true } };
        }
      }
      return {};
    },
  };
};
