"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    const next = !isDark;
    setIsDark(next);
    const setThemeColorMeta = (mode: 'dark' | 'light') => {
      const meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) return;
      meta.setAttribute('content', mode === 'dark' ? '#0b1220' : '#ffffff');
    };
    if (next) {
      root.classList.add("dark");
      setThemeColorMeta('dark');
      try { localStorage.setItem("gglint-theme", "dark"); } catch {}
    } else {
      root.classList.remove("dark");
      setThemeColorMeta('light');
      try { localStorage.setItem("gglint-theme", "light"); } catch {}
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={toggle} title={isDark ? "切换到浅色" : "切换到深色"}>
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="ml-2 hidden sm:inline">{isDark ? "日" : "夜"}</span>
    </Button>
  );
}
