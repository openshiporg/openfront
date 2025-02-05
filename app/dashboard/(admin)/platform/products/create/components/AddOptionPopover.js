import { useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
import { cn } from "@keystone/utils/cn";

const transitionProps = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.5,
};

export function AddOptionPopover({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");

  const handleAdd = () => {
    if (!title.trim()) return;

    onAdd({
      title: title,
      id: title.toLowerCase().replace(/\s+/g, "-"),
      values: [{ value: "N/A", label: "N/A" }],
      label: title,
    });
    
    setTitle("");
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <motion.button
          layout
          whileHover={{
            backgroundColor: "hsl(var(--muted))",
          }}
          whileTap={{
            scale: 0.98,
          }}
          transition={transitionProps}
          className={cn(
            "inline-flex items-center px-4 py-2 rounded-full text-sm font-medium",
            "whitespace-nowrap overflow-hidden ring-1 ring-inset",
            "text-muted-foreground ring-border hover:text-foreground"
          )}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Option
        </motion.button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-sm mb-1">Add Option</h3>
            <p className="text-muted-foreground text-xs">
              Create a new option type for your product
            </p>
          </div>
          <div className="space-y-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Material, Style, etc."
              className="h-8 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!title.trim()}
            >
              Add Option
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 