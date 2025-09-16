# React Page Lite

A lightweight React-based static site generator with islands architecture.

Generate static HTML with selective interactivity - JavaScript only where you need it.

## Features

- ⚡ **Static-First**: Pure HTML by default, SEO-friendly
- 🏝️ **Islands Architecture**: Add interactivity with `<Island>` wrapper
- 🎯 **Simple**: TypeScript + Tailwind + React, zero config
- 🚀 **Deploy Anywhere**: Just copy the output folder to any host
- 🔧 **Auto-Discovery**: Components are automatically bundled
- ⚙️ **Configurable**: Custom output directory via `config.json`

## Quick Start

```bash
# Install
npm install

# Start development (watch mode)
npm run buildAndWatch

# One-time build
node _internal/build.js
```

Open `docs/index.html` in your browser (or use Live Server extension for auto-reload).

**Deploy:** Copy the entire `docs/` folder to any web server, CDN, or static host.

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
│   ├── Counter.tsx
│   └── ui/            # Nested directories supported
│       └── Button.tsx
└── styles/
    └── globals.css     # Tailwind input

docs/                   # Build output (configurable)
├── *.html             # Static HTML
├── styles.css         # Processed CSS
└── islandRender.js    # Bundled components

_internal/              # Build system
config.json             # Output directory config
```

**Configuration** (`config.json`):
```json
{
  "outputDir": "docs",  // or "dist", "build", etc.
  "buildOptions": {
    "minify": true,
    "sourcemap": false
  }
}
```

## How It Works

**Build Time:**
- Pages → Static HTML with formatted output
- Components → Auto-discovered and bundled into `islandRender.js`
- Tailwind → Purged and minified to `styles.css`

**Runtime:**
- Static HTML loads first (instant, SEO-friendly)
- Islands hydrate with React on the client
- Only interactive components get JavaScript

## Development

**Pages:** Create `.tsx` in `src/pages/` (supports nested directories)
**Components:** Create `.tsx` in `src/components/` (auto-discovered)
**Styling:** Use Tailwind classes (auto-purged)
**Imports:** Clean paths via TypeScript (`@/Island`, `@/components/*`)

Perfect for marketing sites, landing pages, documentation - anything that's mostly static with selective interactivity.

