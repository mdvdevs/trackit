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
          "w-full resize-none bg-transparent px-4 py-4 text-base leading-8",
          "placeholder:text-muted-foreground/50",
          "focus:outline-none",
          "min-h-[150px]"
        )}
        spellCheck={false}
      />
    </div>
  );
}
