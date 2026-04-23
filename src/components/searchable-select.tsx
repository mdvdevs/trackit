"use client";

import { useState, useRef, useEffect } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Search...",
  emptyText = "No results. Type to add new.",
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (selected: string) => {
    onChange(selected);
    setInputValue(selected);
    setOpen(false);
  };

  const handleInputChange = (val: string) => {
    setInputValue(val);
    onChange(val);
    if (!open) setOpen(true);
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <Command shouldFilter={true} className="rounded-lg border bg-card">
        <CommandInput
          placeholder={placeholder}
          value={inputValue}
          onValueChange={handleInputChange}
          onFocus={() => setOpen(true)}
        />
        {open && (
          <CommandList className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 rounded-lg border bg-popover shadow-lg">
            <CommandEmpty className="py-3 text-center text-xs text-muted-foreground">
              {inputValue.trim()
                ? `Press Enter or tap "Add Set" to use "${inputValue}"`
                : emptyText}
            </CommandEmpty>
            <CommandGroup>
              {options
                .filter((o) =>
                  o.toLowerCase().includes(inputValue.toLowerCase())
                )
                .slice(0, 8)
                .map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => handleSelect(option)}
                  >
                    {option}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        )}
      </Command>
    </div>
  );
}
