# gg-lint

**Fix Markdown formatting from web copy with one click**

An online tool designed to fix the mess when copying web content to Markdown. Transform chaotic web content into clean, standardized Markdown ready for use in Obsidian, Typora, or Notion.

## Features

- **No backend**: Runs entirely in the browser, no login required, data never uploaded
- **Intelligent conversion**: Automatically detects HTML and converts to standard Markdown
- **Real-time preview**: Input on the left, live preview on the right
- **Heading adjustment**: Quickly increase or decrease heading levels
- **Responsive design**: Supports both desktop and mobile devices
- **PWA support**: Can be installed on desktop (Windows only)
- **Citation removal**: Intelligently removes citation numbers from chatbots like Gemini
- **Complex formula support**: Handles advanced mathematical expressions

## Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/gg-lint.git
cd gg-lint

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the application.

### Build and Deploy

```bash
# Build for production
npm run build

# Preview locally (optional)
npm start
```

#### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/gg-lint)

1. Click the button above
2. Authorize GitHub
3. One-click deployment complete
