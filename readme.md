# React Page Lite

A lightweight React-based static site generator with islands architecture.

Generate static HTML with selective interactivity - JavaScript only where you need it.

## Quick Start

```bash
npx react-page-lite my-app
cd my-app
npm run buildAndWatch
```

Then open `docs/index.html` in your browser.

## Features

- ⚡ **Static-First**: Pure HTML by default, SEO-friendly
- 🏝️ **Islands Architecture**: Add interactivity with `<Island>` wrapper
- 🎯 **Simple**: TypeScript + Tailwind + React, zero config
- 🚀 **Deploy Anywhere**: Just copy the output folder to any host
- 🔧 **Auto-Discovery**: Components are automatically bundled
- ⚙️ **Configurable**: Custom output directory via `config.json`

## Usage

**1. Create a page** (returns full HTML document):

```tsx
// src/pages/index.tsx
const HomePage = () => (
  <html lang="en">
    <head>
      <title>My Site</title>
      <link rel="stylesheet" href="./styles.css" />
    </head>
    <body>
      <h1>Static Content</h1>
    </body>
  </html>
);

export default HomePage;
```

**2. Add interactivity with islands:**

```tsx
import { Island } from "@/Island";
import { Counter } from "@/components/Counter";

<Island>
  <Counter />
</Island>
```

**3. Create interactive components:**

```tsx
// src/components/Counter.tsx
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;
}
```

Props are automatically serialized for hydration.

## Project Structure

```
src/
├── pages/              # HTML pages (export default function)
│   ├── index.tsx       # → docs/index.html
│   └── demo.tsx        # → docs/demo.html
├── components/         # Interactive components (auto-discovered)
│   └── Counter.tsx     # Example interactive component
└── styles/
    └── globals.css     # Tailwind input

docs/                   # Build output (configurable)
├── index.html         # Static HTML
├── demo.html          # Demo page
├── styles.css         # Processed CSS
└── islandRender.js    # Bundled interactive components

_internal/              # Build system
config.json             # Configuration file
```

**Configuration** (`config.json`):
```json
{
  "outputDir": "docs",  // Change to "dist", "build", etc.
  "buildOptions": {
    "minify": true,
    "sourcemap": false
  }
}
```

Perfect for GitHub Pages with `"outputDir": "docs"`.

## How It Works

**Build Time:**
- Renders pages to static HTML with proper formatting
- Auto-discovers components and bundles into `islandRender.js`
- Processes Tailwind CSS and purges unused styles

**Runtime:**
- Static HTML loads instantly (SEO-friendly, no JavaScript required)
- Islands hydrate progressively on the client
- Only interactive components download/execute JavaScript

## Development

**Commands:**
- `npm run buildAndWatch` - Watch mode (rebuilds on file changes)
- `node _internal/build.js` - One-time build

**Structure:**
- **Pages:** Create `.tsx` in `src/pages/` → generates HTML files
- **Components:** Create `.tsx` in `src/components/` → auto-bundled for islands
- **Styling:** Use Tailwind classes (automatically purged)
- **Imports:** TypeScript paths (`@/Island`, `@/components/Counter`)

## Deployment

Copy the entire output folder to any static host:

```bash
# Default output: docs/ folder
cp -r docs/ /your/web/server/

# Or deploy to:
# - GitHub Pages (use outputDir: "docs")
# - Netlify, Vercel, Cloudflare Pages
# - Any CDN or static hosting
```

## Use Cases

Perfect for:
- Marketing websites
- Landing pages
- Documentation sites
- Portfolios

Not for: Apps requiring authentication, databases, or server-side logic.

