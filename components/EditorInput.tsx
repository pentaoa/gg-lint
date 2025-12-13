"use client";

import { useRef, useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EditorInputProps {
  onConvert: (html: string) => void;
  isLoading?: boolean;
  isMac?: boolean;
}

export default function EditorInput({ onConvert, isLoading, isMac = false }: EditorInputProps) {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keyboard shortcut for clear (Cmd+E / Ctrl+E)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;
      
      if (modifierKey && e.key === 'e' && !e.shiftKey && inputValue && !isLoading) {
        e.preventDefault();
        setInputValue("");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputValue, isLoading, isMac]);

  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    const clipboardData = e.clipboardData;
    const htmlData = clipboardData.getData("text/html");
    const textData = clipboardData.getData("text/plain");

    if (htmlData) {
      // 如果有 HTML 数据，直接使用
      setInputValue(htmlData);
      onConvert(htmlData);
    } else if (textData) {
      // 如果只有纯文本，包装成简单 HTML
      const simpleHtml = `<p>${textData.replace(/\n/g, "</p><p>")}</p>`;
      setInputValue(textData);
      onConvert(simpleHtml);
    }
  };

  const handleManualConvert = () => {
    if (inputValue.trim()) {
      // 检查是否已经是 HTML
      const isHtml = inputValue.trim().startsWith("<");
      if (isHtml) {
        onConvert(inputValue);
      } else {
        // 纯文本转换为 HTML
        const simpleHtml = `<p>${inputValue.replace(/\n/g, "</p><p>")}</p>`;
        onConvert(simpleHtml);
      }
    }
  };

  const handleClear = () => {
    setInputValue("");
  };

  return (
    <Card className="p-4 h-full flex flex-col overflow-hidden mt-6 gap-4">
      <div className="flex items-center justify-between flex-shrink-0">
        <h2 className="text-lg font-semibold">原始文本</h2>
        <div className="text-sm text-muted-foreground hidden sm:inline">
          注：选中文字复制时，请尽量包括上下文信息
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleClear}
          disabled={!inputValue || isLoading}
          title={`清空输入 (${isMac ? '⌘' : 'Ctrl'}+E)`}
        >
          <span>清空</span>
          <kbd className="ml-2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">{isMac ? '⌘' : 'Ctrl'}</span>E
          </kbd>
        </Button>
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col">
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPaste={handlePaste}
          placeholder="在此粘贴复制的文本..."
          className="flex-1 font-mono text-sm resize-none overflow-y-auto"
          disabled={isLoading}
        />
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <Button 
          onClick={handleManualConvert}
          disabled={!inputValue || isLoading}
          className="flex-1"
        >
          {isLoading ? "转换中..." : "转换"}
        </Button>
      </div>
    </Card>
  );
}
