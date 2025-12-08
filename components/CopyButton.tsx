"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

interface CopyButtonProps {
  markdown: string;
  disabled?: boolean;
}

export default function CopyButton({ markdown, disabled }: CopyButtonProps) {
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

  return (
    <Button
      onClick={handleCopy}
      disabled={disabled || !markdown}
      size="lg"
      className="w-full"
    >
      {copied ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          已复制！
        </>
      ) : (
        <>
          <Copy className="mr-2 h-4 w-4" />
          复制 Markdown
        </>
      )}
    </Button>
  );
}
