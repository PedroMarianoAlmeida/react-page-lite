/**
 * Main build orchestrator - generates static HTML pages and island renderer
 */

import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import React from "react";
import { renderPageToString } from "./helpers/renderPageToString.js";
import { generateIslandRenderer } from "./generateIslandRenderer.js";
import {
  getFilesRecursively,
  filterComponentFiles,
  ensureDirectory,
  directoryExists,
  removeDirectory,
  cleanupOrphanedHtmlFiles,
  copyPublicDirectory
} from "./utils/fileUtils.js";
import { logger, Timer } from "./utils/logger.js";
import { getOutputDir } from "./utils/config.js";
import { discoverIslandsInHtml, combineIslandDiscoveries } from "./utils/islandDiscovery.js";

interface PageModule {
  default: React.ComponentType;
}

/**
 * Generate static HTML pages from React components
 */
const generateShell = async (): Promise<void> => {
  const timer = new Timer("Shell generation");

  try {
    const pagesDir = path.resolve("src/pages");
    const publicDir = path.resolve("public");
    const frontend = getOutputDir();

    await ensureDirectory(frontend);

    if (!(await directoryExists(pagesDir))) {
      logger.error(`Pages directory not found: ${pagesDir}`);
      throw new Error("Cannot generate pages without src/pages directory");
    }

    // Clean up orphaned HTML files
    logger.step("Cleaning up orphaned HTML files...");
    const removedCount = await cleanupOrphanedHtmlFiles(frontend, pagesDir);
    if (removedCount > 0) {
      logger.debug(`Removed ${removedCount} orphaned HTML file(s)`);
    }

    // Copy public directory files
    logger.step("Copying public assets...");
    const copiedCount = await copyPublicDirectory(publicDir, frontend);
    if (copiedCount > 0) {
      logger.success(`Copied ${copiedCount} file(s) from public/`);
    } else {
      logger.debug("No public/ directory or files found");
    }

    // ========== PHASE 1: Render pages to discover islands ==========
    logger.step("Scanning pages directory...");
    const allFiles = await getFilesRecursively(pagesDir);
    const pageFiles = filterComponentFiles(allFiles);

    if (pageFiles.length === 0) {
      logger.warn("No pages found in pages directory");
      timer.end();
      return;
    }

    logger.step(`Rendering ${pageFiles.length} pages...`);

    interface PageRenderResult {
      file: string;
      html: string;
      outputPath: string;
    }

    const renderedPages: PageRenderResult[] = [];

    // Render all pages to memory
    for (const file of pageFiles) {
      try {
        const filePath = path.join(pagesDir, file);
        const fileUrl = pathToFileURL(filePath).href;
        const module: PageModule = await import(fileUrl);

        if (!module.default) {
          logger.error(`Page ${file} does not have a default export`);
          continue;
        }

        const PageComponent = module.default;
        const componentHtml = await renderPageToString(<PageComponent />);

        const relativePath = file.replace(/\.(tsx?|jsx?)$/, '.html');
        const outputFilePath = path.join(frontend, relativePath);

        renderedPages.push({
          file,
          html: componentHtml,
          outputPath: outputFilePath
        });

        logger.debug(`Rendered ${relativePath}`);
      } catch (error) {
        logger.error(`Failed to render page ${file}:`, error);
        throw error;
      }
    }

    // ========== PHASE 2: Discover islands ==========
    logger.step("Discovering islands...");
    const htmlContents = renderedPages.map(p => p.html);
    const componentCounts = combineIslandDiscoveries(htmlContents);
    const usedComponents = new Set(componentCounts.keys());

    if (usedComponents.size === 0) {
      logger.info("No islands found in any page");
    } else {
      logger.success(`Discovered ${usedComponents.size} unique island components:`);
      Array.from(componentCounts.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .forEach(([name, count]) => {
          logger.debug(`  - ${name} (${count} instance${count > 1 ? 's' : ''})`);
        });
    }

    // ========== PHASE 3: Generate island renderer ==========
    // Always pass the set - empty set means no components should be bundled
    await generateIslandRenderer(usedComponents);

    // ========== PHASE 4: Write HTML files ==========
    logger.step(`Writing ${renderedPages.length} HTML files...`);

    for (const { outputPath, html } of renderedPages) {
      await ensureDirectory(path.dirname(outputPath));
      await fs.writeFile(outputPath, html, "utf8");
    }

    logger.success(`Generated ${renderedPages.length} pages`);
    timer.end();

  } catch (error) {
    logger.error('Shell generation failed:', error);
    throw error;
  }
};

generateShell();