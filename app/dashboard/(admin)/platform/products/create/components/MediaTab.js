import { CustomFields } from "./CustomFields";
import * as RelationshipView from "./views/Relationship";

export function MediaTab({
  fields,
  value,
  onChange,
  forceValidation,
  invalidFields,
}) {
  // Define custom views for specific fields by path
  const fieldViews = {
    productImages: RelationshipView,
  };

  return (
    <CustomFields
      fields={fields}
      value={value}
      onChange={onChange}
      forceValidation={forceValidation}
      invalidFields={invalidFields}
      fieldViews={fieldViews}
    />
  );
}
