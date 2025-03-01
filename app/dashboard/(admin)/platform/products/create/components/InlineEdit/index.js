import { useCallback, useState } from "react";
import { useFieldsObj } from "@keystone/utils/useFieldObj";
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import {
  deserializeValue,
  useInvalidFields,
  useChangedFieldsAndDataForUpdate,
  makeDataGetter,
} from "@keystone-6/core/admin-ui/utils";
import { Button } from "@ui/button";
import { useToasts } from "@keystone/themes/Tailwind/orion/components/Toast";
import { GraphQLErrorNotice } from "@keystone/themes/Tailwind/orion/components/GraphQLErrorNotice";
import { CustomFields } from "../CustomFields";
import { MoreHorizontal, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/dialog";
import Image from "next/image";
import { FieldContainer } from "@keystone/themes/Tailwind/orion/components/FieldContainer";
import { FieldLabel } from "@keystone/themes/Tailwind/orion/components/FieldLabel";
import { cn } from "@keystone/utils/cn";

const PlaceholderSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" fill="none" className="w-full h-full">
    <rect width="1200" height="1200" fill="#EAEAEA" rx="3"/>
    <g opacity=".5">
      <g opacity=".5">
        <path fill="#FAFAFA" d="M600.709 736.5c-75.454 0-136.621-61.167-136.621-136.62 0-75.454 61.167-136.621 136.621-136.621 75.453 0 136.62 61.167 136.62 136.621 0 75.453-61.167 136.62-136.62 136.62Z"/>
        <path stroke="#C9C9C9" strokeWidth="2.418" d="M600.709 736.5c-75.454 0-136.621-61.167-136.621-136.62 0-75.454 61.167-136.621 136.621-136.621 75.453 0 136.62 61.167 136.62 136.621 0 75.453-61.167 136.62-136.62 136.62Z"/>
      </g>
      <path stroke="url(#a)" strokeWidth="2.418" d="M0-1.209h553.581" transform="scale(1 -1) rotate(45 1163.11 91.165)"/>
      <path stroke="url(#b)" strokeWidth="2.418" d="M404.846 598.671h391.726"/>
      <path stroke="url(#c)" strokeWidth="2.418" d="M599.5 795.742V404.017"/>
      <path stroke="url(#d)" strokeWidth="2.418" d="m795.717 796.597-391.441-391.44"/>
      <path fill="#fff" d="M600.709 656.704c-31.384 0-56.825-25.441-56.825-56.824 0-31.384 25.441-56.825 56.825-56.825 31.383 0 56.824 25.441 56.824 56.825 0 31.383-25.441 56.824-56.824 56.824Z"/>
      <g clipPath="url(#e)">
        <path fill="#666" fillRule="evenodd" d="M616.426 586.58h-31.434v16.176l3.553-3.554.531-.531h9.068l.074-.074 8.463-8.463h2.565l7.18 7.181V586.58Zm-15.715 14.654 3.698 3.699 1.283 1.282-2.565 2.565-1.282-1.283-5.2-5.199h-6.066l-5.514 5.514-.073.073v2.876a2.418 2.418 0 0 0 2.418 2.418h26.598a2.418 2.418 0 0 0 2.418-2.418v-8.317l-8.463-8.463-7.181 7.181-.071.072Zm-19.347 5.442v4.085a6.045 6.045 0 0 0 6.046 6.045h26.598a6.044 6.044 0 0 0 6.045-6.045v-7.108l1.356-1.355-1.282-1.283-.074-.073v-17.989h-38.689v23.43l-.146.146.146.147Z" clipRule="evenodd"/>
      </g>
      <path stroke="#C9C9C9" strokeWidth="2.418" d="M600.709 656.704c-31.384 0-56.825-25.441-56.825-56.824 0-31.384 25.441-56.825 56.825-56.825 31.383 0 56.824 25.441 56.824 56.825 0 31.383-25.441 56.824-56.824 56.824Z"/>
    </g>
    <defs>
      <linearGradient id="a" x1="554.061" x2="-.48" y1=".083" y2=".087" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C9C9C9" stopOpacity="0"/>
        <stop offset=".208" stopColor="#C9C9C9"/>
        <stop offset=".792" stopColor="#C9C9C9"/>
        <stop offset="1" stopColor="#C9C9C9" stopOpacity="0"/>
      </linearGradient>
      <linearGradient id="b" x1="796.912" x2="404.507" y1="599.963" y2="599.965" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C9C9C9" stopOpacity="0"/>
        <stop offset=".208" stopColor="#C9C9C9"/>
        <stop offset=".792" stopColor="#C9C9C9"/>
        <stop offset="1" stopColor="#C9C9C9" stopOpacity="0"/>
      </linearGradient>
      <linearGradient id="c" x1="600.792" x2="600.794" y1="403.677" y2="796.082" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C9C9C9" stopOpacity="0"/>
        <stop offset=".208" stopColor="#C9C9C9"/>
        <stop offset=".792" stopColor="#C9C9C9"/>
        <stop offset="1" stopColor="#C9C9C9" stopOpacity="0"/>
      </linearGradient>
      <linearGradient id="d" x1="404.85" x2="796.972" y1="403.903" y2="796.02" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C9C9C9" stopOpacity="0"/>
        <stop offset=".208" stopColor="#C9C9C9"/>
        <stop offset=".792" stopColor="#C9C9C9"/>
        <stop offset="1" stopColor="#C9C9C9" stopOpacity="0"/>
      </linearGradient>
      <clipPath id="e">
        <path fill="#fff" d="M581.364 580.535h38.689v38.689h-38.689z"/>
      </clipPath>
    </defs>
  </svg>
);

