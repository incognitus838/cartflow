"use client";

import { Bold, Italic, List } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function wrapSelection(before: string, after = before) {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    onChange(next);

    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, end + before.length);
    });
  }

  function insertPrefix(prefix: string) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const next = `${value.slice(0, lineStart)}${prefix}${value.slice(lineStart)}`;
    onChange(next);
  }

  return (
    <div className={cn("overflow-hidden rounded-[14px] border border-black/[0.08] bg-white", className)}>
      <div
        className="flex items-center gap-1 border-b border-black/[0.06] px-2 py-1.5"
        role="toolbar"
        aria-label="Formatting"
      >
        <button
          type="button"
          className="cf-product-icon-btn"
          aria-label="Bold"
          onClick={() => wrapSelection("**")}
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="cf-product-icon-btn"
          aria-label="Italic"
          onClick={() => wrapSelection("_")}
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="cf-product-icon-btn"
          aria-label="Bullet list"
          onClick={() => insertPrefix("• ")}
        >
          <List className="h-3.5 w-3.5" />
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        placeholder={placeholder}
        className="min-h-[140px] w-full resize-y border-0 bg-transparent px-4 py-3 text-[14px] leading-relaxed text-[#1d1d1f] outline-none"
        aria-label="Product description"
      />
    </div>
  );
}