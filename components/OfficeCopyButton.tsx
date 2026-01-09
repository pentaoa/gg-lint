"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Check, FileText } from "lucide-react";
import { convertMarkdownToOfficeHTML, extractPlainText } from "@/lib/office-export";
import { useLanguage } from "@/lib/language-context";

interface OfficeCopyButtonProps {
  markdown: string;
  disabled?: boolean;
}

export interface OfficeCopyButtonHandle {
  triggerCopy: () => Promise<void>;
}

const OfficeCopyButton = forwardRef<OfficeCopyButtonHandle, OfficeCopyButtonProps>(
  ({ markdown, disabled = false }, ref) => {
    const { t } = useLanguage();
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleCopy = async () => {
      if (!markdown) return;

      setIsLoading(true);
      try {
        // 将 Markdown 转换为 Office HTML（包含 MathML）
        const html = await convertMarkdownToOfficeHTML(markdown);
        
        // 提取纯文本作为降级方案
        const plainText = await extractPlainText(markdown);

        // 使用 Clipboard API 复制 HTML 格式
        // Office 软件支持从剪贴板粘贴 HTML
        const clipboardItem = new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([plainText], { type: "text/plain" }),
        });

        await navigator.clipboard.write([clipboardItem]);
        
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (error) {
        console.error(t("button.office.failed"), error);
        // 降级：尝试复制纯文本
        try {
          await navigator.clipboard.writeText(markdown);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        } catch (fallbackError) {
          console.error(t("button.office.failed"), fallbackError);
          alert(t("button.office.failed"));
        }
      } finally {
        setIsLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      triggerCopy: handleCopy,
    }));

    return (
      <Button
        onClick={handleCopy}
        disabled={disabled || !markdown || isLoading}
        size="lg"
        variant="outline"
        className="w-full"
        title={t("button.office.title")}
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
            <span className="hidden sm:inline">{t("button.office.loading")}</span>
          </>
        ) : copied ? (
          <>
            <Check className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t("button.office.copied")}</span>
          </>
        ) : (
          <>
            <FileText className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t("button.office")}</span>
            <span className="sm:hidden">{t("button.office.short")}</span>
          </>
        )}
      </Button>
    );
  }
);

OfficeCopyButton.displayName = "OfficeCopyButton";

export default OfficeCopyButton;

