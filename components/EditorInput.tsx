"use client";

import { useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EditorInputProps {
  onConvert: (html: string) => void;
  isLoading?: boolean;
}

export default function EditorInput({ onConvert, isLoading }: EditorInputProps) {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    <Card className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">原始文本</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleClear}
          disabled={!inputValue || isLoading}
        >
          清空
        </Button>
      </div>
      
      <Textarea
        ref={textareaRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onPaste={handlePaste}
        placeholder="在此粘贴或输入内容..."
        className="flex-1 min-h-[400px] font-mono text-sm resize-none"
        disabled={isLoading}
      />

      <div className="flex gap-2">
        <Button 
          onClick={handleManualConvert}
          disabled={!inputValue || isLoading}
          className="flex-1"
        >
          {isLoading ? "转换中..." : "手动转换"}
        </Button>
      </div>
    </Card>
  );
}
