import { useState } from "react";
import Image from "next/image";
import { Pencil, Trash2, Check, Search } from "lucide-react";
import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { ScrollArea } from "@ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { cn } from "@keystone/utils/cn";
import { FieldContainer } from "@keystone/themes/Tailwind/orion/components/FieldContainer";
import { FieldLabel } from "@keystone/themes/Tailwind/orion/components/FieldLabel";

export { Field } from "./Field";

export const Cell = ({ item, field }) => {
  const data = item[field.path];
  if (!data) return null;
  return (
    <div className="flex items-center h-6 w-6 leading-none">
      <img
        alt={data.filename}
        className="max-h-full max-w-full"
        src={data.url}
      />
    </div>
  );
};

export const CardValue = ({ item, field }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const data = item[field.path];

  if (!data) return null;

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <div className="group relative aspect-square overflow-hidden rounded-md border bg-muted">
        <Image
          src={data.url || "/placeholder.svg"}
          alt={data.filename}
          className="object-cover"
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(data);
              setEditDialogOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              // Handle remove image
              if (onChange) {
                onChange({ kind: "remove", previous: value });
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
          <p className="truncate text-xs text-white">{data.filename}</p>
        </div>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Image Details</DialogTitle>
            <DialogDescription>Update the image details.</DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="grid gap-4 py-4">
              <div className="relative mx-auto aspect-square w-full max-w-[200px] overflow-hidden rounded-md">
                <Image
                  src={selectedImage.url || "/placeholder.svg"}
                  alt={selectedImage.filename}
                  className="object-cover"
                  fill
                  sizes="200px"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="filename">Filename</Label>
                <Input
                  id="filename"
                  defaultValue={selectedImage.filename}
                  onChange={(e) => {
                    if (selectedImage) {
                      setSelectedImage({
                        ...selectedImage,
                        filename: e.target.value,
                      });
                    }
                  }}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (selectedImage && onChange) {
                  // Handle update image details
                  onChange({
                    kind: "update",
                    data: selectedImage,
                    previous: value,
                  });
                }
                setEditDialogOpen(false);
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FieldContainer>
  );
};

export const controller = (config) => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: `${config.path} {
        url
        id
        filename
        extension
        width
        height
        filesize
      }`,
    defaultValue: { kind: "empty" },
    deserialize(item) {
      const value = item[config.path];
      if (!value) return { kind: "empty" };
      return {
        kind: "from-server",
        data: {
          src: value.url,
          id: value.id,
          filename: value.filename,
          extension: value.extension,
          ref: value.ref,
          width: value.width,
          height: value.height,
          filesize: value.filesize,
        },
      };
    },
    validate(value) {
      return value.kind !== "upload" || validateImage(value.data) === undefined;
    },
    serialize(value) {
      if (value.kind === "upload") {
        return { [config.path]: { upload: value.data.file } };
      }
      if (value.kind === "remove") {
        return { [config.path]: null };
      }
      return {};
    },
  };
}; 