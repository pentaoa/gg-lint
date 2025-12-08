"use server";

import TurndownService from "turndown";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import type { Root, Heading, Text, PhrasingContent } from "mdast";
import { visit } from "unist-util-visit";

/**
 * 自定义 remark 插件：修复标题层级
 * 确保标题从 # 开始，最多 6 级
 */
function remarkFixHeadings() {
  return (tree: Root) => {
    const headings: Heading[] = [];
    
    // 收集所有标题
    visit(tree, "heading", (node: Heading) => {
      headings.push(node);
    });

    // 重新计算层级
    if (headings.length > 0) {
      const minDepth = Math.min(...headings.map(h => h.depth));
      headings.forEach(heading => {
        // 调整为从 1 开始，最多 6 级
        heading.depth = Math.min(6, Math.max(1, heading.depth - minDepth + 1)) as 1 | 2 | 3 | 4 | 5 | 6;
      });
    }
  };
}

/**
 * 自定义 remark 插件：修复粗体和斜体
 * 将 ***text*** 规范化为 **text** 或 *text*
 */
function remarkFixEmphasis() {
  return (tree: Root) => {
    visit(tree, ["strong", "emphasis"], (node: any) => {
      // 如果 strong 里面嵌套 emphasis 或反之，取外层
      if (node.type === "strong" && node.children) {
        const hasEmphasis = node.children.some((child: any) => child.type === "emphasis");
        if (hasEmphasis) {
          // 保留 strong，移除内部 emphasis
          node.children = node.children.flatMap((child: any) => {
            if (child.type === "emphasis") {
              return child.children || [];
            }
            return child;
          });
        }
      }
    });
  };
}

/**
 * 自定义 remark 插件：清理多余空行
 * 最多保留 1 个空行
 */
function remarkCleanWhitespace() {
  return (tree: Root) => {
    // 移除连续的空段落
    if (tree.children) {
      const filtered = [];
      let lastWasBreak = false;
      
      for (const child of tree.children) {
        if (child.type === "paragraph" && child.children.length === 0) {
          if (!lastWasBreak) {
            filtered.push(child);
            lastWasBreak = true;
          }
        } else {
          filtered.push(child);
          lastWasBreak = false;
        }
      }
      
      tree.children = filtered;
    }
  };
}

/**
 * 自定义 remark 插件：修复图片 alt
 */
function remarkFixImages() {
  return (tree: Root) => {
    visit(tree, "image", (node: any) => {
      if (!node.alt || node.alt.trim() === "") {
        // 从 URL 中提取文件名作为 alt
        const url = node.url || "";
        const filename = url.split("/").pop()?.split("?")[0] || "image";
        node.alt = filename;
      }
    });
  };
}

/**
 * HTML 转 Markdown 的核心函数
 */
export async function convertHtmlToMarkdown(html: string): Promise<string> {
  try {
    // 第一步：使用 Turndown 将 HTML 转为原始 Markdown
    const turndownService = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      bulletListMarker: "-",
    });

    // 添加 GFM 表格支持
    const turndownPluginGfm = require('turndown-plugin-gfm');
    const gfmTables = turndownPluginGfm.tables;
    turndownService.use(gfmTables);

    const rawMarkdown = turndownService.turndown(html);

    // 第二步：使用 remark 修复和规范化
    const file = await unified()
      .use(remarkParse) // 解析 Markdown
      .use(remarkGfm) // 支持 GitHub Flavored Markdown
      .use(remarkFixHeadings) // 修复标题层级
      .use(remarkFixEmphasis) // 修复粗体斜体
      .use(remarkCleanWhitespace) // 清理空行
      .use(remarkFixImages) // 修复图片 alt
      .use(remarkStringify, {
        bullet: "-",
        emphasis: "*",
        strong: "*",
        listItemIndent: "one",
      }) // 转回 Markdown
      .process(rawMarkdown);

    return String(file);
  } catch (error) {
    console.error("Markdown conversion error:", error);
    throw new Error("转换失败，请检查输入内容");
  }
}

/**
 * 调整标题层级
 */
export async function adjustHeadingLevel(
  markdown: string,
  direction: "increase" | "decrease"
): Promise<string> {
  try {
    const file = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(() => (tree: Root) => {
        visit(tree, "heading", (node: Heading) => {
          if (direction === "increase") {
            node.depth = Math.max(1, node.depth - 1) as 1 | 2 | 3 | 4 | 5 | 6;
          } else {
            node.depth = Math.min(6, node.depth + 1) as 1 | 2 | 3 | 4 | 5 | 6;
          }
        });
      })
      .use(remarkStringify, {
        bullet: "-",
        emphasis: "*",
        strong: "*",
        listItemIndent: "one",
      })
      .process(markdown);

    return String(file);
  } catch (error) {
    console.error("Heading adjustment error:", error);
    throw new Error("标题层级调整失败");
  }
}
