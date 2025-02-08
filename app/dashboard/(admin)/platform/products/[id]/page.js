"use client";

import { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gql, useMutation, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { makeDataGetter, deserializeValue, useChangedFieldsAndDataForUpdate, useInvalidFields } from "@keystone-6/core/admin-ui/utils";
import { useList } from "@keystone/keystoneProvider";
import { AlertTriangle, Save, Trash2, Settings, Layers } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { Button } from "@ui/button";
import { GraphQLErrorNotice } from "@keystone/themes/Tailwind/orion/components/GraphQLErrorNotice";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@ui/card";
import { PageBreadcrumbs } from "@keystone/themes/Tailwind/orion/components/PageBreadcrumbs";
import { Fields } from "@keystone/themes/Tailwind/orion/components/Fields";
import { FieldLabel } from "@keystone/themes/Tailwind/orion/components/FieldLabel";
import { useToasts } from "@keystone/themes/Tailwind/orion/components/Toast";
import { usePreventNavigation } from "@keystone/utils/usePreventNavigation";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@ui/dialog";
import { basePath } from "@keystone/index";
import { Badge } from "@ui/badge";
import { cn } from "@keystone/utils/cn";
import { MediaTab } from "../create/components/MediaTab";
import { VariantsTab } from "../create/components/VariantsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
import { getFilteredProps } from "../create/components/MediaTab";
import { UpdateMediaTab } from "./components/UpdateMediaTab";
import { UpdateVariantsTab } from "./components/UpdateVariantsTab";
import { CustomFields } from "./components/CustomFields";
import * as CustomTextView from "./components/views/Text";

// Core layout components
const ColumnLayout = (props) => (
  <div
    className="items-start grid"
    style={{ gridTemplateColumns: "2fr 1fr" }}
    {...props}
  />
);

const StickySidebar = (props) => (
  <div className="hidden lg:block mb-20 sticky top-8" {...props} />
);

const BaseToolbar = (props) => (
  <div className="-mb-4 md:-mb-6 shadow-sm bottom-0 border border-b-0 flex flex-wrap justify-between p-2 rounded-t-xl sticky z-20 mt-5 bg-background gap-2">
    {props.children}
  </div>
);

// Field groupings
const STATUS_FIELDS = [
  { key: "status" },
];

const GENERAL_FIELDS = [
  { key: "title" },
  { key: "handle" },
  { key: "description" },
  { key: "subtitle" },
  { key: "isGiftcard" },
];

const MEDIA_FIELDS = [
  { key: "productImages" },
];

const ORGANIZATION_FIELDS = [
  { key: "status" },
  { key: "productCollections", fieldMeta: { hideButtons: true } },
  { key: "productCategories", fieldMeta: { hideButtons: true } },
  { key: "productTags", fieldMeta: { hideButtons: true } },
];

// Define custom components mapping at the top level
const customComponents = {
  title: CustomTextView.Field,
  handle: CustomTextView.Field,
  description: CustomTextView.Field,
  subtitle: CustomTextView.Field,
};

// Utility hook
function useEventCallback(callback) {
  const callbackRef = useRef(callback);
  const cb = useCallback((...args) => {
    return callbackRef.current(...args);
  }, []);
  useEffect(() => {
    callbackRef.current = callback;
  });
  return cb;
}

// UI Components
const ItemFormFields = memo(function ItemFormFields({
  list,
  fields,
  fieldModes,
  fieldPositions,
  forceValidation,
  invalidFields,
  value,
  onChange,
  position,
}) {
  return (
    <Fields
      groups={list.groups}
      fieldModes={fieldModes}
      fields={fields}
      forceValidation={forceValidation}
      invalidFields={invalidFields}
      position={position}
      fieldPositions={fieldPositions}
      onChange={onChange}
      value={value}
    />
  );
});

const ItemFormContent = memo(function ItemFormContent({
  list,
  item,
  error,
  fieldModes,
  fieldPositions,
  forceValidation,
  invalidFields,
  value,
  onChange,
}) {
  return (
    <ColumnLayout>
      <div className="flex-1">
        <GraphQLErrorNotice
          networkError={error?.networkError}
          errors={error?.graphQLErrors?.filter((x) => x.path?.length === 1)}
        />
        <ItemFormFields
          list={list}
          fields={list.fields}
          fieldModes={fieldModes}
          fieldPositions={fieldPositions}
          forceValidation={forceValidation}
          invalidFields={invalidFields}
          value={value}
          onChange={onChange}
          position="form"
        />
      </div>
      <StickySidebar>
        <div className="ml-4 w-72 flex flex-col gap-1.5">
          <FieldLabel>Item ID</FieldLabel>
          <code className="py-[9px] border flex px-4 items-center relative rounded-md shadow-sm bg-muted/40 font-mono text-sm font-medium">
            {item.id}
          </code>
        </div>
        <div>
          <ItemFormFields
            list={list}
            fields={list.fields}
            fieldModes={fieldModes}
            fieldPositions={fieldPositions}
            forceValidation={forceValidation}
            invalidFields={invalidFields}
            value={value}
            onChange={onChange}
            position="sidebar"
          />
        </div>
      </StickySidebar>
    </ColumnLayout>
  );
});

// Logic Components
function useItemState(list, itemGetter) {
  const [state, setValue] = useState(() => ({
    value: deserializeValue(list.fields, itemGetter),
    item: itemGetter,
  }));

  if (
    itemGetter &&
    state.item.data !== itemGetter.data &&
    (itemGetter.errors || []).every((x) => x.path?.length !== 1)
  ) {
    const value = deserializeValue(list.fields, itemGetter);
    setValue({ value, item: itemGetter });
  }

  return [state, setValue];
}

function useItemForm({ list, selectedFields, itemGetter }) {
  const toasts = useToasts();
  const [state, setValue] = useItemState(list, itemGetter);

  const [update, { loading, error, data }] = useMutation(
    gql`mutation ($data: ${list.gqlNames.updateInputName}!, $id: ID!) {
      item: ${list.gqlNames.updateMutationName}(where: { id: $id }, data: $data) {
        ${selectedFields}
      }
    }`,
    { errorPolicy: "all" }
  );

  const { changedFields, dataForUpdate } = useChangedFieldsAndDataForUpdate(
    list.fields,
    state.item,
    state.value
  );

  const invalidFields = useInvalidFields(list.fields, state.value);
  const [forceValidation, setForceValidation] = useState(false);

  const onSave = useEventCallback(() => {
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
            title: "Failed to update item",
            tone: "negative",
            message: error.message,
          });
        } else {
          toasts.addToast({
            tone: "positive",
            title: "Saved successfully",
          });
        }
      })
      .catch((err) => {
        toasts.addToast({
          title: "Failed to update item",
          tone: "negative",
          message: err.message,
        });
      });
  });

  const onReset = useEventCallback(() => {
    setValue((state) => ({
      item: state.item,
      value: deserializeValue(list.fields, state.item),
    }));
  });

  usePreventNavigation(
    useMemo(() => ({ current: !!changedFields.size }), [changedFields.size])
  );

  return {
    state,
    setValue,
    loading,
    error,
    forceValidation,
    invalidFields,
    changedFields,
    onSave,
    onReset,
  };
}

