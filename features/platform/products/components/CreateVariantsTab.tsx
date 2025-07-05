"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  AlertCircle,
  Info,
  Check,
  X,
  MoreHorizontal,
  Settings,
  Layers,
  Save,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BadgeButton } from "@/components/ui/badge-button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useId } from "react";
import { toast } from "sonner";

// Debug utility that only logs in development
const debug = (label: string, data: any) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEBUG: ${label}]`, data);
  }
};

interface CreateVariantsTabProps {
  // For create mode, we'll manage the variants state and pass it back up
  onVariantsChange?: (variants: any[]) => void;
  onOptionsChange?: (options: any[]) => void;
}

export function CreateVariantsTab({ 
  onVariantsChange, 
  onOptionsChange 
}: CreateVariantsTabProps) {
  // All state hooks first
  const [activeTab, setActiveTab] = useState("options");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isVariantsExpanded, setIsVariantsExpanded] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [variantsToCreate, setVariantsToCreate] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  
  // For create mode, we start with empty state
  const [variants, setVariants] = useState<any[]>([]);
  
  // Generate unique IDs for new items
  const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add new option
  const handleAddOption = useCallback((optionData: any) => {
    const newOption = {
      id: generateTempId(),
      title: optionData.title,
      productOptionValues: [],
      // Mark as new for create mode
      _isNew: true
    };
    
    const updatedOptions = [...options, newOption];
    setOptions(updatedOptions);
    
    // Notify parent component
    if (onOptionsChange) {
      onOptionsChange(updatedOptions);
    }
    
    toast.success(`Option "${optionData.title}" added`);
  }, [options, onOptionsChange]);

  // Add option value
  const handleAddOptionValue = useCallback((optionId: string, valueData: any) => {
    const updatedOptions = options.map(option => {
      if (option.id === optionId) {
        const newValue = {
          id: generateTempId(),
          value: valueData.value,
          _isNew: true
        };
        
        return {
          ...option,
          productOptionValues: [...(option.productOptionValues || []), newValue]
        };
      }
      return option;
    });
    
    setOptions(updatedOptions);
    
    if (onOptionsChange) {
      onOptionsChange(updatedOptions);
    }
    
    toast.success(`Option value "${valueData.value}" added`);
  }, [options, onOptionsChange]);

  // Generate variants from options
  const generateVariants = useCallback(() => {
    if (options.length === 0) {
      setVariants([]);
      if (onVariantsChange) {
        onVariantsChange([]);
      }
      return;
    }

    // Generate all combinations of option values
    const optionValues = options.map(option => 
      option.productOptionValues?.map((val: any) => ({
        optionId: option.id,
        optionTitle: option.title,
        valueId: val.id,
        value: val.value
      })) || []
    );

    if (optionValues.some(values => values.length === 0)) {
      // If any option has no values, can't generate variants
      setVariants([]);
      if (onVariantsChange) {
        onVariantsChange([]);
      }
      return;
    }

    // Generate cartesian product
    const cartesianProduct = (arr: any[][]): any[][] => {
      return arr.reduce((acc, curr) => {
        return acc.flatMap(a => curr.map(c => [...a, c]));
      }, [[]]);
    };

    const combinations = cartesianProduct(optionValues);
    
    const newVariants = combinations.map(combination => {
      const variantTitle = combination.map(c => c.value).join(" / ");
      
      return {
        id: generateTempId(),
        title: variantTitle,
        sku: '', // Will be set by user
        inventoryQuantity: 0,
        allowBackorder: false,
        manageInventory: true,
        prices: [], // Will be set by user
        productOptionValues: combination.map(c => ({
          id: c.valueId,
          value: c.value,
          option: {
            id: c.optionId,
            title: c.optionTitle
          }
        })),
        _isNew: true
      };
    });

    setVariants(newVariants);
    
    if (onVariantsChange) {
      onVariantsChange(newVariants);
    }
    
    toast.success(`Generated ${newVariants.length} variants`);
  }, [options, onVariantsChange]);

  // Delete option
  const handleDeleteOption = useCallback((optionId: string) => {
    const updatedOptions = options.filter(option => option.id !== optionId);
    setOptions(updatedOptions);
    
    if (onOptionsChange) {
      onOptionsChange(updatedOptions);
    }
    
    // Regenerate variants after deleting option
    setTimeout(() => {
      generateVariants();
    }, 0);
    
    toast.success("Option deleted");
  }, [options, onOptionsChange, generateVariants]);

  // Update variant
  const handleUpdateVariant = useCallback((variantId: string, updates: any) => {
    const updatedVariants = variants.map(variant => {
      if (variant.id === variantId) {
        return { ...variant, ...updates };
      }
      return variant;
    });
    
    setVariants(updatedVariants);
    
    if (onVariantsChange) {
      onVariantsChange(updatedVariants);
    }
  }, [variants, onVariantsChange]);

  // Simple variant card for create mode
  const VariantCard = ({ variant }: { variant: any }) => {
    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{variant.title}</h4>
              <p className="text-sm text-muted-foreground">
                {variant.productOptionValues?.map((ov: any) => 
                  `${ov.option?.title}: ${ov.value}`
                ).join(", ")}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`sku-${variant.id}`}>SKU</Label>
              <Input
                id={`sku-${variant.id}`}
                value={variant.sku || ''}
                onChange={(e) => handleUpdateVariant(variant.id, { sku: e.target.value })}
                placeholder="Enter SKU"
              />
            </div>
            <div>
              <Label htmlFor={`inventory-${variant.id}`}>Inventory</Label>
              <Input
                id={`inventory-${variant.id}`}
                type="number"
                value={variant.inventoryQuantity || 0}
                onChange={(e) => handleUpdateVariant(variant.id, { 
                  inventoryQuantity: parseInt(e.target.value) || 0 
                })}
                placeholder="0"
              />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <Switch
                id={`manage-inventory-${variant.id}`}
                checked={variant.manageInventory}
                onCheckedChange={(checked) => handleUpdateVariant(variant.id, { 
                  manageInventory: checked 
                })}
              />
              <Label htmlFor={`manage-inventory-${variant.id}`}>
                Manage Inventory
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Option card for create mode
  const OptionCard = ({ option }: { option: any }) => {
    const [newValue, setNewValue] = useState("");

    const handleAddValue = () => {
      if (newValue.trim()) {
        handleAddOptionValue(option.id, { value: newValue.trim() });
        setNewValue("");
      }
    };

    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{option.title}</h4>
              <p className="text-sm text-muted-foreground">
                {option.productOptionValues?.length || 0} values
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteOption(option.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {option.productOptionValues?.map((value: any) => (
              <Badge key={value.id} variant="secondary">
                {value.value}
              </Badge>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Add option value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddValue();
                }
              }}
            />
            <Button onClick={handleAddValue} disabled={!newValue.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Product Variants</h3>
        <Button
          onClick={generateVariants}
          disabled={options.length === 0}
          variant="outline"
        >
          <Layers className="h-4 w-4 mr-2" />
          Generate Variants
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="options">Options</TabsTrigger>
          <TabsTrigger value="variants">Variants ({variants.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="options" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Create options like Size, Color, etc. and their values
            </p>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <AddOptionForm onAdd={handleAddOption} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-4">
            {options.map((option) => (
              <OptionCard key={option.id} option={option} />
            ))}
            
            {options.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h4 className="font-medium mb-2">No options yet</h4>
                    <p className="text-sm text-muted-foreground">
                      Add options like Size, Color, or Material to create product variants
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="variants" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Generated variants from your options
            </p>
          </div>

          <div className="space-y-4">
            {variants.map((variant) => (
              <VariantCard key={variant.id} variant={variant} />
            ))}
            
            {variants.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h4 className="font-medium mb-2">No variants yet</h4>
                    <p className="text-sm text-muted-foreground">
                      Add options first, then generate variants to see them here
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Simple form for adding options
function AddOptionForm({ onAdd }: { onAdd: (data: any) => void }) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd({ title: title.trim() });
      setTitle("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="option-title">Option Title</Label>
        <Input
          id="option-title"
          placeholder="e.g., Size, Color, Material"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <PopoverClose asChild>
          <Button type="button" variant="outline" className="flex-1">
            Cancel
          </Button>
        </PopoverClose>
        <Button type="submit" disabled={!title.trim()} className="flex-1">
          Add Option
        </Button>
      </div>
    </form>
  );
}