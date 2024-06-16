import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface InlineInputProps {
  defaultValue: string;
  onChange: (val: string) => void;
  isDisabled?: boolean;
  defaultIsEditing?: boolean;
  isEditing?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
  maxWidth?: string | number;
  className?: string;
}

export const InlineInput = ({
  defaultValue,
  onChange,
  isDisabled,
  isEditing,
  onEditingChange,
  maxWidth = "600px",
  className,
}: InlineInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [_isEditing, _setEditing] = useState(false);
  const [value, setValue] = useState(defaultValue);

  if (isEditing === undefined) {
    isEditing = _isEditing;
  }

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  return (
    <div
      className={cn(
        "relative group w-fit font-serif",
        isDisabled ? "cursor-auto" : "cursor-text",
        className
      )}
      style={{ maxWidth }}
      onClick={() => {
        if (!isDisabled) {
          _setEditing(true);
        }
      }}
    >
      <div className="relative w-fit">
        <p
          className={`text-sm leading-5 w-fit ${
            isEditing ? "invisible" : "visible"
          } truncate whitespace-pre`}
          style={{
            maxWidth,
          }}
        >
          {value || "Untitled"}
        </p>
      </div>
      {isEditing && (
        <input
          ref={inputRef}
          onBlur={(e: any) => {
            _setEditing(false);
            onEditingChange?.(false);
            onChange?.(value);
          }}
          onKeyDown={(e: any) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
            if (e.key === "Escape") {
              setValue(defaultValue);
              _setEditing(false);
              onEditingChange?.(false);
            }
          }}
          placeholder="Untitled"
          value={value}
          onChange={(e: any) => {
            setValue(e.target.value);
            e.target.value = value;
          }}
          className="absolute -mx-[7px] inset-y-0 min-w-0 appearance-none text-sm w-full box-content px-1.5 py-0 rounded-md focus:outline-none border-gray-300 focus:border-gray-500 focus:ring-gray-500 focus:ring-1 bg-transparent"
        />
      )}
    </div>
  );
};
