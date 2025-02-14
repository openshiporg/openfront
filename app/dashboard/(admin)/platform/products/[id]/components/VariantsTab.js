import { useList } from "@keystone/keystoneProvider";
import { useCreateItem } from "@keystone/utils/useCreateItem";

export function VariantsTab({ value, onChange, forceValidation, invalidFields }) {
  const optionList = useList("ProductOption");
  const variantList = useList("ProductVariant");
  const { props: oProps } = useCreateItem(optionList);
  const { props: vProps } = useCreateItem(variantList);

  return (
    <div className="space-y-6">
      <h3>Variants Tab Debug</h3>
              <div>
        <h4>Product Options & Variants:</h4>
        <pre className="p-4 bg-muted/40 rounded-lg overflow-auto">
          {JSON.stringify({
            optionFields: optionList.fields,
            variantFields: variantList.fields,
            currentOptions: value?.productOptions,
            currentVariants: value?.productVariants,
            optionCreateProps: oProps,
            variantCreateProps: vProps
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
