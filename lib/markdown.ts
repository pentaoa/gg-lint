"use server";

import TurndownService from "turndown";
import { unified } from "unified";
import { MathMLToLaTeX } from "mathml-to-latex";
import remarkParse from "remark-parse";

/**
 * 修复 mathml-to-latex 转换中缺失反斜杠的 LaTeX 命令
 */
function fixLaTeXCommands(latex: string): string {
  // 常见的数学符号和命令，需要添加反斜杠
  const commandsToFix = [
    'sim', 'approx', 'equiv', 'cong', 'propto',
    'leq', 'geq', 'neq', 'subset', 'supset',
    'in', 'ni', 'notin', 'cup', 'cap',
    'infty', 'partial', 'nabla', 'forall', 'exists',
    'alpha', 'beta', 'gamma', 'delta', 'epsilon',
    'theta', 'lambda', 'mu', 'sigma', 'omega',
    'sum', 'prod', 'int', 'lim', 'max', 'min',
    'sin', 'cos', 'tan', 'log', 'ln', 'exp'
  ];
  
  let fixed = latex;
  
  // 为每个命令添加反斜杠（如果缺失）
  // 使用词边界匹配，避免误替换（如 "simple" 中的 "sim"）
  commandsToFix.forEach(cmd => {
    // 匹配：空格或符号后的命令词，且前面没有反斜杠
    const regex = new RegExp(`(?<![\\\\a-zA-Z])\\b${cmd}\\b(?![a-zA-Z])`, 'g');
    fixed = fixed.replace(regex, `\\${cmd}`);
  });
  
  return fixed;
}
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import remarkMath from "remark-math";
import type { Root, Heading, Text, PhrasingContent } from "mdast";
import { visit } from "unist-util-visit";

/**
 * 自定义 remark 插件：修复标题层级（可选）
 * 仅在标题层级异常时才调整（例如从 h4 开始）
 * 保留原始层级关系
 */
function remarkFixHeadings() {
  return (tree: Root) => {
    const headings: Heading[] = [];
    
    // 收集所有标题
    visit(tree, "heading", (node: Heading) => {
      headings.push(node);
    });

    // 只有在标题不是从合理层级开始时才调整
    if (headings.length > 0) {
      const minDepth = Math.min(...headings.map(h => h.depth));
      
      // 只有当最小层级 > 3 时才调整（例如从 h4 开始的情况）
      // h1, h2, h3 开始都是合理的，保持原样
      if (minDepth > 3) {
        const offset = minDepth - 1; // 调整到从 h1 开始
        headings.forEach(heading => {
          heading.depth = Math.min(6, Math.max(1, heading.depth - offset)) as 1 | 2 | 3 | 4 | 5 | 6;
        });
      }
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

    // 忽略 KaTeX 渲染的 HTML 部分（避免重复）
    turndownService.addRule('ignoreKatexHtml', {
      filter: (node) => {
        return node.nodeName === 'SPAN' && 
               (node.classList.contains('katex-html') || 
                node.classList.contains('katex-mathml'));
      },
      replacement: () => '' // 完全忽略，由父级处理
    });

    // 添加 KaTeX 块级公式支持（katex-display）
    turndownService.addRule('katexDisplay', {
      filter: (node) => {
        return node.nodeName === 'SPAN' && node.classList.contains('katex-display');
      },
      replacement: (content, node: any) => {
        // 优先从 MathML 的 annotation 节点提取原始 LaTeX
        const annotation = node.querySelector('.katex-mathml math semantics annotation[encoding="application/x-tex"]');
        if (annotation && annotation.textContent) {
          return '\n\n$$\n' + annotation.textContent.trim() + '\n$$\n\n';
        }
        // 使用 mathml-to-latex 转换完整的 MathML 结构
        const mathElement = node.querySelector('.katex-mathml math');
        if (mathElement) {
          try {
            const mathMLString = mathElement.outerHTML;
            let latex = MathMLToLaTeX.convert(mathMLString);
            latex = fixLaTeXCommands(latex);
            return '\n\n$$\n' + latex.trim() + '\n$$\n\n';
          } catch (error) {
            console.error('MathML to LaTeX conversion error:', error);
          }
        }
        // 最终降级：提取纯文本（会丢失结构）
        const mathmlNode = node.querySelector('.katex-mathml math semantics mrow');
        if (mathmlNode) {
          const mathText = mathmlNode.textContent || '';
          return '\n\n$$\n' + mathText.trim() + '\n$$\n\n';
        }
        return content;
      }
    });

    // 添加 KaTeX 行内公式支持（.katex 容器）
    turndownService.addRule('katexInline', {
      filter: (node) => {
        return node.nodeName === 'SPAN' && 
               node.classList.contains('katex') &&
               !node.closest('.katex-display');
      },
      replacement: (content, node: any) => {
        // 优先从 MathML 的 annotation 节点提取原始 LaTeX
        const annotation = node.querySelector('.katex-mathml math semantics annotation[encoding="application/x-tex"]');
        if (annotation && annotation.textContent) {
          return '$' + annotation.textContent.trim() + '$';
        }
        // 使用 mathml-to-latex 转换完整的 MathML 结构
        const mathElement = node.querySelector('.katex-mathml math');
        if (mathElement) {
          try {
            const mathMLString = mathElement.outerHTML;
            let latex = MathMLToLaTeX.convert(mathMLString);
            latex = fixLaTeXCommands(latex);
            return '$' + latex.trim() + '$';
          } catch (error) {
            console.error('MathML to LaTeX conversion error:', error);
          }
        }
        // 最终降级：提取纯文本（会丢失结构）
        const mathmlNode = node.querySelector('.katex-mathml math semantics mrow');
        if (mathmlNode) {
          const mathText = mathmlNode.textContent || '';
          return '$' + mathText.trim() + '$';
        }
        return content;
      }
    });

    // 兼容带 data-math 属性的自定义数学块
    turndownService.addRule('mathBlockWithAttr', {
      filter: (node) => {
        return (node.nodeName === 'DIV' || node.nodeName === 'SPAN') && 
               node.classList.contains('math-block') && 
               node.getAttribute('data-math') !== null;
      },
      replacement: (content, node: any) => {
        const math = node.getAttribute('data-math');
        if (math) {
          return '\n$$\n' + math + '\n$$\n';
        }
        return content;
      }
    });

    // 兼容带 data-math 属性的行内公式
    turndownService.addRule('mathInlineWithAttr', {
      filter: (node) => {
        return node.nodeName === 'SPAN' && 
               node.classList.contains('math-inline') && 
               node.getAttribute('data-math') !== null;
      },
      replacement: (content, node: any) => {
        const math = node.getAttribute('data-math');
        if (math) {
          return '$' + math + '$';
        }
        return content;
      }
    });

    const rawMarkdown = turndownService.turndown(html);

    // 第二步：使用 remark 修复和规范化
    const file = await unified()
      .use(remarkParse) // 解析 Markdown
      .use(remarkGfm) // 支持 GitHub Flavored Markdown
      .use(remarkMath) // 解析数学为 AST（inlineMath/math），避免错误转义
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
