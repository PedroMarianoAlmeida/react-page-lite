import fs from "fs/promises";
import path from "path";

/**
 * Supported file extensions for components and pages
 */
export const COMPONENT_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'] as const;

/**
 * File patterns to exclude from component scanning
 */
export const EXCLUDED_PATTERNS = ['.test.', '.spec.', '.d.ts'] as const;

/**
 * Check if a file has a supported component extension
 */
export function hasComponentExtension(filename: string): boolean {
  return COMPONENT_EXTENSIONS.some(ext => filename.endsWith(ext));
}

/**
 * Check if a file should be excluded from component scanning
 */
export function shouldExcludeFile(filename: string): boolean {
  return EXCLUDED_PATTERNS.some(pattern => filename.includes(pattern));
}

/**
 * Filter files to include only valid components
 */
export function filterComponentFiles(files: string[]): string[] {
  return files.filter(file =>
    hasComponentExtension(file) &&
    !shouldExcludeFile(file)
  );
}

/**
 * Get component name from filename
 */
export function getComponentName(filename: string): string {
  return path.basename(filename, path.extname(filename));
}

/**
 * Ensure directory exists, create if it doesn't
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create directory ${dirPath}: ${error}`);
  }
}

/**
 * Check if directory exists and is accessible
 */
export async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Get all files recursively from a directory
 */
export async function getFilesRecursively(dirPath: string, basePath: string = dirPath): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Recursively get files from subdirectories
        const subFiles = await getFilesRecursively(fullPath, basePath);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        // Get relative path from base directory
        const relativePath = path.relative(basePath, fullPath);
        files.push(relativePath);
      }
    }
  } catch (error) {
    throw new Error(`Failed to read directory ${dirPath}: ${error}`);
  }

  return files;
}

/**
 * Remove directory and all its contents
 */
export async function removeDirectory(dirPath: string): Promise<void> {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (error) {
    throw new Error(`Failed to remove directory ${dirPath}: ${error}`);
  }
}