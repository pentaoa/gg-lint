"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface CopyButtonProps {
  markdown: string;
  disabled?: boolean;
  isMac?: boolean;
}

export interface CopyButtonHandle {
  triggerCopy: () => Promise<void>;
}

const CopyButton = forwardRef<CopyButtonHandle, CopyButtonProps>(
  ({ markdown, disabled, isMac = false }, ref) => {
    const { t } = useLanguage();
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      if (!markdown) return;

      try {
        await navigator.clipboard.writeText(markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error(t("button.copy.failed"), error);
      }
    };

    useImperativeHandle(ref, () => ({
      triggerCopy: handleCopy
    }));

    return (
      <Button
        onClick={handleCopy}
        disabled={disabled || !markdown}
        size="lg"
        className="w-full"
        title={t("button.copy.shortcut", { shortcut: `${isMac ? '⌘' : 'Ctrl'}+K` })}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t("button.copy.copied")}</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t("button.copy.shortcut", { shortcut: `${isMac ? '⌘' : 'Ctrl'}+K` })}</span>
          </>
        )}
      </Button>
    );
  }
);

CopyButton.displayName = 'CopyButton';

export default CopyButton;
