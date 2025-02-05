import { useState, useRef, useEffect, useMemo } from "react";
import { useList } from "@keystone/keystoneProvider";
import { Button } from "@ui/button";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  AlertCircle,
  Info,
  Check,
  X,
  MoreHorizontal,
  Settings,
  Layers,
} from "lucide-react";
import { useCreateItem } from "@keystone/utils/useCreateItem";
import { Input } from "@ui/input";
import { Badge } from "@ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@ui/collapsible";
import { MultipleSelector } from "@ui/multi-select";
import { Switch } from "@ui/switch";
import { Alert, AlertDescription } from "@ui/alert";
import { Label } from "@ui/label";
import { Card, CardHeader, CardDescription, CardContent } from "@ui/card";
import { cn } from "@keystone/utils/cn";
import { Checkbox } from "@ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@ui/pagination";
import { OptionButton } from "./OptionButton";
import { OptionCard } from "./OptionCard";
import { AddOptionPopover } from "./AddOptionPopover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { useId } from "react";
import { VariantCard } from "./VariantCard";

const statusColors = {
  draft: "bg-muted/40 text-muted-foreground border-muted-foreground/20",
  published:
    "bg-green-50 text-green-700 border-green-600/20 dark:bg-green-500/10",
  archived:
    "bg-yellow-50 text-yellow-700 border-yellow-600/20 dark:bg-yellow-500/10",
};

const NumberInput = ({
  value,
  onChange,
  label,
  unit = "",
  min = 0,
  className,
}) => (
  <div className="space-y-1">
    <Label className="text-xs">{label}</Label>
    <div className="relative inline-flex h-8 w-full items-center overflow-hidden whitespace-nowrap rounded-md border border-input text-sm shadow-sm">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        className={cn(
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          "grow bg-background px-2 py-1 text-left tabular-nums text-foreground focus:outline-none border-0 text-sm",
          className
        )}
      />
      {unit && (
        <span className="pr-2 text-muted-foreground text-sm">{unit}</span>
      )}
      <div className="flex flex-col -mt-px -mr-px">
        <Button
          size="icon"
          variant="ghost"
          className="[&_svg]:size-4 flex h-1/2 w-5 items-center justify-center border border-input bg-background text-muted-foreground/80 hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50 rounded-none"
          onClick={() => {
            const currentValue = parseFloat(value) || 0;
            onChange((currentValue + 1).toString());
          }}
        >
          <ChevronUp strokeWidth={2} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="[&_svg]:size-4 -mt-px flex h-1/2 w-5 items-center justify-center border border-input bg-background text-muted-foreground/80 hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50 rounded-none"
          onClick={() => {
            const currentValue = parseFloat(value) || 0;
            if (currentValue > min) {
              onChange((currentValue - 1).toString());
            }
          }}
        >
          <ChevronDown strokeWidth={2} />
        </Button>
      </div>
    </div>
  </div>
);

