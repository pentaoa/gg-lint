import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { LanguageProvider } from "@/lib/language-context";
import { ThemeProvider } from "@/lib/theme-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GG lint - GPT Generated Content Linter",
  description: "A simple tool to convert messy HTML from chatbots into clean Markdown format.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "gg-lint",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  // 根据系统主题设置 PWA 主题色（浏览器地址栏等）
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 主题和语言初始化脚本 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                // 主题初始化：支持 light、dark、auto 三种模式
                const stored = localStorage.getItem('gglint-theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                // 验证存储的值是否有效，无效则使用 auto
                const theme = (stored === 'light' || stored === 'dark' || stored === 'auto') ? stored : 'auto';
                const root = document.documentElement;
                const setThemeColorMeta = (mode) => {
                  const meta = document.querySelector('meta[name="theme-color"]');
                  if (!meta) return;
                  meta.setAttribute('content', mode === 'dark' ? '#0b1220' : '#ffffff');
                };
                
                let actualTheme;
                if (theme === 'auto') {
                  actualTheme = prefersDark ? 'dark' : 'light';
                } else {
                  actualTheme = theme;
                }
                
                if (actualTheme === 'dark') {
                  root.classList.add('dark');
                  setThemeColorMeta('dark');
                } else {
                  root.classList.remove('dark');
                  setThemeColorMeta('light');
                }
                
                // 监听系统主题变化（仅当主题为 auto 时）
                if (theme === 'auto') {
                  const mq = window.matchMedia('(prefers-color-scheme: dark)');
                  const handler = (e) => {
                    if (e.matches) { 
                      root.classList.add('dark'); 
                      setThemeColorMeta('dark'); 
                    } else { 
                      root.classList.remove('dark'); 
                      setThemeColorMeta('light'); 
                    }
                  };
                  if (mq.addEventListener) {
                    mq.addEventListener('change', handler);
                  } else {
                    mq.addListener(handler);
                  }
                }
                
                // 语言初始化：优先使用 localStorage，其次检测浏览器语言
                const storedLang = localStorage.getItem('gglint-language');
                if (storedLang === 'zh' || storedLang === 'en') {
                  root.lang = storedLang === 'zh' ? 'zh-CN' : 'en';
                } else {
                  const browserLang = navigator.language.toLowerCase();
                  const lang = browserLang.startsWith('zh') ? 'zh-CN' : 'en';
                  root.lang = lang;
                }
              } catch {}
            })();`,
          }}
        />
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
