import { Fragment, useEffect, useRef, useState } from "react";
import { forwardRefWithAs } from "@keystone/utils/forwardRefWithAs";
import { useItemState } from "@keystone/utils/useItemState";
import { gql, useApolloClient } from "@keystone-6/core/admin-ui/apollo";
import { useKeystone, useList } from "@keystone/keystoneProvider";
import {
  getRootGraphQLFieldsFromFieldController,
  makeDataGetter,
} from "@keystone-6/core/admin-ui/utils";
import { cn } from "@keystone/utils/cn";
import { LoadingIcon } from "@keystone/themes/Tailwind/orion/components/LoadingIcon";
import { InlineEdit } from "../InlineEdit";
import { InlineCreate } from "../InlineCreate";
import { RelationshipSelect } from "@keystone/themes/Tailwind/orion/components/RelationshipSelect";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@keystone/themes/Tailwind/orion/primitives/default/ui/tooltip";
import { AdminLink } from "@keystone/themes/Tailwind/orion/components/AdminLink";
import { Button } from "@ui/button";
import { FieldContainer } from "@keystone/themes/Tailwind/orion/components/FieldContainer";
import { FieldLabel } from "@keystone/themes/Tailwind/orion/components/FieldLabel";
import { FieldLegend } from "@keystone/themes/Tailwind/orion/components/FieldLegend";
import { FieldDescription } from "@keystone/themes/Tailwind/orion/components/FieldDescription";
import { CreateItemDrawer } from "@keystone/themes/Tailwind/orion/components/CreateItemDrawer";

const CardContainer = forwardRefWithAs(({ mode = "view", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        `relative before:content-[' '] before:rounded-xl before:w-1 before:h-full before:absolute before:left-0 before:top-0 before:bottom-0 before:z-10`,
        // mode === "create" ? "before:bg-emerald-500" : "before:bg-blue-500"
      )}
      {...props}
    />
  );
});

