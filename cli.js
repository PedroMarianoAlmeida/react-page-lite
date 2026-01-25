#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files and directories to copy to the new project
const TEMPLATE_FILES = [
  'src',
  '_internal',
  'tsconfig.json',
  'tailwind.config.js',
  'postcss.config.js',
  'nodemon.json',
  'config.json',
  'readme.md',
  'CLAUDE.md',
  '.gitignore'
];

// Template package.json (will be customized with project name)
const TEMPLATE_PACKAGE_JSON = {
  name: 'react-page-lite-project',
  version: '0.0.1',
  description: 'A React Page Lite project',
  type: 'module',
  scripts: {
    buildAndWatch: 'nodemon --exec "node _internal/build.js"',
    'update-template': 'node _internal/update-template.js'
  },
  author: '',
  license: 'ISC',
  devDependencies: {
    '@tailwindcss/typography': '^0.5.16',
    '@types/node': '^24.5.0',
    '@types/react': '^19.1.13',
    autoprefixer: '^10.4.21',
    esbuild: '^0.25.9',
    nodemon: '^3.1.9',
    postcss: '^8.5.6',
    prettier: '^3.4.2',
    tailwindcss: '^3.4.17',
    tsx: '^4.19.3'
  },
  dependencies: {
    react: '^19.2.3',
    'react-dom': '^19.2.3'
  }
};

async function main() {
  const args = process.argv.slice(2);
  const projectName = args[0];

  if (!projectName) {
    console.log('❌ Please specify a project name:');
    console.log('   npx react-page-lite my-app');
    process.exit(1);
  }

  const targetDir = path.resolve(process.cwd(), projectName);

  // Check if directory exists
  if (fs.existsSync(targetDir)) {
    console.log(`❌ Directory "${projectName}" already exists`);
    process.exit(1);
  }

  console.log(`\n🚀 Creating React Page Lite project in ${projectName}...\n`);

  try {
    // Create target directory
    fs.mkdirSync(targetDir, { recursive: true });

    // Copy template files
    console.log('📁 Copying template files...');
    for (const file of TEMPLATE_FILES) {
      const sourcePath = path.join(__dirname, file);
      const targetPath = path.join(targetDir, file);

      if (fs.existsSync(sourcePath)) {
        fs.copySync(sourcePath, targetPath);
      }
    }

    // Create custom package.json with project name
    const packageJson = { ...TEMPLATE_PACKAGE_JSON, name: projectName };
    fs.writeFileSync(
      path.join(targetDir, 'package.json'),
      JSON.stringify(packageJson, null, 2) + '\n'
    );

    console.log('✅ Template files created');

    // Install dependencies
    console.log('\n📦 Installing dependencies...\n');
    execSync('npm install', {
      cwd: targetDir,
      stdio: 'inherit'
    });

    // Initialize git repository
    console.log('\n📝 Initializing git repository...');
    try {
      execSync('git init', { cwd: targetDir, stdio: 'inherit' });
      execSync('git add -A', { cwd: targetDir, stdio: 'inherit' });
      execSync('git commit -m "Initial commit from react-page-lite"', {
        cwd: targetDir,
        stdio: 'inherit'
      });
      console.log('✅ Git repository initialized');
    } catch (gitError) {
      console.log('⚠️  Could not initialize git repository (is git installed?)');
    }

    console.log('\n✅ Done! Your React Page Lite project is ready.\n');
    console.log('Next steps:');
    console.log(`  cd ${projectName}`);
    console.log('  npm run buildAndWatch');
    console.log('\nThen open docs/index.html in your browser.\n');

  } catch (error) {
    console.error('\n❌ Error creating project:', error.message);

    // Cleanup on error
    if (fs.existsSync(targetDir)) {
      console.log('🧹 Cleaning up...');
      fs.removeSync(targetDir);
    }

    process.exit(1);
  }
}

main();
