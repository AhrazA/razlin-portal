"use client";

import { useCallback, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = {
  value: string;
  onChange: (emoji: string) => void;
};

export function EmojiPickerButton({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const mountPicker = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      let cancelled = false;

      Promise.all([import("emoji-mart"), import("@emoji-mart/data")]).then(
        ([{ Picker }, { default: data }]) => {
          if (cancelled) return;
          const picker = new Picker({
            data,
            onEmojiSelect: (emoji: { native: string }) => {
              onChange(emoji.native);
              setOpen(false);
            },
            theme: "light",
            previewPosition: "none",
          });
          node.innerHTML = "";
          node.appendChild(picker as unknown as Node);
        }
      );

      return () => {
        cancelled = true;
      };
    },
    [onChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex h-11 w-16 items-center justify-center rounded-lg border border-input bg-background text-xl">
        {value || "🧹"}
      </PopoverTrigger>
      <PopoverContent className="w-auto border-none bg-transparent p-0 shadow-none ring-0">
        {open && <div ref={mountPicker} />}
      </PopoverContent>
    </Popover>
  );
}
