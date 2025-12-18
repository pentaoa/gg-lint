"use client";

import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface MarkdownPreviewProps {
  markdown: string;
  error?: string;
}

export default function MarkdownPreview({ markdown, error }: MarkdownPreviewProps) {
  return (
    <Card className="p-4 flex flex-col mt-6 gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">预览</h2>
        <div className="text-sm text-muted-foreground hidden sm:inline">
          请务必注意检查复杂公式的渲染是否正确
        </div>
      </div>
      <div className="border rounded-lg p-6 bg-background">
        {error ? (
          <div className="flex h-[calc(100vh-27.5rem)] items-center justify-center py-20">
            <div className="text-center space-y-2">
              <div className="text-red-600 dark:text-red-400 font-medium">{error}</div>
              <div className="text-sm text-muted-foreground">建议分批处理或减少粘贴内容</div>
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
          <div className="flex h-[calc(100vh-27.5rem)] items-center justify-center py-20 text-muted-foreground">
            粘贴内容以预览
          </div>
        )}
      </div>

      {markdown && (
        <div className="p-3 bg-muted rounded-lg flex-shrink-0">
          <details className="cursor-pointer">
            <summary className="text-sm font-medium">
              查看 Markdown 源码
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
