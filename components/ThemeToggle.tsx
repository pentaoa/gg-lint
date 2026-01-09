"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { useLanguage } from "@/lib/language-context";

export default function ThemeToggle() {
  const { theme, setTheme, effectiveTheme } = useTheme();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Sun className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">{t("toggle.theme.auto")}</span>
      </Button>
    );
  }

  const cycleTheme = () => {
    // 循环切换：light -> dark -> auto -> light
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("auto");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    if (theme === "auto") {
      return <Monitor className="h-4 w-4" />;
    }
    return effectiveTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />;
  };

  const getLabel = () => {
    if (theme === "auto") {
      return t("toggle.theme.auto");
    }
    return effectiveTheme === "dark" ? t("toggle.theme.dark") : t("toggle.theme.light");
  };

  const getTitle = () => {
    if (theme === "light") {
      return `${t("toggle.theme.light")} - ${t("toggle.theme.title")}`;
    } else if (theme === "dark") {
      return `${t("toggle.theme.dark")} - ${t("toggle.theme.title")}`;
    } else {
      return `${t("toggle.theme.auto")} (${effectiveTheme === "dark" ? t("toggle.theme.dark") : t("toggle.theme.light")}) - ${t("toggle.theme.title")}`;
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={cycleTheme} 
      title={getTitle()}
    >
      {getIcon()}
      <span className="ml-2 hidden sm:inline">{getLabel()}</span>
    </Button>
  );
}
