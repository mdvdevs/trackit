"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface NoteEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function NoteEditor({
  value,
  onChange,
  placeholder,
  className,
}: NoteEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  return (
    <div className={cn("relative", className)}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full resize-none bg-transparent px-4 py-3 text-base leading-relaxed",
          "placeholder:text-muted-foreground/50",
          "focus:outline-none",
          "min-h-[200px]",
          "bg-[linear-gradient(transparent_calc(1.75rem_-_1px),_var(--color-border)_calc(1.75rem_-_1px))]",
          "bg-[size:100%_1.75rem]",
          "leading-[1.75rem]"
        )}
        spellCheck={false}
      />
    </div>
  );
}
