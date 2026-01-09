"use client";

import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { useLanguage } from "@/lib/language-context";
import "katex/dist/katex.min.css";

interface MarkdownPreviewProps {
  markdown: string;
  error?: string;
  isMarkdownMode?: boolean;
}

export default function MarkdownPreview({ markdown, error, isMarkdownMode = false }: MarkdownPreviewProps) {
  const { t } = useLanguage();
  
  return (
    <Card className="p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-shrink-0">
        <h2 className="text-lg font-semibold">{t("preview.title")}</h2>
        <div className="text-sm text-muted-foreground hidden sm:inline">
          {t("preview.note")}
        </div>
      </div>
      <div className="border rounded-lg p-6 bg-background">
        {error ? (
          <div className="flex min-h-[200px] items-center justify-center py-20">
            <div className="text-center space-y-2">
              <div className="text-red-600 dark:text-red-400 font-medium">{error}</div>
              <div className="text-sm text-muted-foreground">{t("preview.error.suggestion")}</div>
            </div>
          </div>
        ) : markdown ? (
          <div className="markdown-preview max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex min-h-[200px] items-center justify-center py-20 text-muted-foreground">
            {t("preview.empty")}
          </div>
        )}
      </div>

      {markdown && !isMarkdownMode && (
        <div className="p-3 bg-muted rounded-lg flex-shrink-0">
          <details className="cursor-pointer">
            <summary className="text-sm font-medium">
              {t("preview.source")}
            </summary>
            <pre className="mt-2 text-xs overflow-auto max-h-40 whitespace-pre-wrap break-words">
              {markdown}
            </pre>
          </details>
        </div>
      )}
    </Card>
  );
}
