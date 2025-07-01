"use client";

import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Globe, MapPin, DollarSign, Percent, X, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { POPULAR_REGIONS } from "../../constants/popular-regions";
import { createPopularRegion } from "../../actions/popular-regions";

interface PopularRegionsDrawerProps {
  open: boolean;
  onClose: () => void;
  onRegionCreated: () => void;
}

export function PopularRegionsDrawer({ 
  open, 
  onClose, 
  onRegionCreated 
}: PopularRegionsDrawerProps) {
  const [creatingRegion, setCreatingRegion] = useState<string | null>(null);
  const [createdRegions, setCreatedRegions] = useState<Set<string>>(new Set());

  const handleCreateRegion = async (templateName: string) => {
    setCreatingRegion(templateName);
    
    try {
      const result = await createPopularRegion(templateName);
      
      if (result.success) {
        toast.success(result.data?.message || `Successfully created ${templateName} region`);
        
        setCreatedRegions(prev => new Set([...prev, templateName]));
        onRegionCreated();
      } else {
        toast.error(result.error || "Failed to create region");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create region");
    } finally {
      setCreatingRegion(null);
    }
  };

  // Reset state when drawer closes
  useEffect(() => {
    if (!open) {
      setCreatedRegions(new Set());
      setCreatingRegion(null);
    }
  }, [open]);

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Popular Regions
              </DrawerTitle>
              <DrawerDescription>
                Quick setup with pre-configured countries, currencies, and settings
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="w-4 h-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {POPULAR_REGIONS.map((template) => {
              const isCreating = creatingRegion === template.name;
              const isCreated = createdRegions.has(template.name);

              return (
                <Card 
                  key={template.name}
                  className={`transition-colors ${isCreated ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20' : ''}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-600" />
                        <CardTitle className="text-base">{template.name}</CardTitle>
                      </div>
                      {isCreated && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="secondary" className="gap-1">
                        <MapPin className="w-3 h-3" />
                        {template.countries.length} countries
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        <DollarSign className="w-3 h-3" />
                        {template.currencies.length} currencies
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        <Percent className="w-3 h-3" />
                        {template.taxRate}% tax
                      </Badge>
                    </div>

                    {/* Default Currency */}
                    <div className="text-sm">
                      <span className="text-muted-foreground">Default currency:</span>
                      <span className="ml-2 font-medium">{template.defaultCurrency}</span>
                    </div>

                    {/* Countries Preview */}
                    <div className="text-sm">
                      <span className="text-muted-foreground">Countries:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {template.countries.slice(0, 4).map((country) => (
                          <Badge key={country.iso2} variant="outline" className="text-xs">
                            {country.iso2}
                          </Badge>
                        ))}
                        {template.countries.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.countries.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => handleCreateRegion(template.name)}
                      disabled={isCreating || isCreated}
                      className="w-full"
                      variant={isCreated ? "secondary" : "default"}
                    >
                      {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {isCreated ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Created
                        </>
                      ) : isCreating ? (
                        "Creating..."
                      ) : (
                        "Create Region"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}