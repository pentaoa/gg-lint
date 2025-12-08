# gg-lint

**一键修复网页复制的 Markdown 格式**

专治「从网页复制到 Markdown 后格式全崩」的在线小工具。一键把乱七八糟的网页内容变成干净、规范、可直接用于 Obsidian / Typora / Notion 的 Markdown。

## 特性

- ✅ **零后端**：完全前端运行，无需登录，数据不上传
- ✅ **智能转换**：自动识别 HTML 并转换为标准 Markdown
- ✅ **格式修复**：
  - 自动调整标题层级（从 # 开始）
  - 修复粗体斜体（***text*** → **text**）
  - 统一列表缩进（2 空格）
  - 清理多余空行
  - 修复图片 alt 文本
- ✅ **实时预览**：左侧输入，右侧实时显示效果
- ✅ **层级调整**：一键提升/降低标题层级
- ✅ **一键复制**：复制到剪贴板，直接粘贴使用
- ✅ **响应式设计**：支持桌面和移动设备
- ✅ **PWA 支持**：可安装到桌面，像原生应用一样使用 （待验证)

## 快速开始

### 本地运行

```bash
# 克隆项目
git clone https://github.com/yourusername/gg-lint.git
cd gg-lint

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可使用。

### 构建和部署

```bash
# 构建生产版本
npm run build

# 本地预览（可选）
npm start
```

#### 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/gg-lint)

1. 点击上方按钮
2. 授权 GitHub
3. 一键部署完成

可选增强

* 需要支持化学公式或更丰富的 LaTeX 宏，可添加 KaTeX `macros` 配置到 `rehypeKatex`：
  * 可以把 `rehypeKatex` 调用改为：`[rehypeKatex, { macros: { '\\RR': '\\mathbb{R}' } }]` 等。
* 需要在渲染中允许 HTML 与数学混排（谨慎）：可加入 `rehype-raw` 与 `rehype-sanitize` 做白名单过滤。可以按你的页面安全策略配置。