function DeleteButton({ itemLabel, itemId, list }) {
  const toasts = useToasts();
  const [deleteItem, { loading }] = useMutation(
    gql`mutation ($id: ID!) {
      ${list.gqlNames.deleteMutationName}(where: { id: $id }) {
        id
      }
    }`,
    { variables: { id: itemId } }
  );
  const router = useRouter();
  const adminPath = basePath;

  return (
    <Fragment>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive" className="rounded-t-[calc(theme(borderRadius.lg)-1px)]">
            <Trash2 className="md:mr-2" />
            <span className="hidden md:inline">Delete</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Confirmation</DialogTitle>
          </DialogHeader>
          <text className="text-sm">
            Are you sure you want to delete <strong>{itemLabel}</strong>?
          </text>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button
              variant="destructive"
              isLoading={loading}
              onClick={async () => {
                try {
                  await deleteItem();
                } catch (err) {
                  return toasts.addToast({
                    title: `Failed to delete ${list.singular} item: ${itemLabel}`,
                    message: err.message,
                    tone: "negative",
                  });
                }
                router.push(
                  list.isSingleton ? `${adminPath}` : `${adminPath}/${list.path}`
                );
                return toasts.addToast({
                  title: itemLabel,
                  message: `Deleted ${list.singular} item successfully`,
                  tone: "positive",
                });
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}

const Toolbar = memo(function Toolbar({
  hasChangedFields,
  loading,
  onSave,
  onReset,
  deleteButton,
}) {
  return (
    <BaseToolbar>
      <div className="flex items-center gap-2">
        {deleteButton}
        {hasChangedFields ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-t-[calc(theme(borderRadius.lg)-1px)]">
                <span className="md:hidden"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg></span>
                <span className="hidden md:inline">Reset changes</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Reset Confirmation</DialogTitle>
              </DialogHeader>
              <text className="text-sm">
                Are you sure you want to reset changes?
              </text>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
                <Button variant="destructive" onClick={onReset}>
                  Reset Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <text className="font-medium px-5 text-sm hidden md:block">No changes</text>
        )}
      </div>
      <Button
        disabled={!hasChangedFields}
        isLoading={loading}
        onClick={onSave}
        className="rounded-t-[calc(theme(borderRadius.lg)-1px)]"
      >
        <Save className="md:mr-2" />
        <span className="hidden md:inline">Save changes</span>
      </Button>
    </BaseToolbar>
  );
});

export default function ProductPage({ params }) {
  const list = useList("Product");
  const [activeTab, setActiveTab] = useState("general");

  const { query, selectedFields } = useMemo(() => {
    const selectedFields = Object.entries(list.fields)
      .filter(
        ([fieldKey, field]) =>
          field.itemView.fieldMode !== "hidden" ||
          // the id field is hidden but we still need to fetch it
          fieldKey === "id"
      )
      .map(([fieldKey]) => {
        return list.fields[fieldKey].controller.graphqlSelection;
      })
      .join("\n");
    return {
      selectedFields,
      query: gql`
        query ItemPage($id: ID!) {
          item: ${list.gqlNames.itemQueryName}(where: {id: $id}) {
            ${selectedFields}
          }
          keystone {
            adminMeta {
              list(key: "Product") {
                hideCreate
                hideDelete
                fields {
                  path
                  itemView(id: $id) {
                    fieldMode
                    fieldPosition
                  }
                }
              }
            }
          }
        }
      `,
    };
  }, [list]);

  let { data, error, loading } = useQuery(query, {
    variables: { id: params.id },
    errorPolicy: "all",
    skip: params.id === undefined,
  });
  loading ||= params.id === undefined;

  const dataGetter = makeDataGetter(data, error?.graphQLErrors);

  const itemViewFieldModesByField = useMemo(() => {
    const itemViewFieldModesByField = {};
    dataGetter.data?.keystone?.adminMeta?.list?.fields?.forEach((field) => {
      if (
        field === null ||
        field.path === null ||
        field?.itemView?.fieldMode == null
      )
        return;
      itemViewFieldModesByField[field.path] = field.itemView.fieldMode;
    });
    return itemViewFieldModesByField;
  }, [dataGetter.data?.keystone?.adminMeta?.list?.fields]);

  const itemViewFieldPositionsByField = useMemo(() => {
    const itemViewFieldPositionsByField = {};
    dataGetter.data?.keystone?.adminMeta?.list?.fields?.forEach((field) => {
      if (
        field === null ||
        field.path === null ||
        field?.itemView?.fieldPosition == null
      )
        return;
      itemViewFieldPositionsByField[field.path] = field.itemView.fieldPosition;
    });
    return itemViewFieldPositionsByField;
  }, [dataGetter.data?.keystone?.adminMeta?.list?.fields]);

  const {
    state,
    setValue,
    loading: updateLoading,
    error: updateError,
    forceValidation,
    invalidFields,
    changedFields,
    onSave,
    onReset,
  } = useItemForm({
    list,
    selectedFields,
    itemGetter: dataGetter.get("item"),
  });

  const handleFieldChange = useCallback(
    (value) => {
      setValue((state) => ({
        item: state.item,
        value: typeof value === 'function' ? value(state.value) : value,
      }));
    },
    [setValue]
  );

  // Create base props for all fields
  const baseProps = useMemo(() => ({
    fields: list.fields,
    groups: list.groups || [],
    fieldModes: itemViewFieldModesByField,
    fieldPositions: itemViewFieldPositionsByField,
    value: state.value,
    onChange: handleFieldChange,
  }), [list.fields, list.groups, itemViewFieldModesByField, itemViewFieldPositionsByField, state.value, handleFieldChange]);

  // Get filtered props for each section
  const statusProps = useMemo(() => {
    return getFilteredProps(baseProps, STATUS_FIELDS);
  }, [baseProps]);

  const generalProps = useMemo(() => {
    return getFilteredProps(baseProps, GENERAL_FIELDS);
  }, [baseProps]);

  const mediaProps = useMemo(() => {
    return getFilteredProps(baseProps, MEDIA_FIELDS);
  }, [baseProps]);

  const organizationProps = useMemo(() => {
    return getFilteredProps(baseProps, ORGANIZATION_FIELDS);
  }, [baseProps]);

  if (loading) return null;
  if (error?.graphQLErrors.length || error?.networkError) {
    return (
      <GraphQLErrorNotice
        errors={error?.graphQLErrors}
        networkError={error?.networkError}
      />
    );
  }

  const product = data?.item;
  if (!product) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Not Found</AlertTitle>
        <AlertDescription>
          Product not found or you don&apos;t have access.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <PageBreadcrumbs
        items={[
          {
            type: "link",
            label: "Dashboard",
            href: "/",
          },
          {
            type: "page",
            label: "Platform",
            showModelSwitcher: true,
            switcherType: "platform",
          },
          {
            type: "link",
            label: "Products",
            href: "/platform/products",
          },
          {
            type: "page",
            label: product.title,
          },
        ]}
      />
      <main className="w-full max-w-4xl mx-auto p-4 md:p-6 flex flex-col gap-4">
        <div className="flex-col items-center">
          <h1 className="flex text-lg font-semibold md:text-2xl">
            Manage {product.title || product.id}
          </h1>
          <p className="text-muted-foreground">
            Update or delete this product
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* General Info Card */}
            <Card className="bg-muted/10">
              <CardHeader className="flex flex-row items-center justify-between p-4 pb-0">
                <CardTitle className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                  General Information
                </CardTitle>
              </CardHeader>
              <div className="p-4">
                <CustomFields
                  {...generalProps}
                  value={state.value}
                  forceValidation={forceValidation}
                  invalidFields={invalidFields}
                  onChange={handleFieldChange}
                  customComponents={customComponents}
                />
              </div>
            </Card>

            {/* Media Card */}
            <Card className="bg-muted/10">
              <CardHeader className="flex flex-row items-center justify-between p-4 pb-0">
                <CardTitle className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                  Media
                </CardTitle>
              </CardHeader>
              <div className="p-4">
                <UpdateMediaTab 
                  {...baseProps}
                  forceValidation={forceValidation}
                  invalidFields={invalidFields}
                />
              </div>
            </Card>

            {/* Variants Card */}
            <Card className="bg-muted/10">
              <CardHeader className="flex flex-row items-center justify-between p-4 pb-0">
                <CardTitle className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                  Variants
                </CardTitle>
              </CardHeader>
              <div className="p-4">
                <UpdateVariantsTab 
                  {...baseProps}
                  forceValidation={forceValidation}
                  invalidFields={invalidFields}
                />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Organization Card */}
            <Card className="bg-muted/10">
              <CardHeader className="flex flex-row items-center justify-between p-4 pb-0">
                <CardTitle className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                  Organization
                </CardTitle>
              </CardHeader>
              <div className="p-4">
                <Fields
                  {...organizationProps}
                  value={state.value}
                  forceValidation={forceValidation}
                  invalidFields={invalidFields}
                  onChange={handleFieldChange}
                />
              </div>
            </Card>
          </div>
        </div>

        <Toolbar
          hasChangedFields={!!changedFields.size}
          loading={updateLoading}
          onSave={onSave}
          onReset={onReset}
          deleteButton={
            !data.keystone.adminMeta.list.hideDelete ? (
              <DeleteButton
                list={list}
                itemLabel={product[list.labelField] ?? product.id}
                itemId={product.id}
              />
            ) : undefined
          }
        />
      </main>
    </>
  );
} 