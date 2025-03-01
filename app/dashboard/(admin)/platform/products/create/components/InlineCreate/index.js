import { useState, useCallback } from "react";
import isDeepEqual from "fast-deep-equal";
import { useFieldsObj } from "@keystone/utils/useFieldObj";
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import {
  makeDataGetter,
  useInvalidFields,
  serializeValueToObjByFieldKey,
} from "@keystone-6/core/admin-ui/utils";
import { Button } from "@ui/button";
import { GraphQLErrorNotice } from "@keystone/themes/Tailwind/orion/components/GraphQLErrorNotice";
import { useToasts } from "@keystone/themes/Tailwind/orion/components/Toast";
import { CustomFields } from "../CustomFields";
import * as ImageView from "../views/Image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/dialog";
import { Plus } from "lucide-react";
import { cn } from "@keystone/utils/cn";

export function InlineCreate({
  list,
  onCancel,
  onCreate,
  fields: fieldPaths,
  selectedFields,
}) {
  const toasts = useToasts();
  const fields = useFieldsObj(list, fieldPaths);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Define custom views for specific fields
  const fieldViews = {
    image: {
      ...ImageView,
      Field: ({ autoFocus, field, value, onChange }) => (
        <ImageView.Field
          autoFocus={autoFocus}
          field={field}
          value={value}
          onChange={onChange}
        />
      ),
    },
  };

  const [createItem, { loading, error }] = useMutation(
    gql`mutation($data: ${list.gqlNames.createInputName}!) {
      item: ${list.gqlNames.createMutationName}(data: $data) {
        ${selectedFields}
    }
  }`
  );

  const [value, setValue] = useState(() => {
    const value = {};
    Object.keys(fields).forEach((fieldPath) => {
      value[fieldPath] = {
        kind: "value",
        value: fields[fieldPath].controller.defaultValue,
      };
    });
    return value;
  });

  const invalidFields = useInvalidFields(fields, value);
  const [forceValidation, setForceValidation] = useState(false);

  const resetForm = useCallback(() => {
    const newValue = {};
    Object.keys(fields).forEach((fieldPath) => {
      newValue[fieldPath] = {
        kind: "value",
        value: fields[fieldPath].controller.defaultValue,
      };
    });
    setValue(newValue);
    setForceValidation(false);
  }, [fields]);

  const handleCancel = () => {
    setCreateDialogOpen(false);
    onCancel();
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const newForceValidation = invalidFields.size !== 0;
    setForceValidation(newForceValidation);

    if (newForceValidation) return;
    const data = {};
    const allSerializedValues = serializeValueToObjByFieldKey(fields, value);
    Object.keys(allSerializedValues).forEach((fieldPath) => {
      const { controller } = fields[fieldPath];
      const serialized = allSerializedValues[fieldPath];
      if (
        !isDeepEqual(serialized, controller.serialize(controller.defaultValue))
      ) {
        Object.assign(data, serialized);
      }
    });

    createItem({
      variables: {
        data,
      },
    })
      .then(({ data, errors }) => {
        const error = errors?.find((x) => x.path?.length === 1);
        if (error) {
          toasts.addToast({
            title: "Failed to create item",
            tone: "negative",
            message: error.message,
          });
        } else {
          toasts.addToast({
            title: data.item[list.labelField] || data.item.id,
            tone: "positive",
            message: "Saved successfully",
          });
          onCreate(makeDataGetter(data, errors).get("item"));
          resetForm();
          setCreateDialogOpen(false);
        }
      })
      .catch((err) => {
        toasts.addToast({
          title: "Failed to update item",
          tone: "negative",
          message: err.message,
        });
      });
  };

  return (
    <>
      <div
        onClick={() => setCreateDialogOpen(true)}
        className={cn(
          "bg-foreground/5 group relative aspect-square overflow-hidden rounded-md",
          "border-2 border-dashed border-muted-foreground/25",
          "hover:border-muted-foreground/50 transition-colors cursor-pointer"
        )}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground group-hover:text-muted-foreground/80">
          <Plus className="h-8 w-8" />
          <p className="text-sm font-medium">Add image</p>
        </div>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit}>
            <div className="space-y-4">
              {error && (
                <GraphQLErrorNotice
                  networkError={error?.networkError}
                  errors={error?.graphQLErrors}
                />
              )}
              <CustomFields
                fields={fields}
                forceValidation={forceValidation}
                invalidFields={invalidFields}
                onChange={setValue}
                value={value}
                // fieldViews={fieldViews}
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
                <Button disabled={loading} size="sm" type="submit">
                  Create {list.singular}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
} 