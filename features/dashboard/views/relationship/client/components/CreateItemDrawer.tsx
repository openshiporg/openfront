import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Fields } from "@/features/dashboard/components/Fields";
import { useInvalidFields } from "@/features/dashboard/utils/useInvalidFields";

interface CreateItemDrawerProps {
  listKey: string;
  list: any;
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: Record<string, unknown>) => void;
}

export function CreateItemDrawer({ listKey, list, isOpen, onClose, onCreate }: CreateItemDrawerProps) {
  const [value, setValue] = useState(() => {
    const result: Record<string, unknown> = {};
    
    // Initialize with default values from field controllers
    Object.keys(list.fields).forEach(fieldKey => {
      const field = list.fields[fieldKey];
      if (field.controller?.defaultValue !== undefined) {
        result[fieldKey] = field.controller.defaultValue;
      }
    });
    
    return result;
  });

  const [forceValidation, setForceValidation] = useState(false);

  // Get fields that can be created (not read-only, not hidden)
  const createFields = useMemo(() => {
    const result: Record<string, any> = {};
    
    Object.entries(list.fields).forEach(([fieldKey, field]) => {
      const createView = (field as any).views?.Cell || (field as any).itemView;
      const fieldMode = createView?.fieldMode || 'edit';
      
      // Only include fields that can be edited
      if (fieldMode === 'edit') {
        result[fieldKey] = field;
      }
    });
    
    return result;
  }, [list.fields]);

  // Get validation state - use simplified version since we don't have isRequireds here
  const invalidFields = useInvalidFields(createFields, value, {});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setForceValidation(true);
    
    // Check if there are any invalid fields
    if (invalidFields.size > 0) {
      return;
    }

    // Create the "built" item data that matches Keystone's pattern
    const builtItemData: Record<string, unknown> = {};
    
    // Serialize each field value using its controller
    Object.entries(createFields).forEach(([fieldKey, field]) => {
      const fieldValue = value[fieldKey];
      if (field.controller?.serialize && fieldValue !== undefined) {
        try {
          const serialized = field.controller.serialize(fieldValue);
          Object.assign(builtItemData, serialized);
        } catch (error) {
          console.error(`Error serializing field ${fieldKey}:`, error);
        }
      }
    });

    onCreate(builtItemData);
    onClose();
  };

  const handleCancel = () => {
    // Reset form state
    setValue(() => {
      const result: Record<string, unknown> = {};
      Object.keys(list.fields).forEach(fieldKey => {
        const field = list.fields[fieldKey];
        if (field.controller?.defaultValue !== undefined) {
          result[fieldKey] = field.controller.defaultValue;
        }
      });
      return result;
    });
    setForceValidation(false);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DrawerContent className="max-h-[80vh]">
        <form onSubmit={onSubmit}>
          <DrawerHeader>
            <DrawerTitle>Add {list.singular}</DrawerTitle>
            <DrawerDescription>
              Create a new {list.singular.toLowerCase()}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 overflow-y-auto flex-1">
            <Fields
              list={list}
              fields={createFields}
              value={value}
              onChange={setValue}
              forceValidation={forceValidation}
              invalidFields={invalidFields}
            />
          </div>

          <DrawerFooter>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Add {list.singular}
              </Button>
            </div>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}