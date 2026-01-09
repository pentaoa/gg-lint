"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import EditorInput from "@/components/EditorInput";
import MarkdownPreview from "@/components/MarkdownPreview";
import CopyButton, { type CopyButtonHandle } from "@/components/CopyButton";
import OfficeCopyButton, { type OfficeCopyButtonHandle } from "@/components/OfficeCopyButton";
import { convertHtmlToMarkdown, adjustHeadingLevel } from "@/lib/markdown";
import { ChevronUp, ChevronDown } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import ModeToggle from "@/components/ModeToggle";
import { useLanguage } from "@/lib/language-context";

export default function Home() {
  const { t, language } = useLanguage();
  const [markdown, setMarkdown] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isMac, setIsMac] = useState(false);
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  const [markdownInput, setMarkdownInput] = useState("");
  const copyButtonRef = useRef<CopyButtonHandle>(null);
  const officeCopyButtonRef = useRef<OfficeCopyButtonHandle>(null);

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
    if (isMarkdownMode) {
      // Markdown 模式下，直接使用输入的内容
      return;
    }
    
    setIsLoading(true);
    setError("");
    try {
      const result = await convertHtmlToMarkdown(html);
      setMarkdown(result);
    } catch (error) {
      console.error("转换失败:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes("Body exceeded") || errorMessage.includes("body size limit")) {
        setError("输入的内容过大，超出限制 (2MB)");
        setMarkdown("");
      } else {
        setError("转换失败，请检查输入内容");
        setMarkdown("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Markdown 模式下，直接更新 markdown 状态
  useEffect(() => {
    if (isMarkdownMode) {
      setMarkdown(markdownInput);
      setError("");
    }
  }, [markdownInput, isMarkdownMode]);

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight font-serif">{t("app.title")}</h1>
              <p className="text-sm text-muted-foreground hidden sm:inline">
                {t("app.subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="hidden sm:block">
                <ModeToggle 
                  isMarkdownMode={isMarkdownMode}
                  onModeChange={(checked) => {
                    setIsMarkdownMode(checked);
                    if (checked) {
                      setMarkdownInput("");
                      setMarkdown("");
                      setError("");
                    } else {
                      setMarkdownInput("");
                      setMarkdown("");
                      setError("");
                    }
                  }}
                />
              </div>
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
          {/* Mobile Mode Toggle */}
          <div className="sm:hidden mt-3 flex justify-center">
            <ModeToggle 
              isMarkdownMode={isMarkdownMode}
              onModeChange={(checked) => {
                setIsMarkdownMode(checked);
                if (checked) {
                  setMarkdownInput("");
                  setMarkdown("");
                  setError("");
                } else {
                  setMarkdownInput("");
                  setMarkdown("");
                  setError("");
                }
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
            {/* Left: Input */}
            <div className="flex flex-col">
              <div className="sticky top-24 h-[calc(100vh-14rem)]">
                {isMarkdownMode ? (
                  <EditorInput 
                    markdownValue={markdownInput}
                    onMarkdownChange={setMarkdownInput}
                    isLoading={isLoading} 
                    isMac={isMac}
                    isMarkdownMode={true}
                  />
                ) : (
                  <EditorInput 
                    onConvert={handleConvert} 
                    isLoading={isLoading} 
                    isMac={isMac}
                    isMarkdownMode={false}
                  />
                )}
              </div>
            </div>

            {/* Right: Preview */}
            <div className="flex flex-col">
              <MarkdownPreview markdown={markdown} error={error} isMarkdownMode={isMarkdownMode} />
              
              {/* Control Buttons */}
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleAdjustHeading("increase")}
                    disabled={!markdown || isLoading}
                    className="flex-1"
                    title={`${t("button.increase")} (${isMac ? '⌘' : 'Ctrl'}+Shift+↑)`}
                  >
                    <ChevronUp className="h-4 w-4 mr-1" />
                    {t("button.increase")}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleAdjustHeading("decrease")}
                    disabled={!markdown || isLoading}
                    className="flex-1"
                    title={`${t("button.decrease")} (${isMac ? '⌘' : 'Ctrl'}+Shift+↓)`}
                  >
                    <ChevronDown className="h-4 w-4 mr-1" />
                    {t("button.decrease")}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <OfficeCopyButton 
                      ref={officeCopyButtonRef}
                      markdown={isMarkdownMode ? markdownInput : markdown} 
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex-1">
                    <CopyButton 
                      ref={copyButtonRef}
                      markdown={isMarkdownMode ? markdownInput : markdown} 
                      disabled={isLoading}
                      isMac={isMac}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm mt-8 py-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4 space-y-2">
          <p className="text-xs leading-relaxed">
            {t("footer.platforms")}
            <br />
            {t("footer.issue")}{" "}
            <a
              href="https://github.com/pentaoa/gg-lint/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground font-medium"
            >
              GitHub Issues
            </a>{" "}
            {t("footer.feedback")}
          </p>
          <p className="text-xs">
            {t("footer.noUpload")} |{" "}
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
