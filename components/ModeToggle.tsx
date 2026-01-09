"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

interface ModeToggleProps {
  isMarkdownMode: boolean;
  onModeChange: (isMarkdownMode: boolean) => void;
}

export default function ModeToggle({ isMarkdownMode, onModeChange }: ModeToggleProps) {
  const { t } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-lg border bg-muted/50 p-0.5">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onModeChange(false)}
        className={cn(
          "h-7 px-3 text-xs font-medium transition-all relative",
          !isMarkdownMode
            ? "border bg-background text-foreground shadow-lg"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {t("mode.html")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onModeChange(true)}
        className={cn(
          "h-7 px-3 text-xs font-medium transition-all relative",
          isMarkdownMode
            ? "border bg-background text-foreground shadow-lg"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {t("mode.markdown")}
      </Button>
    </div>
  );
}