export const VariantForm = ({ variant, onChange, onSave, onCancel }) => (
  <div className="flex flex-col">
    <div>
      <div className="p-2 border-b">
        <h3 className="font-medium text-sm mb-1">Add Custom Option</h3>
        <p className="text-muted-foreground text-xs">
          Create a new option type for your product
        </p>
      </div>
      <div className="space-y-2">
        <div className="grid gap-3 h-72 overflow-y-auto p-2">
          <div>
            <Label className="text-xs">SKU</Label>
            <Input
              value={variant.sku}
              onChange={(e) => onChange({ ...variant, sku: e.target.value })}
              placeholder="SKU-123"
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Barcode</Label>
            <Input
              value={variant.barcode}
              onChange={(e) =>
                onChange({ ...variant, barcode: e.target.value })
              }
              placeholder="123456789"
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">EAN</Label>
            <Input
              value={variant.ean}
              onChange={(e) => onChange({ ...variant, ean: e.target.value })}
              placeholder="1234567890123"
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">UPC</Label>
            <Input
              value={variant.upc}
              onChange={(e) => onChange({ ...variant, upc: e.target.value })}
              placeholder="123456789012"
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <NumberInput
              label="Price"
              value={variant.price}
              onChange={(val) =>
                onChange({ ...variant, price: parseFloat(val) })
              }
              unit="USD"
            />
          </div>
          <div>
            <NumberInput
              label="Stock"
              value={variant.inventoryQuantity}
              onChange={(val) =>
                onChange({ ...variant, inventoryQuantity: parseInt(val) })
              }
            />
          </div>
          <div>
            <Label className="text-xs">HS Code</Label>
            <Input
              value={variant.hsCode}
              onChange={(e) => onChange({ ...variant, hsCode: e.target.value })}
              placeholder="Enter HS code"
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Country of Origin</Label>
            <Input
              value={variant.originCountry}
              onChange={(e) =>
                onChange({ ...variant, originCountry: e.target.value })
              }
              placeholder="US"
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">MID Code</Label>
            <Input
              value={variant.midCode}
              onChange={(e) =>
                onChange({ ...variant, midCode: e.target.value })
              }
              placeholder="Enter MID code"
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Material</Label>
            <Input
              value={variant.material}
              onChange={(e) =>
                onChange({ ...variant, material: e.target.value })
              }
              placeholder="Cotton, Polyester, etc."
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <NumberInput
              label="Weight"
              value={variant.weight}
              onChange={(val) =>
                onChange({ ...variant, weight: parseInt(val) })
              }
              unit="g"
            />
          </div>
          <div>
            <NumberInput
              label="Length"
              value={variant.length}
              onChange={(val) =>
                onChange({ ...variant, length: parseInt(val) })
              }
              unit="cm"
            />
          </div>
          <div>
            <NumberInput
              label="Height"
              value={variant.height}
              onChange={(val) =>
                onChange({ ...variant, height: parseInt(val) })
              }
              unit="cm"
            />
          </div>
          <div>
            <NumberInput
              label="Width"
              value={variant.width}
              onChange={(val) => onChange({ ...variant, width: parseInt(val) })}
              unit="cm"
            />
          </div>
          <div className="col-span-full flex items-center space-x-2">
            <Checkbox
              id="manage-inventory"
              checked={variant.manageInventory}
              onCheckedChange={(checked) =>
                onChange({ ...variant, manageInventory: checked })
              }
            />
            <Label htmlFor="manage-inventory" className="text-xs">
              Track quantity
            </Label>
          </div>
          <div className="col-span-full flex items-center space-x-2">
            <Checkbox
              id="allow-backorder"
              checked={variant.allowBackorder}
              onCheckedChange={(checked) =>
                onChange({ ...variant, allowBackorder: checked })
              }
            />
            <Label htmlFor="allow-backorder" className="text-xs">
              Continue selling when out of stock
            </Label>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 p-2 border-t">
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={onSave}>
          Save
        </Button>
      </div>
    </div>
  </div>
);

const defaultOptions = [
  { id: "size", label: "Size", values: ["XS", "S", "M", "L", "XL", "2XL"] },
  {
    id: "color",
    label: "Color",
    values: ["Black", "White", "Navy", "Gray", "Red", "Green", "Blue"],
  },
];

const transitionProps = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.5,
};

