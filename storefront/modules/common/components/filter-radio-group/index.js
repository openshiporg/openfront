import { EllipseMiniSolid } from "@medusajs/icons"
import { Label, RadioGroup, Text, clx } from "@medusajs/ui"

const FilterRadioGroup = ({
  title,
  items,
  value,
  handleChange
}) => {
  return (
    <div className="flex gap-x-3 flex-col gap-y-3">
      <Text className="txt-compact-small-plus text-ui-fg-muted">{title}</Text>
      <RadioGroup>
        {items?.map((i) => (
          <div
            key={i.value}
            className={clx("flex gap-x-2 items-center", {
              "ml-[-1.75rem]": i.value === value,
            })}>
            {i.value === value && <EllipseMiniSolid />}
            <RadioGroup.Item
              checked={i.value === value}
              onClick={(e) =>
                handleChange(e, i.value)
              }
              className="hidden peer"
              id={i.value}
              value={i.value} />
            <Label
              placeholder={i.label}
              htmlFor={i.value}
              className={clx(
                "!txt-compact-small !transform-none text-ui-fg-subtle hover:cursor-pointer",
                {
                  "text-ui-fg-base": i.value === value,
                }
              )}>
              {i.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

export default FilterRadioGroup
