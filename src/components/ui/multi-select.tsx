"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  maxDisplay?: number;
}

export function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = "선택하세요",
  className,
  maxDisplay = 2,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (optionValue: string) => {
    const newValue = value.includes(optionValue) ? value.filter((v) => v !== optionValue) : [...value, optionValue];
    onChange(newValue);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const getDisplayText = () => {
    if (value.length === 0) return placeholder;

    if (value.length === 1) {
      const label = options.find((opt) => opt.value === value[0])?.label || value[0];
      return label.length > 6 ? `${label.substring(0, 6)}...` : label;
    }

    const firstItem = value[0];
    const firstLabel = options.find((opt) => opt.value === firstItem)?.label || firstItem;
    const truncatedLabel = firstLabel.length > 4 ? `${firstLabel.substring(0, 4)}...` : firstLabel;

    return `${truncatedLabel} +${value.length - 1}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between h-9 text-sm min-w-0 w-full", className)}
        >
          <span className="truncate">{getDisplayText()}</span>
          <div className="flex items-center gap-1 flex-shrink-0">
            <ChevronDown className="h-3 w-3 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 bg-white/20 backdrop-blur-md border shadow-lg" align="start">
        <div className="space-y-1">
          {options.map((option) => (
            <div
              key={option.value}
              className="flex items-center space-x-2 p-2 hover:bg-white/30 rounded cursor-pointer select-none"
              onClick={() => handleSelect(option.value)}
            >
              <Checkbox
                id={`multi-${option.value}`}
                checked={value.includes(option.value)}
                onChange={() => {}} // onClick에서 처리
                className="border-2 border-gray-400 data-[state=checked]:border-[#f59e0b]"
              />
              <span className="text-sm cursor-pointer flex-1 text-gray-900 font-medium">{option.label}</span>
            </div>
          ))}

          {value.length > 0 && (
            <div className="border-t pt-2 mt-2">
              <Button variant="ghost" size="sm" onClick={handleClearAll} className="w-full text-xs">
                전체 해제
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
