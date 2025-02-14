import { Button } from "@ui/button";
import { Trash2 } from "lucide-react";
import { MultipleSelector } from "@ui/multi-select";

export function OptionCard({ option, onValuesChange, onRemove }) {
  return (
    <div className="mt-2 border p-2 rounded-lg bg-muted/40">
      <div className="flex flex-wrap justify-between">
        <div className="ml-1">
          <h3 className="font-medium text-sm mb-1">{option.title}</h3>
          <p className="text-muted-foreground text-xs mb-2">
            {option.values.length} values{" "}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="[&_svg]:size-3 w-6 h-6"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <MultipleSelector
        placeholder={`Add ${option.title.toLowerCase()} values...`}
        value={option.values}
        onChange={onValuesChange}
        creatable
        emptyIndicator={
          <p className="text-center text-sm text-muted-foreground py-2">
            No values added yet.
          </p>
        }
        className="bg-background"
      />
    </div>
  );
} 