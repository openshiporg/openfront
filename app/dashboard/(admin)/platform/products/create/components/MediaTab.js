import { useList } from "@keystone/keystoneProvider";
import { Fields } from "@keystone/themes/Tailwind/orion/components/Fields";
import { useCreateItem } from "@keystone/utils/useCreateItem";
import { useMemo } from "react";

export function getFilteredProps(props, modifications, defaultCollapse) {
    const fieldKeysToShow = modifications.map((mod) => mod.key);
    const breakGroups = modifications.reduce((acc, mod) => {
      if (mod.breakGroup) {
        acc.push(mod.breakGroup);
      }
      return acc;
    }, []);
  
    const newFieldModes = { ...props.fieldModes };
  
    Object.keys(props.fields).forEach((key) => {
      if (!fieldKeysToShow.includes(key)) {
        newFieldModes[key] = "hidden";
      } else {
        newFieldModes[key] = props.fieldModes[key] || "edit";
      }
    });
  
    const updatedFields = Object.keys(props.fields).reduce((obj, key) => {
      const modification = modifications.find((mod) => mod.key === key);
      if (modification) {
        obj[key] = {
          ...props.fields[key],
          fieldMeta: {
            ...props.fields[key].fieldMeta,
            ...modification.fieldMeta,
          },
        };
      } else {
        obj[key] = props.fields[key];
      }
      return obj;
    }, {});
  
    const reorderedFields = modifications.reduce((obj, mod) => {
      obj[mod.key] = updatedFields[mod.key];
      return obj;
    }, {});
  
    const updatedGroups = props.groups.map((group) => {
      if (breakGroups.includes(group.label)) {
        return {
          ...group,
          fields: group.fields.filter(
            (field) => !fieldKeysToShow.includes(field.path)
          ),
        };
      }
      return {
        ...group,
        collapsed: defaultCollapse,
      };
    });
  
    return {
      ...props,
      fields: reorderedFields,
      fieldModes: newFieldModes,
      groups: updatedGroups,
    };
  }

export function MediaTab() {
  const list = useList("ProductImage");
  const { create, props, state, error } = useCreateItem(list);

  const filteredProps = useMemo(() => {
    const modifications = [
      { key: "image" },
    ];
    return getFilteredProps(props, modifications);
  }, [props]);


  return (
    <div className="space-y-6">
      <Fields {...filteredProps} />
    </div>
  );
}
