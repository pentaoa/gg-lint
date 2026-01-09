"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Languages className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">中</span>
      </Button>
    );
  }

  const toggle = () => {
    const next = language === "zh" ? "en" : "zh";
    setLanguage(next);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggle} 
      title={language === "zh" ? "切换到英文" : "Switch to Chinese"}
    >
      <Languages className="h-4 w-4" />
      <span className="ml-2 hidden sm:inline">{language === "zh" ? "中" : "EN"}</span>
    </Button>
  );
}

