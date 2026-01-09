"use client";

import { useRef, useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/lib/language-context";

interface EditorInputProps {
  onConvert?: (html: string) => void;
  markdownValue?: string;
  onMarkdownChange?: (value: string) => void;
  isLoading?: boolean;
  isMac?: boolean;
  isMarkdownMode?: boolean;
}

export default function EditorInput({ 
  onConvert, 
  markdownValue, 
  onMarkdownChange,
  isLoading, 
  isMac = false,
  isMarkdownMode = false
}: EditorInputProps) {
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keyboard shortcut for clear (Cmd+E / Ctrl+E)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;
      
      if (modifierKey && e.key === 'e' && !e.shiftKey && !isLoading) {
        const hasValue = isMarkdownMode ? markdownValue : inputValue;
        if (hasValue) {
          e.preventDefault();
          if (isMarkdownMode) {
            onMarkdownChange?.("");
          } else {
            setInputValue("");
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputValue, markdownValue, isLoading, isMac, isMarkdownMode, onMarkdownChange]);

  const handlePaste = async (e: React.ClipboardEvent) => {
    if (isMarkdownMode) {
      // Markdown 模式下，直接粘贴文本，不阻止默认行为
      return;
    }
    
    e.preventDefault();
    
    const clipboardData = e.clipboardData;
    const htmlData = clipboardData.getData("text/html");
    const textData = clipboardData.getData("text/plain");

    if (htmlData) {
      // 如果有 HTML 数据，直接使用
      setInputValue(htmlData);
      onConvert?.(htmlData);
    } else if (textData) {
      // 如果只有纯文本，包装成简单 HTML
      const simpleHtml = `<p>${textData.replace(/\n/g, "</p><p>")}</p>`;
      setInputValue(textData);
      onConvert?.(simpleHtml);
    }
  };

  const handleManualConvert = () => {
    if (isMarkdownMode) {
      return;
    }
    
    if (inputValue.trim()) {
      // 检查是否已经是 HTML
      const isHtml = inputValue.trim().startsWith("<");
      if (isHtml) {
        onConvert?.(inputValue);
      } else {
        // 纯文本转换为 HTML
        const simpleHtml = `<p>${inputValue.replace(/\n/g, "</p><p>")}</p>`;
        onConvert?.(simpleHtml);
      }
    }
  };

  const handleClear = () => {
    if (isMarkdownMode) {
      onMarkdownChange?.("");
    } else {
      setInputValue("");
    }
  };

  return (
    <Card className="p-4 h-full flex flex-col overflow-hidden gap-4">
      <div className="flex items-center justify-between flex-shrink-0">
        <h2 className="text-lg font-semibold">{t("editor.title")}</h2>
        <div className="text-sm text-muted-foreground hidden sm:inline">
          {t("editor.note")}
        </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClear}
            disabled={(isMarkdownMode ? !markdownValue : !inputValue) || isLoading}
            title={t("editor.clear.title", { shortcut: `${isMac ? '⌘' : 'Ctrl'}+E` })}
          >
          <span>{t("editor.clear")}</span>
          <kbd className="ml-2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">{isMac ? '⌘' : 'Ctrl'}</span>E
          </kbd>
        </Button>
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col">
        <Textarea
          ref={textareaRef}
          value={isMarkdownMode ? (markdownValue || "") : inputValue}
          onChange={(e) => {
            if (isMarkdownMode) {
              onMarkdownChange?.(e.target.value);
            } else {
              setInputValue(e.target.value);
            }
          }}
          onPaste={handlePaste}
          placeholder={isMarkdownMode ? t("editor.placeholder.markdown") : t("editor.placeholder.html")}
          className="flex-1 font-mono text-sm resize-none overflow-y-auto"
          disabled={isLoading}
        />
      </div>

      {!isMarkdownMode && (
        <div className="flex gap-2 flex-shrink-0">
          <Button 
            onClick={handleManualConvert}
            disabled={!inputValue || isLoading}
            className="flex-1"
          >
            {isLoading ? t("editor.converting") : t("editor.convert")}
          </Button>
        </div>
      )}
    </Card>
  );
}
