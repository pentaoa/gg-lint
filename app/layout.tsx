import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
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
  title: "gg-lint - Markdown 格式修复工具",
  description: "把由 Chatbot 生成的富文本网页转换成干净、规范的 Markdown，支持 Obsidian、Typora、Notion",
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
        {/* 主题初始化脚本：优先使用 localStorage，其次跟随系统 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const stored = localStorage.getItem('gglint-theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const theme = stored || (prefersDark ? 'dark' : 'light');
                const root = document.documentElement;
                const setThemeColorMeta = (mode) => {
                  const meta = document.querySelector('meta[name="theme-color"]');
                  if (!meta) return;
                  meta.setAttribute('content', mode === 'dark' ? '#0b1220' : '#ffffff');
                };
                if (theme === 'dark') {
                  root.classList.add('dark');
                  setThemeColorMeta('dark');
                } else {
                  root.classList.remove('dark');
                  setThemeColorMeta('light');
                }
                // 监听系统主题变化（仅当未固定用户选择时）
                if (!stored) {
                  const mq = window.matchMedia('(prefers-color-scheme: dark)');
                  const handler = (e) => {
                    if (e.matches) { root.classList.add('dark'); setThemeColorMeta('dark'); }
                    else { root.classList.remove('dark'); setThemeColorMeta('light'); }
                  };
                  mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);
                }
              } catch {}
            })();`,
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
