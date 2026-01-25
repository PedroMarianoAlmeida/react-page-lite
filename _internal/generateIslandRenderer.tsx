import fs from "fs/promises";
import path from "path";
import {
  getFilesRecursively,
  filterComponentFiles,
  getComponentName,
  ensureDirectory,
  directoryExists
} from "./utils/fileUtils.js";
import {
  validateAllComponents,
  checkComponentNaming
} from "./utils/componentValidator.js";
import { logger, Timer } from "./utils/logger.js";
import { getOutputDir } from "./utils/config.js";

/**
 * Generate the island renderer that handles client-side component hydration
 * @param usedComponents Optional set of component names to bundle (if omitted, bundles all components)
 */
const generateIslandRenderer = async (usedComponents?: Set<string>): Promise<void> => {
  const timer = new Timer("Island renderer generation");

  const componentsDir = path.resolve("src/components");
  const outputDir = getOutputDir();
  const tempPath = path.join(outputDir, "islandRender.tsx");
  const outputPath = path.join(outputDir, "islandRender.js");

  try {
    // Check if components directory exists
    if (!(await directoryExists(componentsDir))) {
      logger.warn(`Components directory not found: ${componentsDir}`);
      logger.info("Creating empty island renderer...");

      await ensureDirectory(path.dirname(outputPath));
      await fs.writeFile(outputPath, generateEmptyRenderer(), 'utf8');
      timer.end();
      return;
    }

    // Scan components directory recursively for all components
    logger.step("Scanning components directory...");
    const allFiles = await getFilesRecursively(componentsDir);
    let componentFiles = filterComponentFiles(allFiles);

    // Store original count for logging
    const totalComponents = componentFiles.length;

    if (totalComponents === 0) {
      logger.warn("No components found in components directory");
      await ensureDirectory(path.dirname(outputPath));
      await fs.writeFile(outputPath, generateEmptyRenderer(), 'utf8');
      timer.end();
      return;
    }

    // Filter to only used components if provided
    if (usedComponents && usedComponents.size > 0) {
      logger.step(`Filtering to ${usedComponents.size} used components...`);

      componentFiles = componentFiles.filter(file => {
        const componentName = getComponentName(file);
        return usedComponents.has(componentName);
      });

      // Validate we found all requested components
      const foundNames = new Set(componentFiles.map(f => getComponentName(f)));
      const missingComponents = Array.from(usedComponents)
        .filter(name => !foundNames.has(name));

      if (missingComponents.length > 0) {
        logger.warn(`Islands reference missing components: ${missingComponents.join(', ')}`);
      }

      if (componentFiles.length === 0) {
        logger.warn("No used components found, generating empty renderer");
        await ensureDirectory(path.dirname(outputPath));
        await fs.writeFile(outputPath, generateEmptyRenderer(), 'utf8');
        timer.end();
        return;
      }
    }

    // Validate all components
    await validateAllComponents(componentFiles, componentsDir);

    // Check for naming issues
    checkComponentNaming(componentFiles);

    // Generate imports and registry
    logger.step(`Generating imports for ${componentFiles.length} components...`);
    const componentImports = componentFiles.map(file => {
      const componentName = getComponentName(file);
      // Support nested components by creating proper import path
      const importPath = file.replace(/\\/g, '/').replace(/\.(tsx?|jsx?)$/, '');
      return `import { ${componentName} } from "@/components/${importPath}";`;
    }).join('\n');

    const componentRegistry = componentFiles.map(file => {
      const componentName = getComponentName(file);
      return `  "${componentName}": ${componentName}`;
    }).join(',\n');

    // Generate the island renderer
    const rendererCode = `// Auto-generated island renderer
import React from "react";
import { createRoot } from "react-dom/client";
${componentImports}

// Component registry
const componentRegistry = {
${componentRegistry}
};

// Universal island hydration
const hydrateIslands = () => {
  // Find all islands
  const islands = document.querySelectorAll('[data-island]');

  islands.forEach((island) => {
    if (island instanceof HTMLElement) {
      const componentName = island.dataset.island;
      const propsJson = island.dataset.props;

      if (componentName && componentRegistry[componentName]) {
        try {
          const Component = componentRegistry[componentName];
          const props = propsJson ? JSON.parse(propsJson) : {};

          // Create React element
          const element = React.createElement(Component, props);

          // Render to the island
          createRoot(island).render(element);
        } catch (error) {
          console.error(\`Failed to hydrate component \${componentName}:\`, error);
        }
      }
    }
  });
};

// Auto-run when DOM is loaded
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrateIslands);
  } else {
    hydrateIslands();
  }
}`;

    // Write TypeScript file first
    // Write TypeScript file first
    await fs.writeFile(tempPath, rendererCode, 'utf8');

    // Bundle with esbuild
    logger.step("Bundling island renderer with esbuild...");
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);

    const bundleCommand = `npx esbuild ${tempPath} --bundle --format=esm --outfile=${outputPath} --jsx=automatic`;
    await execAsync(bundleCommand);

    // Clean up temp file
    await fs.unlink(tempPath);

    if (usedComponents) {
      logger.success(`Generated island renderer with ${componentFiles.length}/${totalComponents} components`);
      logger.debug(`Bundled: ${componentFiles.map(f => getComponentName(f)).join(', ')}`);
    } else {
      logger.success(`Generated island renderer with ${componentFiles.length} components (all)`);
    }

    timer.end();
  } catch (error) {
    logger.error('Failed to generate island renderer:', error);
    throw error;
  }
};

/**
 * Generate empty island renderer when no components are found
 */
function generateEmptyRenderer(): string {
  return `// Auto-generated island renderer (empty - no components found)
import React from "react";
import { createRoot } from "react-dom/client";

// No components found - empty registry
const componentRegistry = {};

// Universal island hydration (no-op when no components)
const hydrateIslands = () => {
  console.info("No interactive components found - skipping hydration");
};

// Auto-run when DOM is loaded
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrateIslands);
  } else {
    hydrateIslands();
  }
}`;
}

export { generateIslandRenderer };