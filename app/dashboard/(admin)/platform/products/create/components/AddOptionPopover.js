import { Button } from "@ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";

export function AddOptionPopover({ onAdd }) {
  const [title, setTitle] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd({
      id: `temp-${Date.now()}`, // Temporary ID until saved
      title: title.trim(),
      values: [],
    });
    setTitle("");
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 relative pe-12"
        >
          Add option
          <span className="pointer-events-none absolute inset-y-0 end-0 flex w-9 items-center justify-center bg-primary-foreground/15">
            <Plus className="opacity-60" size={16} strokeWidth={2} />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="grid gap-4">
          <div className="space-y-1">
            <h4 className="font-medium leading-none text-sm">Add new option</h4>
            <p className="text-xs text-muted-foreground">
              Create a new product option like size or color
            </p>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="title" className="text-xs">
              Option name
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-lg text-sm h-8"
              placeholder="e.g. Size, Color, Material..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!title.trim()}
            >
              Add option
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 