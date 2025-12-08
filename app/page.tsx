"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import EditorInput from "@/components/EditorInput";
import MarkdownPreview from "@/components/MarkdownPreview";
import CopyButton from "@/components/CopyButton";
import { convertHtmlToMarkdown, adjustHeadingLevel } from "@/lib/markdown";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function Home() {
  const [markdown, setMarkdown] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">GG Lint</h1>
              <p className="text-sm text-muted-foreground">
                一键修复网页复制的 Markdown 格式
              </p>
            </div>
            <a
              href="https://github.com/pentaoa/gg-lint"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 h-[calc(100vh-120px)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Left: Input */}
          <EditorInput onConvert={handleConvert} isLoading={isLoading} />

          {/* Right: Preview */}
          <div className="flex flex-col gap-4 h-full overflow-hidden">
            <div className="flex-1 min-h-0">
              <MarkdownPreview markdown={markdown} />
            </div>
            
            {/* Control Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <div className="flex gap-1 flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAdjustHeading("increase")}
                  disabled={!markdown || isLoading}
                  className="flex-1"
                  title="提升标题层级（# → ##）"
                >
                  <ChevronUp className="h-4 w-4 mr-1" />
                  提升层级
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAdjustHeading("decrease")}
                  disabled={!markdown || isLoading}
                  className="flex-1"
                  title="降低标题层级（## → #）"
                >
                  <ChevronDown className="h-4 w-4 mr-1" />
                  降低层级
                </Button>
              </div>
              <div className="flex-1">
                <CopyButton markdown={markdown} disabled={isLoading} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-8 py-6 text-center text-sm text-muted-foreground">
        <p>
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
      </footer>
    </div>
  );
}
