# Public Assets

This folder contains static assets that will be copied directly to your output directory during the build process.

## How It Works

- All files and folders in `public/` are copied to your configured output directory (e.g., `docs/` or `dist/`)
- Directory structure is preserved
- Files are automatically copied on every build
- The watch mode detects changes to files in this folder

## Usage

Simply place any static files here:

```
public/
  ├── favicon.ico
  ├── robots.txt
  ├── documents/
  │   └── guide.pdf
  └── images/
      └── logo.png
```

These will be available at the root of your site:
- `https://yoursite.com/favicon.ico`
- `https://yoursite.com/documents/guide.pdf`
- `https://yoursite.com/images/logo.png`

## Supported File Types

Any file type is supported: PDFs, images, fonts, videos, JSON files, etc.

## Reference in Your Pages

```tsx
// In your React pages:
<a href="./documents/guide.pdf" download>Download PDF</a>
<img src="./images/logo.png" alt="Logo" />

// For nested pages (e.g., src/pages/blog/post.tsx):
<a href="../documents/guide.pdf" download>Download PDF</a>
```
