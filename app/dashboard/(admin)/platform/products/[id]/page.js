"use client";
import copyToClipboard from "clipboard-copy";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { models } from "@keystone/models";
import { getNamesFromList } from "@keystone/utils/getNamesFromList";
import {
  AlertTriangle,
  Save,
  Trash2,
  X,
  Undo2,
  Check,
  CircleAlert,
} from "lucide-react";
import { useList } from "@keystone/keystoneProvider";
import { usePreventNavigation } from "@keystone/utils/usePreventNavigation";
import { gql, useMutation, useQuery } from "@keystone-6/core/admin-ui/apollo";
import {
  deserializeValue,
  makeDataGetter,
  useChangedFieldsAndDataForUpdate,
  useInvalidFields,
} from "@keystone-6/core/admin-ui/utils";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import { CreateButtonLink } from "@keystone/themes/Tailwind/orion/components/CreateButtonLink";
import { FieldLabel } from "@keystone/themes/Tailwind/orion/components/FieldLabel";
import { Fields } from "@keystone/themes/Tailwind/orion/components/Fields";
import { GraphQLErrorNotice } from "@keystone/themes/Tailwind/orion/components/GraphQLErrorNotice";
import { useToasts } from "@keystone/themes/Tailwind/orion/components/Toast";
import { AdminLink } from "@keystone/themes/Tailwind/orion/components/AdminLink";
import { Button } from "@ui/button";
import { LoadingIcon } from "@keystone/themes/Tailwind/orion/components/LoadingIcon";
import { Skeleton } from "@ui/skeleton";
import { basePath } from "@keystone/index";
import { PageBreadcrumbs } from "@keystone/themes/Tailwind/orion/components/PageBreadcrumbs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@ui/dialog";
import { MediaTab } from "./components/MediaTab";

// Add these constants near the top after imports
const tabs = ["General", "Media", "Variants", "Pricing", "Inventory"];
const GENERAL_FIELDS = [
  "title",
  "handle",
  "description",
  "subtitle",
  "isGiftcard",
];
const MEDIA_FIELDS = ["productImages"];
const VARIANTS_FIELDS = ["productVariants", "options"];
const PRICING_FIELDS = [
  "discountable",
  "discountConditions",
  "discountRules",
  "taxRates",
];
const INVENTORY_FIELDS = [
  "weight",
  "length",
  "height",
  "width",
  "hsCode",
  "originCountry",
  "midCode",
  "material",
];
const ORGANIZATION_FIELDS = [
  "status",
  "productCollections",
  "productCategories",
  "productTags",
];

export function ItemPageHeader(props) {
  return (
    <div className="flex">
      <nav className="pb-2 rounded-lg" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <AdminLink
              href="/"
              className="inline-flex items-center text-md font-medium text-zinc-700 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-white"
            >
              <svg
                className="w-3 h-3 mr-2.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
              </svg>
              Home
            </AdminLink>
          </li>

          {props.list.isSingleton ? (
            <h3>{props.list.label}</h3>
          ) : (
            <Fragment>
              <li>
                <div className="flex items-center">
                  <svg
                    className="w-3 h-3 mx-1 text-zinc-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 6 10"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      strokeWidth="2"
                      d="m1 9 4-4-4-4"
                    />
                  </svg>
                  <AdminLink
                    href={`/${props.list.path}`}
                    className="ml-1 text-md font-medium text-zinc-700 hover:text-blue-600 md:ml-2 dark:text-zinc-400 dark:hover:text-white"
                  >
                    {props.list.label}
                  </AdminLink>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="w-3 h-3 mx-1 text-zinc-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 6 10"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      strokeWidth="2"
                      d="m1 9 4-4-4-4"
                    />
                  </svg>
                  <div className="ml-1 text-md font-medium text-zinc-700 hover:text-blue-600 md:ml-2 dark:text-zinc-400 dark:hover:text-white">
                    {props.label}
                  </div>
                </div>
              </li>
            </Fragment>
          )}
        </ol>
      </nav>
    </div>
  );
}

