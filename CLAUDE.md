# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run buildAndWatch` - Start development server with file watching and auto-rebuild (recommended)
- `node _internal/build.js` - One-time build without watch mode

### Configuration
- **`config.json`**: Configure output directory and build options
  - `outputDir`: Default is `"dist"`, but can be changed (e.g., `"docs"` for GitHub Pages)
  - `buildOptions.minify`: Minify output (default: `true`)
  - `buildOptions.sourcemap`: Generate sourcemaps (default: `false`)

### Key Build Process
The build process runs automatically when files change:
1. Compiles Tailwind CSS to `<outputDir>/styles.css` (purged based on src/ usage)
2. Generates `<outputDir>/islandRender.js` (auto-discovers all components in `src/components/`)
3. Renders all pages from `src/pages/` to static HTML in `<outputDir>/`

## Project Overview

React Page Lite is a fully functional React-based static site generator with islands architecture. It generates SEO-friendly static HTML while enabling selective client-side interactivity through an islands system.

## Architecture

### Core Structure
- **`src/pages/`**: Full HTML page components (must export default and return complete `<html>` documents). Supports nested directories - structure mirrors output.
- **`src/components/`**: Reusable React components (auto-discovered for islands). Supports nested directories (e.g., `ui/Button.tsx`).
- **`src/styles/`**: Tailwind CSS input files
- **`<outputDir>/`**: Generated static files ready for deployment (configurable via `config.json`, defaults to `dist/`)
- **`_internal/`**: Build system (do not modify)

### Islands Architecture
The project implements a sophisticated islands architecture:

1. **Island Component** (`_internal/components/Island.tsx`):
   - Wraps any component to make it interactive
   - Auto-generates unique IDs for each instance
   - Extracts component props and serializes them as `data-props`
   - Embeds component name as `data-island` attribute

2. **Auto-Discovery System** (`_internal/generateIslandRenderer.tsx`):
   - Scans `src/components/` directory at build time
   - Generates `islandRender.tsx` with all component imports
   - Bundles into `dist/islandRender.js` using esbuild
   - No manual component registration required

3. **Client-Side Hydration**:
   - Single `islandRender.js` file handles all interactive components
   - Uses `document.querySelectorAll('[data-island]')` to find all islands
   - Deserializes props from `data-props` JSON
   - Hydrates each island with React.createElement and createRoot

### Build System
- **Page Generation**: `_internal/generateShell.tsx` renders React pages to static HTML, preserving nested directory structure
- **CSS Processing**: Tailwind CSS with automatic purging of unused styles via `nodemon.json`
- **Component Bundling**: esbuild bundles all interactive components into single `islandRender.js`
- **File Watching**: nodemon watches `src/` for `.js,.jsx,.ts,.tsx,.css` changes and rebuilds automatically

### Key Features
- **TypeScript**: Full TypeScript support with path mapping (`@/components/*`, `@/Island`)
- **React 19**: Uses modern React with automatic JSX transform
- **ES Modules**: Configured for ESM throughout
- **Props Support**: Islands can accept any props via automatic serialization
- **Multiple Instances**: Same component can be used multiple times as islands
- **Nested Components**: Support for organized directory structures (`components/ui/Button.tsx`)
- **Component Validation**: Early error detection with helpful messages
- **Professional Logging**: Clear build progress with performance timing

## Development Workflow

### Adding New Pages
1. Create `.tsx` file in `src/pages/` (supports nested directories like `src/pages/blog/post.tsx` → `blog/post.html`)
2. Export default function that returns complete HTML document
3. Include `<link rel="stylesheet" href="./styles.css" />` in head (adjust path for nested pages: `../styles.css`)
4. Script tag paths also need adjustment for nested pages (e.g., `<script src="../islandRender.js">` for one level deep)

### Adding Interactive Components
1. Create component in `src/components/` (will be auto-discovered)
2. Use in pages wrapped with `<Island><YourComponent /></Island>`
3. Component automatically becomes interactive on client-side

### Styling
- Use Tailwind classes directly in components
- CSS is automatically purged to include only used classes
- Custom styles can be added to `src/styles/globals.css`

### Example Usage
```tsx
// src/pages/index.tsx
import { Island } from "@/Island";
import { Counter } from "@/components/Counter";

const HomePage = () => (
  <html lang="en">
    <head>
      <title>My App</title>
      <link rel="stylesheet" href="./styles.css" />
    </head>
    <body>
      <h1>Static Content</h1>
      <Island>
        <Counter initialValue={0} />
      </Island>
    </body>
  </html>
);

export default HomePage;
```

## Technical Details

### Important Files
- **`config.json`**: Build configuration (output directory, minification, sourcemaps)
- **`nodemon.json`**: Watches src/ for changes and runs Tailwind + build command
- **`_internal/build.js`**: Build entry point, loads config and runs Tailwind + generateShell
- **`_internal/generateShell.tsx`**: Main build orchestrator (pages + island renderer)
- **`_internal/generateIslandRenderer.tsx`**: Auto-discovery, validation, and bundling of components
- **`_internal/components/Island.tsx`**: Island wrapper component that handles SSR + hydration
- **`_internal/utils/componentValidator.ts`**: Validates component exports and naming
- **`tailwind.config.js`**: Tailwind configuration (scans `src/**/*` for classes)
- **`tsconfig.json`**: TypeScript configuration with path mappings

### Dependencies
- **Runtime**: React 19.0.0, React DOM 19.0.0
- **Build**: esbuild, tsx, nodemon
- **Styling**: Tailwind CSS 3.4.17, autoprefixer
- **Types**: @types/react, @types/node

The project is fully functional and production-ready for static site generation with selective interactivity.
