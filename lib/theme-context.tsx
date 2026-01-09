"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "auto";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("auto");
  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("gglint-theme");
      if (stored === "light" || stored === "dark" || stored === "auto") {
        setThemeState(stored);
      } else {
        // 默认使用 auto
        setThemeState("auto");
      }
    } catch {
      // 忽略错误
    }
  }, []);

  // 根据主题设置和系统偏好计算实际主题
  useEffect(() => {
    if (!mounted) return;

    const updateTheme = () => {
      const root = document.documentElement;
      const setThemeColorMeta = (mode: "light" | "dark") => {
        const meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) return;
        meta.setAttribute("content", mode === "dark" ? "#0b1220" : "#ffffff");
      };

      let actualTheme: "light" | "dark";
      if (theme === "auto") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        actualTheme = prefersDark ? "dark" : "light";
      } else {
        actualTheme = theme;
      }

      setEffectiveTheme(actualTheme);

      if (actualTheme === "dark") {
        root.classList.add("dark");
        setThemeColorMeta("dark");
      } else {
        root.classList.remove("dark");
        setThemeColorMeta("light");
      }
    };

    updateTheme();

    // 如果是 auto 模式，监听系统主题变化
    if (theme === "auto") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => {
        const root = document.documentElement;
        const setThemeColorMeta = (mode: "light" | "dark") => {
          const meta = document.querySelector('meta[name="theme-color"]');
          if (!meta) return;
          meta.setAttribute("content", mode === "dark" ? "#0b1220" : "#ffffff");
        };

        if (e.matches) {
          root.classList.add("dark");
          setThemeColorMeta("dark");
          setEffectiveTheme("dark");
        } else {
          root.classList.remove("dark");
          setThemeColorMeta("light");
          setEffectiveTheme("light");
        }
      };

      // 使用现代 API 或降级方案
      if (mq.addEventListener) {
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
      } else {
        // @ts-expect-error - 兼容旧版浏览器
        mq.addListener(handler);
        return () => {
          // @ts-expect-error - 兼容旧版浏览器
          mq.removeListener(handler);
        };
      }
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("gglint-theme", newTheme);
    } catch {
      // 忽略错误
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

