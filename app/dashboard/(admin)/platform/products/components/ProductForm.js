import { Label } from "@ui/label";
import { Input } from "@ui/input";
import { Textarea } from "@ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { Badge } from "@ui/badge";
import { cn } from "@keystone/utils/cn";

const statusColors = {
  draft: "bg-zinc-500/10 text-zinc-500/90 dark:bg-white/5 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700/50",
  proposed: "bg-blue-500/15 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-800/50",
  published: "bg-green-500/15 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-300 dark:border-green-900/50",
  rejected: "bg-red-500/15 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-900/50",
};

export function ProductForm({ value, onChange }) {
  return (
    <div className="space-y-8 max-h-[calc(100vh-20rem)] overflow-y-auto px-1">
      {/* Basic Information */}
      <div className="space-y-6">
        <div className="flex items-center">
          <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>
          <div className="ml-3 h-px flex-1 bg-border"></div>
        </div>

        {/* Title & Handle */}
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-sm">Title</Label>
            <Input
              id="title"
              placeholder="Product title"
              value={value?.title || ""}
              className="h-9"
              onChange={(e) =>
                onChange?.((value) => ({
                  ...value,
                  title: e.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="handle" className="text-sm">Handle</Label>
            <Input
              id="handle"
              placeholder="product-handle"
              value={value?.handle || ""}
              className="h-9"
              onChange={(e) =>
                onChange?.((value) => ({
                  ...value,
                  handle: e.target.value,
                }))
              }
            />
          </div>
        </div>

        {/* Description */}
        <div className="grid gap-2">
          <Label htmlFor="description" className="text-sm">Description</Label>
          <Textarea
            id="description"
            placeholder="Product description"
            className="min-h-[100px] resize-y"
            value={value?.description || ""}
            onChange={(e) =>
              onChange?.((value) => ({
                ...value,
                description: e.target.value,
              }))
            }
          />
        </div>

        {/* Status */}
        <div className="grid gap-2">
          <Label className="text-sm">Status</Label>
          <Select
            value={value?.status || "draft"}
            onValueChange={(status) =>
              onChange?.((value) => ({
                ...value,
                status,
              }))
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <Badge className={cn("border text-xs py-0.5", statusColors[value?.status || "draft"])}>
                    {(value?.status || "DRAFT").toUpperCase()}
                  </Badge>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">
                <Badge className={cn("border text-xs", statusColors.draft)}>DRAFT</Badge>
              </SelectItem>
              <SelectItem value="proposed">
                <Badge className={cn("border text-xs", statusColors.proposed)}>PROPOSED</Badge>
              </SelectItem>
              <SelectItem value="published">
                <Badge className={cn("border text-xs", statusColors.published)}>PUBLISHED</Badge>
              </SelectItem>
              <SelectItem value="rejected">
                <Badge className={cn("border text-xs", statusColors.rejected)}>REJECTED</Badge>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* SEO Section */}
      <div className="space-y-6">
        <div className="flex items-center">
          <h3 className="text-sm font-medium text-muted-foreground">Search Engine Optimization</h3>
          <div className="ml-3 h-px flex-1 bg-border"></div>
        </div>

        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="seoTitle" className="text-sm">Page title</Label>
            <Input
              id="seoTitle"
              placeholder="SEO title"
              className="h-9"
              value={value?.seoTitle || ""}
              onChange={(e) =>
                onChange?.((value) => ({
                  ...value,
                  seoTitle: e.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="seoDescription" className="text-sm">Meta description</Label>
            <Textarea
              id="seoDescription"
              placeholder="SEO description"
              className="min-h-[80px] resize-y"
              value={value?.seoDescription || ""}
              onChange={(e) =>
                onChange?.((value) => ({
                  ...value,
                  seoDescription: e.target.value,
                }))
              }
            />
          </div>
        </div>
      </div>

      {/* Additional Fields */}
      <div className="space-y-6">
        <div className="flex items-center">
          <h3 className="text-sm font-medium text-muted-foreground">Additional Information</h3>
          <div className="ml-3 h-px flex-1 bg-border"></div>
        </div>

        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="sku" className="text-sm">SKU</Label>
            <Input
              id="sku"
              placeholder="Stock keeping unit"
              className="h-9"
              value={value?.sku || ""}
              onChange={(e) =>
                onChange?.((value) => ({
                  ...value,
                  sku: e.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="barcode" className="text-sm">Barcode</Label>
            <Input
              id="barcode"
              placeholder="Product barcode"
              className="h-9"
              value={value?.barcode || ""}
              onChange={(e) =>
                onChange?.((value) => ({
                  ...value,
                  barcode: e.target.value,
                }))
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
} 