export function Cards({
  localList,
  field,
  foreignList,
  id,
  value,
  onChange,
  forceValidation,
}) {
  const { displayOptions } = value;
  let selectedFields = [
    ...new Set([
      ...displayOptions.cardFields,
      ...(displayOptions.inlineEdit?.fields || []),
    ]),
  ]
    .map((fieldPath) => {
      return foreignList.fields[fieldPath].controller.graphqlSelection;
    })
    .join("\n");
  if (!displayOptions.cardFields.includes("id")) {
    selectedFields += "\nid";
  }
  if (
    !displayOptions.cardFields.includes(foreignList.labelField) &&
    foreignList.labelField !== "id"
  ) {
    selectedFields += `\n${foreignList.labelField}`;
  }

  const {
    items,
    setItems,
    state: itemsState,
  } = useItemState({
    selectedFields,
    localList,
    id,
    field,
  });

  const client = useApolloClient();

  const [isLoadingLazyItems, setIsLoadingLazyItems] = useState(false);
  const [showConnectItems, setShowConnectItems] = useState(false);
  const [hideConnectItemsLabel, setHideConnectItemsLabel] = useState("Cancel");
  const editRef = useRef(null);

  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  });

  if (itemsState.kind === "loading") {
    return null;
  }
  if (itemsState.kind === "error") {
    return (
      <span className="text-red-600 dark:text-red-500 text-sm">
        {itemsState.message}
      </span>
    );
  }

  const currentIdsArrayWithFetchedItems = [...value.currentIds]
    .map((id) => ({ itemGetter: items[id], id }))
    .filter((x) => x.itemGetter);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Inline Create */}
        <div>
          <CardContainer mode="create">
            <InlineCreate
              selectedFields={selectedFields}
              fields={displayOptions.inlineCreate.fields}
              list={foreignList}
              onCancel={() => {
                onChange({ ...value, itemBeingCreated: false });
              }}
              onCreate={(itemGetter) => {
                const id = itemGetter.data.id;
                setItems({ ...items, [id]: itemGetter });
                onChange({
                  ...value,
                  itemBeingCreated: false,
                  currentIds: field.many
                    ? new Set([...value.currentIds, id])
                    : new Set([id]),
                });
                setTimeout(() => {
                  onChange({
                    ...value,
                    itemBeingCreated: true,
                    currentIds: field.many
                      ? new Set([...value.currentIds, id])
                      : new Set([id]),
                  });
                }, 0);
              }}
            />
          </CardContainer>
        </div>

        {/* Inline Edit */}
        {currentIdsArrayWithFetchedItems.map(({ id, itemGetter }, index) => (
          <div key={id}>
            <CardContainer mode="edit">
              <InlineEdit
                list={foreignList}
                fields={displayOptions.inlineEdit.fields}
                onSave={(newItemGetter) => {
                  setItems({
                    ...items,
                    [id]: newItemGetter,
                  });
                }}
                selectedFields={selectedFields}
                itemGetter={itemGetter}
                onCancel={() => {}}
              />
            </CardContainer>
          </div>
        ))}
      </div>

      {/* Connect Items Section */}
      {onChange === undefined ? null : displayOptions.inlineConnect &&
        showConnectItems ? (
        <CardContainer mode="edit">
          <div className="flex gap-1 flex-col flex-wrap w-full">
            <RelationshipSelect
              autoFocus
              controlShouldRenderValue={isLoadingLazyItems}
              isDisabled={onChange === undefined}
              list={foreignList}
              labelField={field.refLabelField}
              searchFields={field.refSearchFields}
              isLoading={isLoadingLazyItems}
              placeholder={`Select a ${foreignList.singular}`}
              portalMenu
              state={{
                kind: "many",
                async onChange(options) {
                  const itemsToFetchAndConnect = [];
                  options.forEach((item) => {
                    if (!value.currentIds.has(item.id)) {
                      itemsToFetchAndConnect.push(item.id);
                    }
                  });
                  if (itemsToFetchAndConnect.length) {
                    try {
                      const { data, errors } = await client.query({
                        query: gql`query ($ids: [ID!]!) {
                      items: ${foreignList.gqlNames.listQueryName}(where: { id: { in: $ids }}) {
                        ${selectedFields}
                      }
                    }`,
                        variables: { ids: itemsToFetchAndConnect },
                      });
                      if (isMountedRef.current) {
                        const dataGetters = makeDataGetter(data, errors);
                        const itemsDataGetter = dataGetters.get("items");
                        let newItems = { ...items };
                        let newCurrentIds = field.many
                          ? new Set(value.currentIds)
                          : new Set();
                        if (Array.isArray(itemsDataGetter.data)) {
                          itemsDataGetter.data.forEach((item, i) => {
                            if (item?.id != null) {
                              newCurrentIds.add(item.id);
                              newItems[item.id] = itemsDataGetter.get(i);
                            }
                          });
                        }
                        if (newCurrentIds.size) {
                          setItems(newItems);
                          onChange({
                            ...value,
                            currentIds: newCurrentIds,
                            itemsBeingEdited: new Set(),
                            itemBeingCreated: false
                          });
                          setHideConnectItemsLabel("Done");
                        }
                      }
                    } finally {
                      if (isMountedRef.current) {
                        setIsLoadingLazyItems(false);
                      }
                    }
                  }
                },
                value: (() => {
                  let options = [];
                  Object.keys(items).forEach((id) => {
                    if (value.currentIds.has(id)) {
                      options.push({ id, label: id });
                    }
                  });
                  return options;
                })(),
              }}
            />
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowConnectItems(false)}
              >
                {hideConnectItemsLabel}
              </Button>
            </div>
          </div>
        </CardContainer>
      ) : null}
      {forceValidation && (
        <span className="text-red-600 dark:text-red-500 text-sm">
          You must finish creating and editing any related{" "}
          {foreignList.label.toLowerCase()} before saving the{" "}
          {localList.singular.toLowerCase()}
        </span>
      )}
    </div>
  );
}
