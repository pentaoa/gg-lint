"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Language = "zh" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 翻译字典
const translations: Record<Language, Record<string, string>> = {
  zh: {
    "app.title": "GG Lint",
    "app.subtitle": "GPT Generated Content Linter",
    "mode.html": "HTML 粘贴模式",
    "mode.markdown": "Markdown 编辑模式",
    "button.increase": "提升层级",
    "button.decrease": "降低层级",
    "button.copy": "复制 Markdown",
    "button.copy.shortcut": "复制 Markdown ({shortcut})",
    "button.copy.copied": "已复制！",
    "button.copy.failed": "复制失败",
    "button.office": "复制为 Office 格式",
    "button.office.short": "Office",
    "button.office.loading": "转换中...",
    "button.office.copied": "已复制！",
    "button.office.failed": "复制失败，请手动复制内容",
    "button.office.title": "复制为 Office 格式（Word/PowerPoint）",
    "editor.title": "原始文本",
    "editor.note": "注：选中文字复制时，请尽量包括上下文信息",
    "editor.clear": "清空",
    "editor.clear.title": "清空输入 ({shortcut})",
    "editor.placeholder.html": "在此粘贴复制的文本...",
    "editor.placeholder.markdown": "在此输入或粘贴 Markdown 代码...",
    "editor.convert": "转换",
    "editor.converting": "转换中...",
    "preview.title": "预览",
    "preview.note": "请务必注意检查复杂公式的渲染是否正确",
    "preview.empty": "输入或粘贴内容以预览",
    "preview.error.suggestion": "建议分批处理或减少粘贴内容",
    "preview.source": "查看 Markdown 源码",
    "footer.platforms": "我们将定期对 Gemini、ChatGPT、Grok 等主流平台进行格式配准",
    "footer.issue": "如果遇到问题，请在",
    "footer.feedback": "反馈",
    "footer.noUpload": "我们不会上传您的数据",
    "toggle.theme.light": "日",
    "toggle.theme.dark": "月",
    "toggle.theme.auto": "自动",
    "toggle.theme.title": "切换主题",
    "toggle.language.zh": "切换到中文",
    "toggle.language.en": "切换到英文",
  },
  en: {
    "app.title": "GG Lint",
    "app.subtitle": "GPT Generated Content Linter",
    "mode.html": "HTML Paste Mode",
    "mode.markdown": "Markdown Edit Mode",
    "button.increase": "Increase Level",
    "button.decrease": "Decrease Level",
    "button.copy": "Copy Markdown",
    "button.copy.shortcut": "Copy Markdown ({shortcut})",
    "button.copy.copied": "Copied!",
    "button.copy.failed": "Copy failed",
    "button.office": "Copy as Office Format",
    "button.office.short": "Office",
    "button.office.loading": "Converting...",
    "button.office.copied": "Copied!",
    "button.office.failed": "Copy failed, please copy manually",
    "button.office.title": "Copy as Office format (Word/PowerPoint)",
    "editor.title": "Original Text",
    "editor.note": "Note: When copying selected text, please include context information",
    "editor.clear": "Clear",
    "editor.clear.title": "Clear input ({shortcut})",
    "editor.placeholder.html": "Paste copied text here...",
    "editor.placeholder.markdown": "Enter or paste Markdown code here...",
    "editor.convert": "Convert",
    "editor.converting": "Converting...",
    "preview.title": "Preview",
    "preview.note": "Please check that complex formulas are rendered correctly",
    "preview.empty": "Please enter or paste content to preview",
    "preview.error.suggestion": "Suggest processing in batches or reducing pasted content",
    "preview.source": "View Markdown Source",
    "footer.platforms": "We regularly calibrate formats for mainstream platforms like Gemini, ChatGPT, and Grok",
    "footer.issue": "If you encounter issues, please report them on",
    "footer.feedback": "feedback",
    "footer.noUpload": "We do not upload your data",
    "toggle.theme.light": "Light",
    "toggle.theme.dark": "Dark",
    "toggle.theme.auto": "Auto",
    "toggle.theme.title": "Toggle theme",
    "toggle.language.zh": "Switch to Chinese",
    "toggle.language.en": "Switch to English",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("zh");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("gglint-language");
      if (stored === "zh" || stored === "en") {
        setLanguageState(stored);
      } else {
        // 检测浏览器语言
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith("zh")) {
          setLanguageState("zh");
        } else {
          setLanguageState("en");
        }
      }
    } catch {
      // 忽略错误
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("gglint-language", lang);
      // 更新 HTML lang 属性
      document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    } catch {
      // 忽略错误
    }
  };

  // 更新 HTML lang 属性
  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    }
  }, [language, mounted]);

  const t = (key: string, params?: Record<string, string>): string => {
    let text = translations[language]?.[key] || key;
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(`{${paramKey}}`, paramValue);
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

