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
  removeDirectory
} from "./utils/fileUtils.js";
import { logger, Timer } from "./utils/logger.js";
import { getOutputDir } from "./utils/config.js";

interface PageModule {
  default: React.ComponentType;
}

/**
 * Generate static HTML pages from React components
 */
const generateShell = async (): Promise<void> => {
  const timer = new Timer("Shell generation");

  try {
    // Directory paths for pages and output
    const pagesDir = path.resolve("src/pages");
    const frontend = getOutputDir();

    // Ensure output directory exists
    await ensureDirectory(frontend);

    // Check if pages directory exists
    if (!(await directoryExists(pagesDir))) {
      logger.error(`Pages directory not found: ${pagesDir}`);
      throw new Error("Cannot generate pages without src/pages directory");
    }

    // Generate island renderer first
    await generateIslandRenderer();

    // Scan pages directory
    logger.step("Scanning pages directory...");
    const allFiles = await getFilesRecursively(pagesDir);
    const pageFiles = filterComponentFiles(allFiles);

    if (pageFiles.length === 0) {
      logger.warn("No pages found in pages directory");
      timer.end();
      return;
    }

    // Generate pages
    logger.step(`Processing ${pageFiles.length} pages...`);
    const generatedFiles: string[] = [];

    for (const file of pageFiles) {
      try {
        // Get the absolute file path and convert it to a file URL for dynamic import
        const filePath = path.join(pagesDir, file);
        const fileUrl = pathToFileURL(filePath).href;

        // Dynamically import the module and extract the default component
        const module: PageModule = await import(fileUrl);

        if (!module.default) {
          logger.error(`Page ${file} does not have a default export`);
          continue;
        }

        const PageComponent = module.default;

        // Render the component to a string using streaming SSR
        const componentHtml = await renderPageToString(<PageComponent />);

        // Define the output file name (change extension to .html)
        // Support nested pages by preserving directory structure
        const relativePath = file.replace(/\.(tsx?|jsx?)$/, '.html');
        const outputFilePath = path.join(frontend, relativePath);

        // Ensure nested directories exist
        await ensureDirectory(path.dirname(outputFilePath));

        // Write the HTML output to the frontend directory
        await fs.writeFile(outputFilePath, componentHtml, "utf8");

        generatedFiles.push(outputFilePath);
        logger.debug(`Generated ${relativePath}`);
      } catch (error) {
        logger.error(`Failed to generate page ${file}:`, error);
        throw error;
      }
    }

    logger.success(`Generated ${generatedFiles.length} pages`);
    timer.end();

  } catch (error) {
    logger.error('Shell generation failed:', error);
    throw error;
  }
};

generateShell();