export function InlineEdit({
  fields,
  list,
  selectedFields,
  itemGetter,
  onCancel,
  onSave,
}) {
  const fieldsObj = useFieldsObj(list, fields);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);

  const [update, { loading, error }] = useMutation(
    gql`mutation ($data: ${list.gqlNames.updateInputName}!, $id: ID!) {
        item: ${list.gqlNames.updateMutationName}(where: { id: $id }, data: $data) {
          ${selectedFields}
        }
      }`,
    { errorPolicy: "all" }
  );

  const [state, setValue] = useState(() => {
    const value = deserializeValue(fieldsObj, itemGetter);
    return { value, item: itemGetter.data };
  });

  if (
    state.item !== itemGetter.data &&
    itemGetter.errors?.every((x) => x.path?.length !== 1)
  ) {
    const value = deserializeValue(fieldsObj, itemGetter);
    setValue({ value, item: itemGetter.data });
  }

  const { changedFields, dataForUpdate } = useChangedFieldsAndDataForUpdate(
    fieldsObj,
    itemGetter,
    state.value
  );

  const invalidFields = useInvalidFields(fieldsObj, state.value);
  const [forceValidation, setForceValidation] = useState(false);
  const toasts = useToasts();

  // Get the image field value
  const imageField = Object.entries(fieldsObj).find(([key]) =>
    key.toLowerCase().includes("image")
  );
  const imageValue = imageField ? state.value[imageField[0]].value : null;

  // Get the alt text value
  const altText = state.value.altText?.kind === "value" 
    ? state.value.altText.value?.kind === "update"
      ? state.value.altText.value.inner.value
      : state.value.altText.value
    : "";

  const handleValueChange = useCallback(
    (value) => {
      setValue((state) => ({
        item: state.item,
        value: value(state.value),
      }));
    },
    [setValue]
  );

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditDialogOpen(false);
    onCancel();
  };

  const hasChanges = changedFields.size > 0;

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!hasChanges) {
            onCancel();
            return;
          }
          const newForceValidation = invalidFields.size !== 0;
          setForceValidation(newForceValidation);
          if (newForceValidation) return;

          update({
            variables: {
              data: dataForUpdate,
              id: itemGetter.get("id").data,
            },
          })
            .then(({ data, errors }) => {
              const error = errors?.find((x) => x.path?.length === 1);
              if (error) {
                toasts.addToast({
                  title: "Failed to update item",
                  tone: "negative",
                  message: error.message,
                });
              } else {
                toasts.addToast({
                  title: data.item[list.labelField] || data.item.id,
                  tone: "positive",
                  message: "Saved successfully",
                });
                onSave(makeDataGetter(data, errors).get("item"));
              }
            })
            .catch((err) => {
              toasts.addToast({
                title: "Failed to update item",
                tone: "negative",
                message: err.message,
              });
            });
        }}
      >
        <div className="space-y-10">
          {error && (
            <GraphQLErrorNotice
              networkError={error?.networkError}
              errors={error?.graphQLErrors.filter((x) => x.path?.length === 1)}
            />
          )}

          {imageField && (
            <FieldContainer>
              <div className="group relative aspect-square overflow-hidden rounded-md border bg-muted">
                {imageValue?.kind === "from-server" && imageValue.data?.src ? (
                  <Image
                    src={imageValue.data.src}
                    alt={imageValue.data.filename || "Product image"}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    onError={(e) => {
                      e.target.parentElement.replaceChild(PlaceholderSVG(), e.target);
                    }}
                  />
                ) : state.value.imagePath.value.inner.value ? (
                  <Image
                    src={state.value.imagePath.value.inner.value}
                    alt={altText}
                    className="object-cover"
                    fill
                  />
                ) : (
                  <PlaceholderSVG />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 flex justify-between items-center">
                  <div className="flex flex-col">
                    {/* <p className="truncate text-xs text-white">
                      {imageValue?.kind === "from-server" && imageValue.data?.filename 
                        ? imageValue.data.filename 
                        : imageValue?.kind === "upload" && imageValue.data?.file?.name
                        ? imageValue.data.file.name
                        : "No image"}
                    </p> */}
                    <p className="truncate text-xs text-background">
                      {altText || "No alt text"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    className="[&_svg]:size-3 w-5 h-5"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditingField(imageField[1]);
                      setEditDialogOpen(true);
                    }}
                  >
                    <MoreHorizontal />
                  </Button>
                </div>
              </div>
            </FieldContainer>
          )}
        </div>
      </form>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (changedFields.size === 0) {
                onCancel();
                return;
              }
              const newForceValidation = invalidFields.size !== 0;
              setForceValidation(newForceValidation);
              if (newForceValidation) return;

              update({
                variables: {
                  data: dataForUpdate,
                  id: itemGetter.get("id").data,
                },
              })
                .then(({ data, errors }) => {
                  const error = errors?.find((x) => x.path?.length === 1);
                  if (error) {
                    toasts.addToast({
                      title: "Failed to update item",
                      tone: "negative",
                      message: error.message,
                    });
                  } else {
                    toasts.addToast({
                      title: data.item[list.labelField] || data.item.id,
                      tone: "positive",
                      message: "Saved successfully",
                    });
                    onSave(makeDataGetter(data, errors).get("item"));
                    setEditDialogOpen(false);
                  }
                })
                .catch((err) => {
                  toasts.addToast({
                    title: "Failed to update item",
                    tone: "negative",
                    message: err.message,
                  });
                });
            }}
          >
            <div className="space-y-10">
              {error && (
                <GraphQLErrorNotice
                  networkError={error?.networkError}
                  errors={error?.graphQLErrors.filter(
                    (x) => x.path?.length === 1
                  )}
                />
              )}
              <CustomFields
                fields={fieldsObj}
                forceValidation={forceValidation}
                invalidFields={invalidFields}
                onChange={handleValueChange}
                value={state.value}
              />
              <div className="flex gap-1 flex-wrap justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button disabled={loading || !hasChanges} size="sm" type="submit">
                  Save
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
