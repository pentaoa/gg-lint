"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import EditorInput from "@/components/EditorInput";
import MarkdownPreview from "@/components/MarkdownPreview";
import CopyButton, { type CopyButtonHandle } from "@/components/CopyButton";
import { convertHtmlToMarkdown, adjustHeadingLevel } from "@/lib/markdown";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function Home() {
  const [markdown, setMarkdown] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const copyButtonRef = useRef<CopyButtonHandle>(null);

  // Detect OS for keyboard shortcuts
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;
      
      // Cmd/Ctrl + K: Copy Markdown
      if (modifierKey && e.key === 'k' && !e.shiftKey && !isLoading && markdown) {
        e.preventDefault();
        handleCopyMarkdown();
        return;
      }
      
      // Cmd/Ctrl + Shift + Up/Down: Adjust heading levels
      if (modifierKey && e.shiftKey && !isLoading && markdown) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          handleAdjustHeading('increase');
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          handleAdjustHeading('decrease');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [markdown, isLoading, isMac]);

  const handleConvert = async (html: string) => {
    setIsLoading(true);
    try {
      const result = await convertHtmlToMarkdown(html);
      setMarkdown(result);
    } catch (error) {
      console.error("转换失败:", error);
      setMarkdown("转换失败，请检查输入内容");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdjustHeading = async (direction: "increase" | "decrease") => {
    if (!markdown) return;
    setIsLoading(true);
    try {
      const result = await adjustHeadingLevel(markdown, direction);
      setMarkdown(result);
    } catch (error) {
      console.error("调整失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMarkdown = async () => {
    if (!markdown || !copyButtonRef.current) return;
    await copyButtonRef.current.triggerCopy();
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 overflow-hidden">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm flex-shrink-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight font-serif">GG Lint</h1>
              <p className="text-sm text-muted-foreground">
                格式化和修复 AI 生成的网页富文本
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0 overflow-hidden">
        <div className="container mx-auto px-4 py-6 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left: Input */}
            <div className="flex flex-col min-h-0">
              <EditorInput onConvert={handleConvert} isLoading={isLoading} isMac={isMac} />
            </div>

            {/* Right: Preview */}
            <div className="flex flex-col gap-4 min-h-0">
              <div className="flex-1 min-h-0">
                <MarkdownPreview markdown={markdown} />
              </div>
              
              {/* Control Buttons */}
              <div className="flex gap-2 flex-shrink-0">
                <div className="flex gap-1 flex-1">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleAdjustHeading("increase")}
                    disabled={!markdown || isLoading}
                    className="flex-1"
                    title={`提升标题层级 (${isMac ? '⌘' : 'Ctrl'}+Shift+↑)`}
                  >
                    <ChevronUp className="h-4 w-4 mr-1" />
                    提升层级
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleAdjustHeading("decrease")}
                    disabled={!markdown || isLoading}
                    className="flex-1"
                    title={`降低标题层级 (${isMac ? '⌘' : 'Ctrl'}+Shift+↓)`}
                  >
                    <ChevronDown className="h-4 w-4 mr-1" />
                    降低层级
                  </Button>
                </div>
                <div className="flex-1">
                  <CopyButton 
                    ref={copyButtonRef}
                    markdown={markdown} 
                    disabled={isLoading}
                    isMac={isMac}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm flex-shrink-0 py-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4 space-y-2">
          <p className="text-xs leading-relaxed">
            我们将定期对 <strong className="text-foreground">Gemini</strong>、
            <strong className="text-foreground">ChatGPT</strong>、
            <strong className="text-foreground">Grok</strong> 等主流平台进行格式配准
            <br />
            如果遇到问题，请在{" "}
            <a
              href="https://github.com/pentaoa/gg-lint/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground font-medium"
            >
              GitHub Issues
            </a>{" "}
            反馈
          </p>
          <p className="text-xs">
            我们不会上传您的数据 |{" "}
            <a
              href="https://github.com/pentaoa/gg-lint"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              © 2025 pentaoa
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
