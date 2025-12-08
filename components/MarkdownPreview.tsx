"use client";

import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

interface MarkdownPreviewProps {
  markdown: string;
}

export default function MarkdownPreview({ markdown }: MarkdownPreviewProps) {
  return (
    <Card className="p-6 h-full flex flex-col overflow-hidden">
      <h2 className="text-lg font-semibold mb-4 flex-shrink-0">预览</h2>
      
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden border rounded-lg p-6 bg-background">
        {markdown ? (
          <div className="markdown-preview max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            粘贴或输入内容后，预览将显示在这里
          </div>
        )}
      </div>

      {markdown && (
        <div className="mt-3 p-3 bg-muted rounded-lg flex-shrink-0">
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
