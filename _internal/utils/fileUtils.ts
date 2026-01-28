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

/**
 * Find and remove orphaned HTML files in the output directory
 * that don't have a corresponding source file in src/pages/
 */
export async function cleanupOrphanedHtmlFiles(outputDir: string, pagesDir: string): Promise<number> {
  try {
    // Check if output directory exists
    if (!(await directoryExists(outputDir))) {
      return 0;
    }

    // Get all HTML files in the output directory
    const allOutputFiles = await getFilesRecursively(outputDir);
    const htmlFiles = allOutputFiles.filter(file => file.endsWith('.html'));

    let removedCount = 0;

    for (const htmlFile of htmlFiles) {
      // Convert HTML filename back to possible source filenames
      const baseNameWithoutExt = htmlFile.replace(/\.html$/, '');

      // Check if any of the possible source files exist
      const possibleSourceFiles = COMPONENT_EXTENSIONS.map(ext =>
        path.join(pagesDir, `${baseNameWithoutExt}${ext}`)
      );

      const sourceExists = await Promise.all(
        possibleSourceFiles.map(async (sourcePath) => {
          try {
            await fs.access(sourcePath);
            return true;
          } catch {
            return false;
          }
        })
      );

      // If no source file exists, delete the orphaned HTML file
      if (!sourceExists.some(exists => exists)) {
        const htmlFilePath = path.join(outputDir, htmlFile);
        await fs.unlink(htmlFilePath);
        removedCount++;
      }
    }

    return removedCount;
  } catch (error) {
    throw new Error(`Failed to cleanup orphaned HTML files: ${error}`);
  }
}

/**
 * Find and remove orphaned files in the output directory
 * that were copied from public/ but no longer exist there
 */
export async function cleanupOrphanedPublicFiles(outputDir: string, publicDir: string): Promise<number> {
  try {
    // Check if output directory exists
    if (!(await directoryExists(outputDir))) {
      return 0;
    }

    // Get all files in the output directory
    const allOutputFiles = await getFilesRecursively(outputDir);

    // Build system generated files that should never be deleted
    const generatedFiles = new Set([
      'styles.css',
      'islandRender.js',
      'islandRender.js.map'
    ]);

    let removedCount = 0;

    for (const file of allOutputFiles) {
      // Skip HTML files (managed by cleanupOrphanedHtmlFiles)
      if (file.endsWith('.html')) {
        continue;
      }

      // Skip generated files
      if (generatedFiles.has(file)) {
        continue;
      }

      // Check if file exists in public directory
      const publicFilePath = path.join(publicDir, file);
      try {
        await fs.access(publicFilePath);
        // File exists in public/, keep it
      } catch {
        // File doesn't exist in public/, remove it
        const outputFilePath = path.join(outputDir, file);
        await fs.unlink(outputFilePath);
        removedCount++;
      }
    }

    return removedCount;
  } catch (error) {
    throw new Error(`Failed to cleanup orphaned public files: ${error}`);
  }
}

/**
 * Copy all files from public directory to output directory
 * Preserves directory structure and handles nested folders
 */
export async function copyPublicDirectory(publicDir: string, outputDir: string): Promise<number> {
  try {
    // Check if public directory exists
    if (!(await directoryExists(publicDir))) {
      return 0;
    }

    // Get all files in the public directory
    const allFiles = await getFilesRecursively(publicDir);

    // Copy each file to the output directory
    for (const file of allFiles) {
      const sourcePath = path.join(publicDir, file);
      const destPath = path.join(outputDir, file);

      // Ensure destination directory exists
      await ensureDirectory(path.dirname(destPath));

      // Copy the file
      await fs.copyFile(sourcePath, destPath);
    }

    return allFiles.length;
  } catch (error) {
    throw new Error(`Failed to copy public directory: ${error}`);
  }
}