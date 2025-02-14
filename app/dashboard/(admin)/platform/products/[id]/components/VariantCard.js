import { Button } from "@ui/button";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
import { Input } from "@ui/input";
import { VariantForm } from "./VariantsTab";
import { cn } from "@keystone/utils/cn";
import { Label } from "@keystone/themes/Tailwind/orion/primitives/default/ui/label";

export function VariantCard({
  variant,
  onUpdate,
  onDelete,
  showActions = true,
  showTitle = false,
  renderOptionValue = (ov) => (
    <div
      className="uppercase rounded-md border text-[.65rem] py-[.0625rem] px-1.5 font-medium bg-cyan-50 text-cyan-700 border-cyan-600/20 dark:bg-cyan-500/10"
    >
      <span className="opacity-80 mr-1">{ov.option}:</span>
      {ov.label}
    </div>
  ),
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentVariant, setCurrentVariant] = useState(variant);

  const handleSave = () => {
    onUpdate(currentVariant);
    setIsOpen(false);
  };

  return (
    <div className="border rounded-lg bg-muted/40 p-4 group relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {(showTitle || variant.optionValues?.length > 0) && (
            <h4 className="text-sm font-medium">
              {showTitle ? (variant.title || "Default Variant") : variant.title}
            </h4>
          )}
          {variant.optionValues?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {variant.optionValues.map((ov, i) => (
                <div key={i}>{renderOptionValue(ov)}</div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-5 w-5 [&_svg]:size-3"
              >
                <MoreHorizontal />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <VariantForm
                variant={currentVariant}
                onChange={setCurrentVariant}
                onSave={handleSave}
                onCancel={() => setIsOpen(false)}
              />
            </PopoverContent>
          </Popover>
          {showActions && onDelete && (
            <Button
              variant="outline"
              size="icon"
              className="h-5 w-5 [&_svg]:size-3"
              onClick={onDelete}
            >
              <Trash2 />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        <div className="space-y-0.5">
          <div className="text-[.65rem] font-medium text-muted-foreground uppercase tracking-wider">
            SKU
          </div>
          <div className="text-sm tabular-nums">{variant.sku || "-"}</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[.65rem] font-medium text-muted-foreground uppercase tracking-wider">
            Stock
          </div>
          <div className="text-sm tabular-nums font-medium">
            {variant.inventoryQuantity || "0"}
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[.65rem] font-medium text-muted-foreground uppercase tracking-wider">
            Barcode
          </div>
          <div className="text-sm tabular-nums">{variant.barcode || "-"}</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[.65rem] font-medium text-muted-foreground uppercase tracking-wider">
            Price
          </div>
          <div className="text-sm tabular-nums font-medium">
            ${variant.price || "0"}
          </div>
        </div>
      </div>
    </div>
  );
}
