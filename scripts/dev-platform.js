#!/usr/bin/env node

/**
 * Platform development helper
 * Allows developers to test platform-specific behavior
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const targetPlatform = args[0];
const command = args[1] || 'dev';

const validPlatforms = ['win32', 'darwin', 'linux'];
const validCommands = ['dev', 'build', 'package', 'dist'];

if (!targetPlatform || !validPlatforms.includes(targetPlatform)) {
  console.log('Usage: node scripts/dev-platform.js <platform> [command]');
  console.log('');
  console.log('Platforms:');
  console.log('  win32   - Windows development mode');
  console.log('  darwin  - macOS development mode');  
  console.log('  linux   - Linux development mode');
  console.log('');
  console.log('Commands:');
  console.log('  dev     - Start development server (default)');
  console.log('  build   - Build application');
  console.log('  package - Package for target platform');
  console.log('  dist    - Build and distribute');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/dev-platform.js linux dev');
  console.log('  node scripts/dev-platform.js darwin package');
  console.log('  node scripts/dev-platform.js win32 build');
  process.exit(1);
}

if (!validCommands.includes(command)) {
  console.error(`Invalid command: ${command}`);
  console.error(`Valid commands: ${validCommands.join(', ')}`);
  process.exit(1);
}

console.log(`🚀 Starting ${command} for platform: ${targetPlatform}`);

// Set environment variables for platform simulation
const env = {
  ...process.env,
  BUILD_PLATFORM: targetPlatform,
  // For testing, we can override the detected platform
  FORCE_PLATFORM: targetPlatform
};

// Map commands to npm scripts
const scriptMap = {
  dev: 'dev',
  build: 'build',
  package: `package:${targetPlatform === 'win32' ? 'win' : targetPlatform}`,
  dist: `dist:${targetPlatform === 'win32' ? 'win' : targetPlatform}`
};

const npmScript = scriptMap[command];

if (!npmScript) {
  console.error(`No script mapping found for command: ${command}`);
  process.exit(1);
}

console.log(`📦 Running: npm run ${npmScript}`);
console.log(`🔧 Environment: BUILD_PLATFORM=${targetPlatform}`);

// Execute the npm command
const child = spawn('npm', ['run', npmScript], {
  stdio: 'inherit',
  env,
  cwd: path.resolve(__dirname, '..')
});

child.on('close', (code) => {
  if (code === 0) {
    console.log(`✅ ${command} completed successfully for ${targetPlatform}`);
  } else {
    console.error(`❌ ${command} failed for ${targetPlatform} (exit code: ${code})`);
    process.exit(code);
  }
});

child.on('error', (error) => {
  console.error(`❌ Failed to start ${command}:`, error.message);
  process.exit(1);
});
