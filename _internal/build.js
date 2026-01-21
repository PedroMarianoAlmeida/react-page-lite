#!/usr/bin/env node

import { execSync } from "child_process";
import { readFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

// Simple config loader without TypeScript dependencies
function loadConfig() {
  const configPath = path.resolve(process.cwd(), "config.json");

  if (!existsSync(configPath)) {
    return { outputDir: "dist", buildOptions: { minify: true, sourcemap: false } };
  }

  try {
    const configContent = readFileSync(configPath, "utf-8");
    const userConfig = JSON.parse(configContent);

    return {
      outputDir: userConfig.outputDir || "dist",
      buildOptions: {
        minify: userConfig.buildOptions?.minify ?? true,
        sourcemap: userConfig.buildOptions?.sourcemap ?? false,
      },
    };
  } catch (error) {
    console.warn(`⚠️  Failed to parse config.json: ${error.message}`);
    console.warn("   Using default configuration");
    return { outputDir: "dist", buildOptions: { minify: true, sourcemap: false } };
  }
}

/**
 * Build script that uses configurable output directory
 */
function build() {
  const config = loadConfig();
  const outputDir = config.outputDir;

  console.log(`🔄 Building to: ${outputDir}`);

  try {
    // Ensure output directory exists (smart cleanup happens in generateShell.tsx)
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Build Tailwind CSS with configurable output directory (styles.css now stays)
    const tailwindCmd = `npx tailwindcss -i ./src/styles/globals.css -o ./${outputDir}/styles.css --minify`;
    execSync(tailwindCmd, { stdio: 'inherit' });

    // Generate static site (should NOT delete directory)
    const generateCmd = `npx tsx _internal/generateShell.tsx`;
    execSync(generateCmd, { stdio: 'inherit' });

  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

build();