export function VariantsTab(props) {
  const optionList = useList("ProductOption");
  const variantList = useList("ProductVariant");
  const { props: oProps } = useCreateItem(optionList);
  const { props: vProps } = useCreateItem(variantList);

  const [hasVariants, setHasVariants] = useState(false);
  const [options, setOptions] = useState([]);
  const [variants, setVariants] = useState([]);
  const [showOptionForm, setShowOptionForm] = useState(false);
  const [newOptionTitle, setNewOptionTitle] = useState("");
  const [expandedOption, setExpandedOption] = useState(null);

  // Single variant state (for products without options)
  const [singleVariant, setSingleVariant] = useState({
    title: "",
    sku: "",
    barcode: "",
    ean: "",
    upc: "",
    price: 0,
    inventoryQuantity: 0,
    manageInventory: true,
    allowBackorder: false,
    hsCode: "",
    originCountry: "",
    midCode: "",
    material: "",
    weight: 0,
    length: 0,
    height: 0,
    width: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const itemsPerPage = 5;

  const filteredVariants = variants.filter((variant) => {
    if (selectedFilters.length === 0) return true;
    return selectedFilters.every((filter) =>
      variant.optionValues.some(
        (ov) => ov.option === filter.option && ov.value === filter.value
      )
    );
  });

  const paginatedVariants = filteredVariants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterClick = (option, value) => {
    const filterExists = selectedFilters.some(
      (f) => f.option === option && f.value === value
    );

    if (filterExists) {
      setSelectedFilters(
        selectedFilters.filter(
          (f) => !(f.option === option && f.value === value)
        )
      );
    } else {
      setSelectedFilters([...selectedFilters, { option, value }]);
    }
    setCurrentPage(1);
  };

  // Function to generate variants based on options
  const generateVariants = (options) => {
    if (options.length === 0) return [];

    const generateCombinations = (arrays) => {
      if (arrays.length === 0) return [[]];
      const result = [];
      const restCombinations = generateCombinations(arrays.slice(1));
      arrays[0].forEach((item) => {
        restCombinations.forEach((combination) => {
          result.push([item, ...combination]);
        });
      });
      return result;
    };

    const optionValues = options.map((option) =>
      option.values.map((v) => ({ value: v.value || v, label: v.label || v }))
    );
    const combinations = generateCombinations(optionValues);

    return combinations.map((combination) => {
      const title = combination.map((c) => c.label).join(" / ");
      const optionValuePairs = combination.map((value, index) => ({
        option: options[index].title,
        value: value.value,
        label: value.label,
      }));

      return {
        title,
        sku: "",
        barcode: "",
        ean: "",
        upc: "",
        price: 0,
        inventoryQuantity: 0,
        manageInventory: true,
        allowBackorder: false,
        hsCode: "",
        originCountry: "",
        midCode: "",
        material: "",
        weight: 0,
        length: 0,
        height: 0,
        width: 0,
        optionValues: optionValuePairs,
      };
    });
  };

  const handleAddOption = () => {
    if (!newOptionTitle.trim()) return;

    const newOption = {
      title: newOptionTitle,
      id: newOptionTitle.toLowerCase().replace(/\s+/g, "-"),
      values: [],
      label: newOptionTitle,
    };

    const updatedOptions = [...options, newOption];
    setOptions(updatedOptions);
    setNewOptionTitle("");
    setIsAddOptionOpen(false);
  };

  const isOptionSelected = (optionId) => {
    return options.some((o) => o.id === optionId);
  };

  const handleOptionValuesChange = (index, values) => {
    const updatedOptions = [...options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      values: values,
    };
    setOptions(updatedOptions);

    // Regenerate variants when options change
    const newVariants = generateVariants(updatedOptions);
    setVariants(newVariants);
  };

  const handleRemoveOption = (index) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);

    // Regenerate variants when options change
    const newVariants = generateVariants(updatedOptions);
    setVariants(newVariants);
  };

  // Sort options to show selected ones first, then suggested ones, then custom ones
  const sortedOptions = useMemo(() => {
    const selectedOptionIds = options.map((o) => o.id);

    // First, get all selected options (both default and custom) in the order they were selected
    const selected = [...options];

    // Then, get unselected default options
    const unselectedDefaults = defaultOptions.filter(
      (option) => !selectedOptionIds.includes(option.id)
    );

    return [...selected, ...unselectedDefaults];
  }, [options]);

  // Use the same sorting for option cards - they should match the order of selected options exactly
  const sortedOptionCards = useMemo(() => {
    return [...options];
  }, [options]);

  const VariantFormPopover = ({ variant, index, onUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentVariant, setCurrentVariant] = useState(variant);

    const handleSave = () => {
      onUpdate(currentVariant);
      setIsOpen(false);
    };

    useEffect(() => {
      setCurrentVariant(variant);
    }, [variant]);

    return (
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
    );
  };

  const [isAddOptionOpen, setIsAddOptionOpen] = useState(false);

  const id = useId();
  const filteredVariantsCount = filteredVariants.length;
  const totalOptionsCount = options.length;

  const [showBulkEditForm, setShowBulkEditForm] = useState(false);
  const [bulkEditValues, setBulkEditValues] = useState({
    price: 0,
    inventoryQuantity: 0,
    manageInventory: true,
    allowBackorder: false,
    sku: "",
    barcode: "",
    ean: "",
    upc: "",
    hsCode: "",
    originCountry: "",
    midCode: "",
    material: "",
    weight: 0,
    length: 0,
    height: 0,
    width: 0,
  });

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg border bg-muted/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge
              className={cn(
                "border text-[.65rem] py-0.5 px-1.5 font-medium ",
                hasVariants ? statusColors.published : statusColors.draft
              )}
            >
              {hasVariants ? "VARIANTS" : "SINGLE"}
            </Badge>
            <Label htmlFor="has-variants" className="font-medium">
              {hasVariants ? "Multiple Products" : "One Product"}
            </Label>
          </div>
          <Switch
            id="has-variants"
            checked={hasVariants}
            onCheckedChange={setHasVariants}
          />
        </div>
        <div className="text-muted-foreground text-sm">
          {hasVariants
            ? "This product has multiple options like different sizes, colors, or materials"
            : "This product has a single variant with no options"}
        </div>
      </div>

      <div className="space-y-4">
        {!hasVariants ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-medium text-sm">Product Variant</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 [&_svg]:size-3"
                    onClick={() => setShowSingleVariantForm(true)}
                  >
                    <MoreHorizontal />
                  </Button>
                </div>
                <p className="text-muted-foreground text-xs mt-1">
                  Configure the properties for your single product variant
                </p>
              </div>
            </div>
            <VariantCard
              variant={singleVariant}
              onUpdate={setSingleVariant}
              showActions={false}
              showTitle
            />
          </div>
        ) : (
          <>
            <div className="lg:hidden space-y-2 mb-4">
              <Label htmlFor={id}>View</Label>
              <Select
                defaultValue="options"
                onValueChange={(value) => setActiveTab(value)}
              >
                <SelectTrigger
                  id={id}
                  className="h-auto ps-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2"
                >
                  <SelectValue placeholder="Choose view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="options">
                    <span className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <span>
                        <span className="block font-medium">Options</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {totalOptionsCount} option
                          {totalOptionsCount !== 1 ? "s" : ""}
                        </span>
                      </span>
                    </span>
                  </SelectItem>
                  <SelectItem value="variants">
                    <span className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      <span>
                        <span className="block font-medium">Variants</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {filteredVariantsCount} variant
                          {filteredVariantsCount !== 1 ? "s" : ""}
                        </span>
                      </span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs
              defaultValue="options"
              orientation="vertical"
              className="hidden lg:flex w-full gap-2"
            >
              <TabsList className="flex-col h-auto mb-auto border">
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <TabsTrigger value="options" className="group py-3">
                          <span className="relative">
                            <Settings
                              size={16}
                              strokeWidth={2}
                              aria-hidden="true"
                            />
                            <span className="absolute -top-2.5 left-full min-w-4 -translate-x-1.5 border-background px-0.5 text-[8px]/[.875rem] transition-opacity group-data-[state=inactive]:opacity-50 bg-foreground/75 text-background rounded-full">
                              {totalOptionsCount}
                            </span>
                          </span>
                        </TabsTrigger>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="px-2 py-1 text-xs">
                      Options ({totalOptionsCount})
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <TabsTrigger value="variants" className="group py-3">
                          <span className="relative">
                            <Layers
                              size={16}
                              strokeWidth={2}
                              aria-hidden="true"
                            />
                            <span className="absolute -top-2.5 left-full min-w-4 -translate-x-1.5 border-background px-0.5 text-[8px]/[.875rem] transition-opacity group-data-[state=inactive]:opacity-50 bg-foreground/75 text-background rounded-full">
                              {filteredVariantsCount}
                            </span>
                          </span>
                        </TabsTrigger>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="px-2 py-1 text-xs">
                      Variants ({filteredVariantsCount})
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsList>

              <div className="grow rounded-lg border bg-background">
                <TabsContent
                  value="options"
                  className="m-0 grow rounded-lg bg-background"
                >
                  <div className="p-4 space-y-4">
                    <div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-medium text-sm">Options</h3>
                          <div className={cn(
                            "rounded-md border text-[.65rem] py-[.0625rem] px-1.5 font-medium",
                            "bg-green-50 text-green-700 border-green-600/20 dark:bg-green-500/10"
                          )}>
                            {totalOptionsCount}
                          </div>
                        </div>
                        <p className="text-muted-foreground text-xs mb-4 mt-1">
                          Add options like size or color to create variants
                        </p>
                      </div>

                      <motion.div
                        className="flex flex-wrap gap-2"
                        layout
                        transition={transitionProps}
                      >
                        {sortedOptions.map((option) => (
                          <OptionButton
                            key={option.id}
                            option={option}
                            isSelected={isOptionSelected(option.id)}
                            onClick={() => {
                              if (isOptionSelected(option.id)) {
                                const updatedOptions = options.filter(
                                  (o) => o.id !== option.id
                                );
                                setOptions(updatedOptions);
                                setVariants(generateVariants(updatedOptions));
                              } else {
                                const updatedOptions = [
                                  ...options,
                                  {
                                    title: option.label || option.title,
                                    id: option.id,
                                    values:
                                      option.values?.map((v) => ({
                                        value: v.value || v,
                                        label: v.label || v,
                                      })) || [],
                                  },
                                ];
                                setOptions(updatedOptions);
                                setVariants(generateVariants(updatedOptions));
                              }
                            }}
                          />
                        ))}

                        <AddOptionPopover
                          onAdd={(newOption) => {
                            const updatedOptions = [...options, newOption];
                            setOptions(updatedOptions);
                            setVariants(generateVariants(updatedOptions));
                          }}
                        />
                      </motion.div>
                    </div>

                    {/* Selected Options */}
                    {options.length > 0 && (
                      <div className="mt-6">
                        {sortedOptionCards.map((option, index) => (
                          <OptionCard
                            key={option.id}
                            option={option}
                            onValuesChange={(values) =>
                              handleOptionValuesChange(index, values)
                            }
                            onRemove={() => handleRemoveOption(index)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="variants" className="m-0 flex flex-col">
                  <div className="flex-1">
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h3 className="font-medium text-sm">Variants</h3>
                            <div className={cn(
                              "rounded-md border text-[.65rem] py-[.0625rem] px-1.5 font-medium",
                              "bg-green-50 text-green-700 border-green-600/20 dark:bg-green-500/10"
                            )}>
                              {filteredVariantsCount}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 [&_svg]:size-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setShowBulkEditForm(true)}
                            >
                              <MoreHorizontal />
                            </Button>
                          </div>
                          <p className="text-muted-foreground text-xs mt-1">
                            Manage your product variants and their properties
                          </p>
                        </div>
                        {selectedFilters.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedFilters.map((filter, index) => (
                              <button
                                key={index}
                                className={cn(
                                  "flex items-center gap-1 uppercase rounded-md border text-[.65rem] py-[.0625rem] px-1.5 font-medium",
                                  "hover:bg-accent hover:text-accent-foreground transition-colors",
                                  "bg-teal-50 text-teal-700 border-teal-600/20 dark:bg-teal-500/10"
                                )}
                              >
                                <span>
                                  <span className="opacity-80 mr-1">
                                    {filter.option}:
                                  </span>
                                  {filter.value}
                                </span>
                                <X
                                  className="h-3 w-3"
                                  onClick={() =>
                                    handleFilterClick(
                                      filter.option,
                                      filter.value
                                    )
                                  }
                                />
                              </button>
                            ))}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 text-xs rounded-md"
                              onClick={() => {
                                setSelectedFilters([]);
                                setCurrentPage(1);
                              }}
                            >
                              Clear all
                            </Button>
                          </div>
                        )}
                      </div>

                      {paginatedVariants.map((variant, index) => (
                        <VariantCard
                          key={index}
                          variant={variant}
                          onUpdate={(newVariant) => {
                            const newVariants = [...variants];
                            newVariants[index] = newVariant;
                            setVariants(newVariants);
                          }}
                          onDelete={() => {
                            const newVariants = variants.filter((_, i) => i !== index);
                            setVariants(newVariants);
                          }}
                          showActions
                          renderOptionValue={(ov) => (
                            <button
                              onClick={() => handleFilterClick(ov.option, ov.value)}
                              className={cn(
                                "uppercase rounded-md border text-[.65rem] py-[.0625rem] px-1.5 font-medium",
                                "hover:bg-accent hover:text-accent-foreground transition-colors",
                                selectedFilters.some(
                                  (f) => f.option === ov.option && f.value === ov.value
                                )
                                  ? "bg-accent text-accent-foreground"
                                  : "bg-cyan-50 text-cyan-700 border-cyan-600/20 dark:bg-cyan-500/10"
                              )}
                            >
                              <span className="opacity-80 mr-1">{ov.option}:</span>
                              {ov.label}
                            </button>
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="border-t p-4 flex items-center justify-between gap-3">
                    <p
                      className="grow text-sm text-muted-foreground"
                      aria-live="polite"
                    >
                      Variants{" "}
                      <span className="text-foreground">
                        {(currentPage - 1) * itemsPerPage + 1}-
                        {Math.min(
                          currentPage * itemsPerPage,
                          filteredVariants.length
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="text-foreground">
                        {filteredVariants.length}
                      </span>
                    </p>
                    <Pagination className="w-auto">
                      <PaginationContent className="gap-3">
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                            aria-disabled={currentPage === 1}
                            className={cn(
                              "aria-disabled:pointer-events-none aria-disabled:opacity-50",
                              "h-8 border bg-background hover:bg-accent hover:text-accent-foreground"
                            )}
                            disabled={currentPage === 1}
                          />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                            aria-disabled={
                              currentPage ===
                              Math.ceil(filteredVariants.length / itemsPerPage)
                            }
                            className={cn(
                              "aria-disabled:pointer-events-none aria-disabled:opacity-50",
                              "h-8 border bg-background hover:bg-accent hover:text-accent-foreground"
                            )}
                            disabled={
                              currentPage ===
                              Math.ceil(filteredVariants.length / itemsPerPage)
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
