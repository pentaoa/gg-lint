"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

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
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      if (!markdown) return;

      try {
        await navigator.clipboard.writeText(markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("复制失败:", error);
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
        title={`复制 Markdown (${isMac ? '⌘' : 'Ctrl'}+K)`}
      >
        {copied ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            已复制！
          </>
        ) : (
          <>
            <Copy className="mr-2 h-4 w-4" />
            复制 Markdown ({isMac ? '⌘' : 'Ctrl'}+K)
          </>
        )}
      </Button>
    );
  }
);

CopyButton.displayName = 'CopyButton';

export default CopyButton;
