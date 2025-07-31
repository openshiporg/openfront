import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { TagInput } from "./TagInput";

export function OptionCard({ option, readOnly = false, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(option?.title || '');
  const [values, setValues] = useState(option?.values || []);

  // Update local state when option changes
  useEffect(() => {
    setTitle(option?.title || '');
    setValues(option?.values || []);
  }, [option]);

  const handleSave = () => {
    onUpdate?.({
      ...option,
      title,
      values,
    });
    setIsEditing(false);
  };

  // Update parent immediately when values change
  const handleValuesChange = (newValues) => {
    setValues(newValues);
    onUpdate?.({
      ...option,
      title,
      values: newValues,
    });
  };

  return (
    <div className="mt-2 border p-4 rounded-lg bg-muted/40 space-y-3">
      <div className="flex flex-wrap justify-between items-center gap-2">
        {isEditing && !readOnly ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-48 h-8 text-sm"
            placeholder="Option name..."
          />
        ) : (
          <div>
            <h3 className="font-medium text-sm">{option?.title || 'Untitled'}</h3>
            <p className="text-muted-foreground text-xs">
              {(option?.values || []).length} values
            </p>
          </div>
        )}
        {!readOnly && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7"
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
            >
              {isEditing ? "Save" : "Edit"}
            </Button>
          </div>
        )}
      </div>
      <TagInput
        placeholder={`${(option.title || 'option').toLowerCase()} values...`}
        value={values}
        onChange={!readOnly ? handleValuesChange : undefined}
        readOnly={readOnly}
        className="bg-background"
      />
    </div>
  );
}