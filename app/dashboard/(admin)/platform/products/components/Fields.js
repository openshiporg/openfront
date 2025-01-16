import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Label } from "@ui/label";
import { Input } from "@ui/input";
import { Textarea } from "@ui/textarea";
import { Switch } from "@ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";
import ProductVariants from "./ProductVariants";
import ProductMedia from "./ProductMedia";
import ProductCollections from "./ProductCollections";
import ProductCategories from "./ProductCategories";
import InventoryManager from "./InventoryManager";
import PriceOverview from "./PriceOverview";

export function Fields({ 
  fields, 
  fieldModes = {}, 
  fieldPositions = {}, 
  forceValidation, 
  invalidFields, 
  onChange, 
  value 
}) {
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="variants">Variants & Pricing</TabsTrigger>
        <TabsTrigger value="organization">Organization</TabsTrigger>
        <TabsTrigger value="media">Media</TabsTrigger>
        <TabsTrigger value="attributes">Attributes</TabsTrigger>
      </TabsList>

      <div className="mt-4 space-y-4">
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={value.title || ""}
                    onChange={e => onChange?.({ ...value, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="handle">Handle</Label>
                  <Input
                    id="handle"
                    value={value.handle || ""}
                    onChange={e => onChange?.({ ...value, handle: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={value.subtitle || ""}
                  onChange={e => onChange?.({ ...value, subtitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={value.description || ""}
                  onChange={e => onChange?.({ ...value, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="status">Status</Label>
                  <div className="text-sm text-muted-foreground">
                    Control the public visibility of this product
                  </div>
                </div>
                <Select
                  value={value.status || "draft"}
                  onValueChange={status => onChange?.({ ...value, status })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="proposed">Proposed</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="discountable"
                  checked={value.discountable}
                  onCheckedChange={discountable => onChange?.({ ...value, discountable })}
                />
                <Label htmlFor="discountable">Discountable</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isGiftcard"
                  checked={value.isGiftcard}
                  onCheckedChange={isGiftcard => onChange?.({ ...value, isGiftcard })}
                />
                <Label htmlFor="isGiftcard">Is Gift Card</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variants">
          <div className="space-y-4">
            <ProductVariants value={value} onChange={onChange} />
            <PriceOverview value={value} onChange={onChange} />
          </div>
        </TabsContent>

        <TabsContent value="organization">
          <div className="space-y-4">
            <ProductCollections value={value} onChange={onChange} />
            <ProductCategories value={value} onChange={onChange} />
          </div>
        </TabsContent>

        <TabsContent value="media">
          <ProductMedia value={value} onChange={onChange} />
        </TabsContent>

        <TabsContent value="attributes">
          <Card>
            <CardHeader>
              <CardTitle>Product Attributes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (g)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={value.weight || ""}
                    onChange={e => onChange?.({ ...value, weight: parseInt(e.target.value) || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hsCode">HS Code</Label>
                  <Input
                    id="hsCode"
                    value={value.hsCode || ""}
                    onChange={e => onChange?.({ ...value, hsCode: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length">Length (cm)</Label>
                  <Input
                    id="length"
                    type="number"
                    value={value.length || ""}
                    onChange={e => onChange?.({ ...value, length: parseInt(e.target.value) || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">Width (cm)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={value.width || ""}
                    onChange={e => onChange?.({ ...value, width: parseInt(e.target.value) || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={value.height || ""}
                    onChange={e => onChange?.({ ...value, height: parseInt(e.target.value) || null })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originCountry">Origin Country</Label>
                  <Input
                    id="originCountry"
                    value={value.originCountry || ""}
                    onChange={e => onChange?.({ ...value, originCountry: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    value={value.material || ""}
                    onChange={e => onChange?.({ ...value, material: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="metadata">Metadata</Label>
                <Textarea
                  id="metadata"
                  value={value.metadata ? JSON.stringify(value.metadata, null, 2) : ""}
                  onChange={e => {
                    try {
                      const metadata = JSON.parse(e.target.value);
                      onChange?.({ ...value, metadata });
                    } catch (err) {
                      // Invalid JSON, don't update
                    }
                  }}
                  rows={4}
                  placeholder="{}"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  );
}