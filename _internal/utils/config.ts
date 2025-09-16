import { readFileSync, existsSync } from "fs";
import path from "path";

export interface Config {
  outputDir: string;
  buildOptions: {
    minify: boolean;
    sourcemap: boolean;
  };
}

const DEFAULT_CONFIG: Config = {
  outputDir: "dist",
  buildOptions: {
    minify: true,
    sourcemap: false,
  },
};

/**
 * Load configuration from config.json file
 * Falls back to default configuration if file doesn't exist
 */
export function loadConfig(): Config {
  const configPath = path.resolve(process.cwd(), "config.json");

  if (!existsSync(configPath)) {
    return DEFAULT_CONFIG;
  }

  try {
    const configContent = readFileSync(configPath, "utf-8");
    const userConfig = JSON.parse(configContent);

    // Merge user config with defaults
    return {
      ...DEFAULT_CONFIG,
      ...userConfig,
      buildOptions: {
        ...DEFAULT_CONFIG.buildOptions,
        ...userConfig.buildOptions,
      },
    };
  } catch (error) {
    console.warn(`⚠️  Failed to parse config.json: ${error}`);
    console.warn("   Using default configuration");
    return DEFAULT_CONFIG;
  }
}

/**
 * Get the absolute path to the output directory
 */
export function getOutputDir(): string {
  const config = loadConfig();
  return path.resolve(process.cwd(), config.outputDir);
}