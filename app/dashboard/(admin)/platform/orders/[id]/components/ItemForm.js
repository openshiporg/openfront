"use client";

import React, { useCallback, useMemo, useState } from "react";
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { makeDataGetter } from "@keystone-6/core/admin-ui/utils";
import { useList } from "@keystone/keystoneProvider";
import { usePreventNavigation } from "@keystone/utils/usePreventNavigation";
import { deserializeValue, useChangedFieldsAndDataForUpdate, useInvalidFields } from "@keystone-6/core/admin-ui/utils";
import { GraphQLErrorNotice } from "@keystone/themes/Tailwind/orion/components/GraphQLErrorNotice";
import { useToasts } from "@keystone/themes/Tailwind/orion/components/Toast";
import { Button } from "@ui/button";
import { Fields } from "./Fields";
import { Toolbar } from "./Toolbar";

export function ItemForm({
  listKey,
  itemGetter,
  selectedFields,
  fieldModes,
  fieldPositions,
  showDelete,
  item,
}) {
  const list = useList(listKey);

  const [update, { loading, error, data }] = useMutation(
    gql`mutation ($data: ${list.gqlNames.updateInputName}!, $id: ID!) {
      item: ${list.gqlNames.updateMutationName}(where: { id: $id }, data: $data) {
        ${selectedFields}
      }
    }`,
    { errorPolicy: "all" }
  );

  itemGetter = useMemo(() => {
    if (data) {
      return makeDataGetter(data, error?.graphQLErrors).get("item");
    }
  }, [data, error]) ?? itemGetter;

  const [state, setValue] = useState(() => {
    const value = deserializeValue(list.fields, itemGetter);
    return { value, item: itemGetter };
  });

  const onChange = useCallback((value) => {
    setValue(state => ({
      item: state.item,
      value: value
    }));
  }, []);

  if (
    !loading &&
    state.item.data !== itemGetter.data &&
    (itemGetter.errors || []).every((x) => x.path?.length !== 1)
  ) {
    const value = deserializeValue(list.fields, itemGetter);
    setValue({ value, item: itemGetter });
  }

  const { changedFields, dataForUpdate } = useChangedFieldsAndDataForUpdate(
    list.fields,
    state.item,
    state.value
  );

  const invalidFields = useInvalidFields(list.fields, state.value);
  const [forceValidation, setForceValidation] = useState(false);
  const toasts = useToasts();

  const onSave = useCallback(() => {
    const newForceValidation = invalidFields.size !== 0;
    setForceValidation(newForceValidation);
    if (newForceValidation) return;

    update({
      variables: { data: dataForUpdate, id: state.item.get("id").data },
    })
      .then(({ errors }) => {
        const error = errors?.find(
          (x) => x.path === undefined || x.path?.length === 1
        );
        if (error) {
          toasts.addToast({
            title: "Failed to update order",
            tone: "negative",
            message: error.message,
          });
        } else {
          toasts.addToast({
            tone: "positive",
            title: "Order updated successfully",
          });
        }
      })
      .catch((err) => {
        toasts.addToast({
          title: "Failed to update order",
          tone: "negative",
          message: err.message,
        });
      });
  }, [update, state.item, dataForUpdate, invalidFields, toasts]);

  const hasChangedFields = !!changedFields.size;
  usePreventNavigation(
    useMemo(() => ({ current: hasChangedFields }), [hasChangedFields])
  );

  return (
    <div className="flex">
      <div className="flex-1">
        <GraphQLErrorNotice
          networkError={error?.networkError}
          errors={error?.graphQLErrors.filter((x) => x.path?.length === 1)}
        />
        <Fields
          fields={list.fields}
          fieldModes={fieldModes}
          fieldPositions={fieldPositions}
          forceValidation={forceValidation}
          invalidFields={invalidFields}
          onChange={onChange}
          value={state.value}
          item={item}
        />
        <Toolbar
          onSave={onSave}
          hasChangedFields={hasChangedFields}
          onReset={useCallback(() => {
            setValue((state) => ({
              item: state.item,
              value: deserializeValue(list.fields, state.item),
            }));
          }, [list.fields])}
          loading={loading}
        />
      </div>
    </div>
  );
} 