import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import rehypeStringify from "rehype-stringify";
import rehypeKatex from "rehype-katex";

/**
 * 自定义 rehype 插件：优化 MathML 输出
 * 确保 MathML 格式正确，适合 Office 软件
 */
function rehypeOptimizeMathML() {
  return (tree: any) => {
    visit(tree, "element", (node: any) => {
      // 处理 math 元素，确保有正确的命名空间
      if (node.tagName === "math") {
        if (!node.properties) {
          node.properties = {};
        }
        if (!node.properties.xmlns) {
          node.properties.xmlns = "http://www.w3.org/1998/Math/MathML";
        }
      }
      
      // 处理 KaTeX 生成的公式容器
      if (node.tagName === "span" && node.properties?.className) {
        const className = Array.isArray(node.properties.className)
          ? node.properties.className.join(" ")
          : node.properties.className;
        
        if (className.includes("katex")) {
          // 查找 MathML 元素并确保命名空间正确
          const findAndFixMathML = (children: any[]): void => {
            for (const child of children || []) {
              if (child.type === "element" && child.tagName === "math") {
                if (!child.properties) {
                  child.properties = {};
                }
                if (!child.properties.xmlns) {
                  child.properties.xmlns = "http://www.w3.org/1998/Math/MathML";
                }
              }
              if (child.children) {
                findAndFixMathML(child.children);
              }
            }
          };
          findAndFixMathML(node.children || []);
        }
      }
    });
  };
}

/**
 * 将 Markdown 转换为适合 Office 软件的 HTML
 * 公式使用 MathML 格式（通过 KaTeX 生成）
 */
export async function convertMarkdownToOfficeHTML(markdown: string): Promise<string> {
  try {
    // 使用 unified 处理流程：Markdown -> HTML
    const htmlResult = await unified()
      .use(remarkParse) // 解析 Markdown
      .use(remarkGfm) // 支持 GitHub Flavored Markdown
      .use(remarkMath) // 解析数学公式
      .use(remarkRehype, { allowDangerousHtml: true }) // 转换为 rehype AST
      .use(rehypeKatex, {
        // KaTeX 配置：生成包含 MathML 的 HTML
        throwOnError: false,
        strict: false,
        // KaTeX 默认会生成 MathML，我们只需要确保配置正确
      })
      .use(rehypeOptimizeMathML) // 优化 MathML 格式
      .use(rehypeStringify, {
        // HTML 输出配置
        allowDangerousHtml: true,
        closeSelfClosing: true,
      })
      .process(markdown);

    let html = String(htmlResult);

    // 第三步：后处理 HTML，确保格式正确
    // 1. 确保所有 MathML 元素都有正确的命名空间
    html = html.replace(
      /<math([^>]*)>/g,
      (match, attrs) => {
        if (!attrs || !attrs.includes('xmlns')) {
          return `<math xmlns="http://www.w3.org/1998/Math/MathML"${attrs ? ' ' + attrs.trim() : ''}>`;
        }
        return match;
      }
    );

    // 2. 优化 KaTeX 生成的公式结构
    // KaTeX 生成的结构：<span class="katex"><span class="katex-html">...</span><span class="katex-mathml"><math>...</math></span></span>
    // 对于 Office 软件，我们保留 MathML，但可以简化包装结构
    // 注意：保留完整结构可能对某些 Office 版本更兼容
    
    // 3. 确保块级公式有正确的 display 属性
    html = html.replace(
      /<span class="katex-display">[\s\S]*?<math([^>]*)>/g,
      (match, attrs) => {
        if (!attrs || !attrs.includes('display')) {
          return match.replace(/<math([^>]*)>/, '<math display="block"$1>');
        }
        return match;
      }
    );

    // 4. 添加基本的 HTML 结构，优化 Office 兼容性
    // Office 软件在粘贴 HTML 时会保留样式，所以我们需要提供完整的 HTML 文档
    const fullHTML = `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:m="http://www.w3.org/1998/Math/MathML">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <style type="text/css">
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 600;
    }
    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }
    h4 { font-size: 1.1em; }
    p {
      margin: 1em 0;
    }
    ul, ol {
      margin: 1em 0;
      padding-left: 2em;
    }
    li {
      margin: 0.5em 0;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
      font-weight: 600;
    }
    code {
      background-color: #f4f4f4;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: "Courier New", monospace;
      font-size: 0.9em;
    }
    pre {
      background-color: #f4f4f4;
      padding: 10px;
      border-radius: 5px;
      overflow-x: auto;
      font-family: "Courier New", monospace;
    }
    pre code {
      background-color: transparent;
      padding: 0;
    }
    /* MathML 样式 */
    math {
      display: inline-block;
      margin: 0 0.2em;
      vertical-align: middle;
    }
    math[display="block"] {
      display: block;
      margin: 1em auto;
      text-align: center;
    }
    /* KaTeX 容器样式（保留以支持渲染） */
    .katex {
      font-size: 1.1em;
    }
    .katex-display {
      margin: 1em 0;
      text-align: center;
    }
    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 1em;
      margin: 1em 0;
      color: #666;
    }
    a {
      color: #0066cc;
      text-decoration: underline;
    }
  </style>
</head>
<body>
${html}
</body>
</html>`;

    return fullHTML;
  } catch (error) {
    console.error("Markdown to Office HTML conversion error:", error);
    throw new Error("转换为 Office 格式失败");
  }
}

/**
 * 提取 Markdown 中的纯文本（用于降级方案）
 */
export async function extractPlainText(markdown: string): Promise<string> {
  // 简单的文本提取：移除 Markdown 语法
  return markdown
    .replace(/^#+\s+/gm, "") // 移除标题标记
    .replace(/\*\*(.*?)\*\*/g, "$1") // 移除粗体
    .replace(/\*(.*?)\*/g, "$1") // 移除斜体
    .replace(/`(.*?)`/g, "$1") // 移除行内代码
    .replace(/```[\s\S]*?```/g, "") // 移除代码块
    .replace(/\$\$([\s\S]*?)\$\$/g, "$1") // 移除块级公式标记
    .replace(/\$(.*?)\$/g, "$1") // 移除行内公式标记
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // 移除链接，保留文本
    .replace(/^\s*[-*+]\s+/gm, "") // 移除列表标记
    .replace(/^\s*\d+\.\s+/gm, "") // 移除有序列表标记
    .trim();
}

