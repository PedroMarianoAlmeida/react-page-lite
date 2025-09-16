import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import { logger } from "./logger.js";

interface ValidationResult {
  isValid: boolean;
  componentName: string;
  filePath: string;
  errors: string[];
  warnings: string[];
}

/**
 * Validate that a component file has proper exports
 */
export async function validateComponent(filePath: string, basePath: string): Promise<ValidationResult> {
  const fullPath = path.join(basePath, filePath);
  const componentName = path.basename(filePath, path.extname(filePath));

  const result: ValidationResult = {
    isValid: true,
    componentName,
    filePath,
    errors: [],
    warnings: []
  };

  try {
    // Check if file exists
    await fs.access(fullPath);

    // Try to dynamically import the component
    const fileUrl = pathToFileURL(fullPath).href;
    const module = await import(fileUrl);

    // Check if component is exported with the expected name
    if (!module[componentName] && !module.default) {
      result.isValid = false;
      result.errors.push(`Component '${componentName}' not found. Expected named export '${componentName}' or default export.`);
    } else if (!module[componentName] && module.default) {
      result.warnings.push(`Component '${componentName}' uses default export. Consider using named export for consistency.`);
    }

    // Check if it's a valid React component
    const component = module[componentName] || module.default;
    if (component && typeof component !== 'function') {
      result.isValid = false;
      result.errors.push(`'${componentName}' is not a function. React components must be functions.`);
    }

  } catch (error) {
    result.isValid = false;
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        result.errors.push(`File not found: ${filePath}`);
      } else if (error.message.includes('SyntaxError')) {
        result.errors.push(`Syntax error in ${filePath}: ${error.message}`);
      } else {
        result.errors.push(`Failed to import ${filePath}: ${error.message}`);
      }
    } else {
      result.errors.push(`Unknown error validating ${filePath}`);
    }
  }

  return result;
}

/**
 * Validate all components in a directory
 */
export async function validateAllComponents(componentFiles: string[], basePath: string): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  logger.step(`Validating ${componentFiles.length} components...`);

  for (const file of componentFiles) {
    const result = await validateComponent(file, basePath);
    results.push(result);

    if (result.errors.length > 0) {
      logger.error(`Component validation failed: ${file}`);
      result.errors.forEach(error => logger.error(`  - ${error}`));
    }

    if (result.warnings.length > 0) {
      result.warnings.forEach(warning => logger.warn(`  - ${warning}`));
    }
  }

  const validComponents = results.filter(r => r.isValid);
  const invalidComponents = results.filter(r => !r.isValid);

  if (invalidComponents.length > 0) {
    logger.error(`${invalidComponents.length} components failed validation`);
    throw new Error(`Component validation failed. Fix the errors above and try again.`);
  }

  logger.success(`All ${validComponents.length} components validated successfully`);
  return results;
}

/**
 * Check for common component issues
 */
export function checkComponentNaming(componentFiles: string[]): void {
  const duplicateNames = new Map<string, string[]>();

  // Check for duplicate component names
  componentFiles.forEach(file => {
    const componentName = path.basename(file, path.extname(file));
    if (!duplicateNames.has(componentName)) {
      duplicateNames.set(componentName, []);
    }
    duplicateNames.get(componentName)!.push(file);
  });

  duplicateNames.forEach((files, name) => {
    if (files.length > 1) {
      logger.warn(`Duplicate component name '${name}' found in files: ${files.join(', ')}`);
      logger.warn(`This may cause import conflicts. Consider renaming one of them.`);
    }
  });
}