// Core layout components
const ColumnLayout = (props) => (
  <div
    className="items-start grid"
    style={{ gridTemplateColumns: "3fr 0fr" }}
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

// Main Components
const HeaderActions = memo(function HeaderActions({
  showDelete,
  itemLabel,
  itemId,
  list,
  hasChangedFields,
  onSave,
  onReset,
  loading,
}) {
  const toasts = useToasts();
  const router = useRouter();
  const adminPath = basePath;
  const [deleteItem, { loading: deleteLoading }] = useMutation(
    gql`mutation ($id: ID!) {
      ${list.gqlNames.deleteMutationName}(where: { id: $id }) {
        id
      }
    }`,
    { variables: { id: itemId } }
  );

  return (
    <div className="flex items-center gap-2">
      {showDelete && (
        <Dialog>
          <DialogTrigger asChild>
            <Button className="relative pe-12" size="sm" variant="destructive">
              Delete
              <span className="pointer-events-none absolute inset-y-0 end-0 flex w-9 items-center justify-center bg-primary-foreground/15">
                <X
                  className="opacity-60"
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border"
                aria-hidden="true"
              >
                <CircleAlert className="opacity-80" size={16} strokeWidth={2} />
              </div>
              <DialogHeader>
                <DialogTitle className="text-lg line-clamp-3 font-medium opacity-80">
                  Are you sure you want to delete {itemLabel}?
                </DialogTitle>
                <DialogDescription className="mt-1">
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button className="rounded-lg" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                className="rounded-lg"
                variant="destructive"
                disabled={deleteLoading}
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
                    list.isSingleton
                      ? `${adminPath}`
                      : `${adminPath}/${list.path}`
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
      )}
      {hasChangedFields && (
        <Dialog>
          <DialogTrigger asChild>
            <Button className="group relative ps-12" size="sm">
              <span className="pointer-events-none absolute inset-y-0 start-0 flex w-9 items-center justify-center bg-primary-foreground/15">
                <Undo2
                  className="-me-1 ms-2 opacity-60 transition-transform group-hover:-translate-x-0.5"
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </span>
              Reset changes
            </Button>
          </DialogTrigger>
          <DialogContent>
            <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border"
                aria-hidden="true"
              >
                <CircleAlert className="opacity-80" size={16} strokeWidth={2} />
              </div>
              <DialogHeader>
                <DialogTitle>
                  Are you sure you want to reset your changes?
                </DialogTitle>
                <DialogDescription className="mt-1">
                  This action will discard all changes you have made to the
                  item.
                </DialogDescription>
              </DialogHeader>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button className="rounded-lg" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                className="rounded-lg"
                variant="destructive"
                onClick={onReset}
              >
                Reset Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Button
        className="relative pe-12"
        size="sm"
        disabled={!hasChangedFields}
        isLoading={loading}
        onClick={onSave}
      >
        Save changes
        <span className="pointer-events-none absolute inset-y-0 end-0 flex w-9 items-center justify-center bg-primary-foreground/15">
          <Check
            className="opacity-60"
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
        </span>
      </Button>
    </div>
  );
});

// Page Components
export const ItemPage = ({ params }) => {
  const id = params.id;

  return <ItemPageTemplate listKey={"Product"} id={id} />;
};

export const ItemPageTemplate = ({ listKey, id }) => {
  const list = useList(listKey);

  const { query, selectedFields } = useMemo(() => {
    const selectedFields = Object.entries(list.fields)
      .filter(
        ([fieldKey, field]) =>
          field.itemView.fieldMode !== "hidden" || fieldKey === "id"
      )
      .map(([fieldKey]) => {
        return list.fields[fieldKey].controller.graphqlSelection;
      })
      .join("\n");
    return {
      selectedFields,
      query: gql`
        query ItemPage($id: ID!, $listKey: String!) {
          item: ${list.gqlNames.itemQueryName}(where: {id: $id}) {
            ${selectedFields}
          }
          keystone {
            adminMeta {
              list(key: $listKey) {
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
    variables: { id, listKey },
    errorPolicy: "all",
    skip: id === undefined,
  });
  loading ||= id === undefined;

  const dataGetter = makeDataGetter(data, error?.graphQLErrors);

  // Get form state
  const {
    state,
    setValue,
    loading: formLoading,
    error: formError,
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

  const metaQueryErrors = dataGetter.get("keystone").errors;

  const handleValueChange = useCallback(
    (value) => {
      setValue((state) => ({
        item: state.item,
        value: value(state.value),
      }));
    },
    [setValue]
  );

  // Add these state variables inside ItemPageTemplate before the useMemo
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverStyle, setHoverStyle] = useState({});
  const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" });
  const tabRefs = useRef([]);

  // Add these effects before the return statement
  useEffect(() => {
    if (hoveredIndex !== null) {
      const hoveredElement = tabRefs.current[hoveredIndex];
      if (hoveredElement) {
        const { offsetLeft, offsetWidth } = hoveredElement;
        setHoverStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    }
  }, [hoveredIndex]);

  useEffect(() => {
    const activeElement = tabRefs.current[activeIndex];
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement;
      setActiveStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      });
    }
  }, [activeIndex]);

  // Add this helper function before renderTabContent
  const getFieldsSubset = (fieldKeys) => {
    const fields = {};
    fieldKeys.forEach((key) => {
      if (list.fields[key]) {
        fields[key] = list.fields[key];
      }
    });
    return fields;
  };

  // Update the renderTabContent function
  const renderTabContent = () => {
    if (data?.item == null) {
      return (
        <div>
          {error?.graphQLErrors.length || error?.networkError ? (
            <GraphQLErrorNotice
              errors={error?.graphQLErrors}
              networkError={error?.networkError}
            />
          ) : list.isSingleton ? (
            id === "1" ? (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertTitle>System Error</AlertTitle>
                  <AlertDescription>
                    {list.label} doesn't exist or you don't have access to it.
                  </AlertDescription>
                </Alert>
                {!data.keystone.adminMeta.list.hideCreate && (
                  <CreateButtonLink list={list} />
                )}
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertTitle>System Error</AlertTitle>
                <AlertDescription>
                  The item with id "{id}" does not exist
                </AlertDescription>
              </Alert>
            )
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4 stroke-red-900 dark:stroke-red-500" />
              <AlertTitle>System Error</AlertTitle>
              <AlertDescription>
                The item with id "{id}" could not be found or you don't have
                access to it.
              </AlertDescription>
            </Alert>
          )}
        </div>
      );
    }

    switch (activeIndex) {
      case 0:
        return (
          <Fields
            fields={getFieldsSubset(GENERAL_FIELDS)}
            value={state.value}
            onChange={handleValueChange}
            forceValidation={forceValidation}
            invalidFields={invalidFields}
          />
        );
      case 1:
        return (
          <MediaTab
            fields={getFieldsSubset(MEDIA_FIELDS)}
            value={state.value}
            onChange={handleValueChange}
            forceValidation={forceValidation}
            invalidFields={invalidFields}
          />
        );
      case 2:
        return (
          <Fields
            fields={getFieldsSubset(VARIANTS_FIELDS)}
            value={state.value}
            onChange={handleValueChange}
            forceValidation={forceValidation}
            invalidFields={invalidFields}
          />
        );
      case 3:
        return (
          <Fields
            fields={getFieldsSubset(PRICING_FIELDS)}
            value={state.value}
            onChange={handleValueChange}
            forceValidation={forceValidation}
            invalidFields={invalidFields}
          />
        );
      case 4:
        return (
          <Fields
            fields={getFieldsSubset(INVENTORY_FIELDS)}
            value={state.value}
            onChange={handleValueChange}
            forceValidation={forceValidation}
            invalidFields={invalidFields}
          />
        );
      default:
        return null;
    }
  };

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
            type: "model",
            label: list.label,
            href: `/${list.path}`,
            showModelSwitcher: true,
          },
          {
            type: "page",
            label: loading
              ? "Loading..."
              : data?.item?.[list.labelField] || data?.item?.id || id,
          },
        ]}
        actions={
          data?.item && (
            <HeaderActions
              showDelete={!data.keystone.adminMeta.list.hideDelete}
              itemLabel={data.item[list.labelField] || data.item.id}
              itemId={data.item.id}
              list={list}
              hasChangedFields={!!changedFields?.size}
              onSave={onSave}
              onReset={onReset}
              loading={formLoading}
            />
          )
        }
      />
      <main className="w-full max-w-[90rem] mx-auto p-4 md:p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex-col items-center">
            <h1 className="text-lg font-semibold md:text-2xl">
              {loading ? (
                <Skeleton className="ml-3 h-7 w-[150px]" />
              ) : (
                data?.item?.[list.labelField] || data?.item?.id || id
              )}
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage product details, variants, and more
            </p>
          </div>
        </div>

        {loading ? null : metaQueryErrors ? (
          <div>
            <Alert variant="destructive">{metaQueryErrors[0].message}</Alert>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="border rounded-lg shadow-sm bg-background">
                <div className="border-b px-1">
                  <div className="relative">
                    {/* Hover Highlight */}
                    <div
                      className="absolute h-[28px] mt-1 transition-all duration-300 ease-out bg-muted/60 rounded-[6px] flex items-center"
                      style={{
                        ...hoverStyle,
                        opacity: hoveredIndex !== null ? 1 : 0,
                      }}
                    />

                    {/* Active Indicator */}
                    <div
                      className="absolute bottom-[-1px] h-[2px] bg-foreground transition-all duration-300 ease-out"
                      style={activeStyle}
                    />

                    {/* Tabs */}
                    <div className="relative flex space-x-[6px] items-center">
                      {tabs.map((tab, index) => (
                        <div
                          key={index}
                          ref={(el) => (tabRefs.current[index] = el)}
                          className={`px-3 py-2 cursor-pointer transition-colors duration-300 ${
                            index === activeIndex
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          onClick={() => setActiveIndex(index)}
                        >
                          <div className="text-sm font-medium leading-5 whitespace-nowrap flex items-center justify-center h-full">
                            {tab}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-4">{renderTabContent()}</div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-lg border bg-background shadow-sm">
                <div className="flex items-center justify-between border-b p-4">
                  <div className="space-y-0.5">
                    <h2 className="text-base font-medium">Organization</h2>
                    <p className="text-muted-foreground text-sm">
                      Manage product organization and collections
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <Fields
                    fields={getFieldsSubset(ORGANIZATION_FIELDS)}
                    value={state.value}
                    onChange={handleValueChange}
                    forceValidation={forceValidation}
                    invalidFields={invalidFields}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default ItemPage;
