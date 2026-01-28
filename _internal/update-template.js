#!/usr/bin/env node

/**
 * Update script to pull latest template files from react-page-lite repository
 * SAFE: Only updates _internal/ and config files, never touches src/
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import https from "https";

const REPO_OWNER = "PedroMarianoAlmeida";
const REPO_NAME = "react-page-lite";
const GITHUB_RAW_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main`;

// Files to update (safe files only - never user content)
const CONFIG_FILES = [
  "postcss.config.js",
  "nodemon.json",
  "config.json",
];

const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warn: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  step: (msg) => console.log(`\n🔄 ${msg}`),
};

/**
 * Download a file from GitHub
 */
async function downloadFile(remotePath, localPath) {
  const url = `${GITHUB_RAW_URL}/${remotePath}`;

  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${remotePath}: ${response.statusCode}`));
        return;
      }

      let data = "";
      response.on("data", (chunk) => (data += chunk));
      response.on("end", () => {
        // Ensure directory exists
        const dir = path.dirname(localPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(localPath, data, "utf8");
        resolve();
      });
    }).on("error", reject);
  });
}

/**
 * Get all files in a directory recursively
 */
function getFilesRecursively(dir, baseDir = dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getFilesRecursively(fullPath, baseDir));
    } else {
      files.push(path.relative(baseDir, fullPath));
    }
  }

  return files;
}

/**
 * Update _internal folder
 */
async function updateInternalFolder() {
  log.step("Updating _internal/ folder...");

  // Get list of files from GitHub by downloading a manifest
  // For simplicity, we'll use a predefined list of common files
  const internalFiles = [
    "_internal/build.js",
    "_internal/update-template.js",
    "_internal/generateShell.tsx",
    "_internal/generateIslandRenderer.tsx",
    "_internal/components/Island.tsx",
    "_internal/helpers/renderPageToString.ts",
    "_internal/utils/fileUtils.ts",
    "_internal/utils/componentValidator.ts",
    "_internal/utils/logger.ts",
    "_internal/utils/config.ts",
    "_internal/utils/islandDiscovery.ts",
  ];

  let successCount = 0;
  for (const file of internalFiles) {
    try {
      await downloadFile(file, file);
      log.success(`Updated ${file}`);
      successCount++;
    } catch (error) {
      log.warn(`Skipped ${file}: ${error.message}`);
    }
  }

  log.success(`Updated ${successCount} internal files`);
  log.info("Use 'git checkout HEAD -- _internal' to rollback if needed");
}

/**
 * Update config files
 */
async function updateConfigFiles() {
  log.step("Updating config files...");

  let successCount = 0;
  for (const file of CONFIG_FILES) {
    try {
      await downloadFile(file, file);
      log.success(`Updated ${file}`);
      successCount++;
    } catch (error) {
      log.warn(`Skipped ${file}: ${error.message}`);
    }
  }

  log.success(`Updated ${successCount} config files`);
}

/**
 * Update dependencies
 */
async function updateDependencies() {
  log.step("Checking for dependency updates...");

  try {
    // Download latest package.json
    const packageJsonUrl = `${GITHUB_RAW_URL}/package.json`;

    const latestPackageJson = await new Promise((resolve, reject) => {
      https.get(packageJsonUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to fetch package.json: ${response.statusCode}`));
          return;
        }

        let data = "";
        response.on("data", (chunk) => (data += chunk));
        response.on("end", () => resolve(JSON.parse(data)));
      }).on("error", reject);
    });

    const currentPackageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

    // Check if dependencies have changed
    const depsChanged =
      JSON.stringify(latestPackageJson.dependencies) !== JSON.stringify(currentPackageJson.dependencies) ||
      JSON.stringify(latestPackageJson.devDependencies) !== JSON.stringify(currentPackageJson.devDependencies);

    if (depsChanged) {
      log.info("New dependencies detected. Run 'npm install' to update.");
      return true;
    } else {
      log.success("Dependencies are up to date");
      return false;
    }
  } catch (error) {
    log.warn(`Could not check dependencies: ${error.message}`);
    return false;
  }
}

/**
 * Main update function
 */
async function update() {
  console.log("\n╔════════════════════════════════════════════════════╗");
  console.log("║   React Page Lite - Template Update Tool          ║");
  console.log("╚════════════════════════════════════════════════════╝\n");

  log.info("This will update internal build files and config files");
  log.info("Your src/ folder (pages, components, styles) will NOT be touched\n");

  try {
    // Update _internal folder
    await updateInternalFolder();

    // Update config files
    await updateConfigFiles();

    // Check dependencies
    const needsInstall = await updateDependencies();

    // Summary
    console.log("\n╔════════════════════════════════════════════════════╗");
    console.log("║   Update Complete!                                 ║");
    console.log("╚════════════════════════════════════════════════════╝\n");

    log.success("Template files updated successfully");
    log.info("Your pages and components remain unchanged");
    log.info("Commit changes or use git to rollback if needed");

    if (needsInstall) {
      log.warn("Run 'npm install' to update dependencies");
    }

    console.log("\n");
  } catch (error) {
    log.error(`Update failed: ${error.message}`);
    process.exit(1);
  }
}

update();
