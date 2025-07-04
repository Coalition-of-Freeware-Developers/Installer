#!/usr/bin/env node

/**
 * Cross-platform build validation script
 * Checks for platform-specific requirements before building
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const currentPlatform = process.platform;
const targetPlatform = process.env.BUILD_PLATFORM || currentPlatform;

console.log(`🔍 Checking build requirements for platform: ${targetPlatform}`);

// Platform-specific icon requirements
const iconRequirements = {
  win32: ['src/main/icons/icon.ico'],
  darwin: ['src/main/icons/icon.icns'],
  linux: ['src/main/icons/icon.png']
};

// Check for required icons
const requiredIcons = iconRequirements[targetPlatform] || iconRequirements.linux;
let missingIcons = [];

for (const iconPath of requiredIcons) {
  const fullPath = path.join(projectRoot, iconPath);
  if (!fs.existsSync(fullPath)) {
    missingIcons.push(iconPath);
  }
}

if (missingIcons.length > 0) {
  console.warn(`⚠️  Warning: Missing platform-specific icons for ${targetPlatform}:`);
  missingIcons.forEach(icon => console.warn(`   - ${icon}`));
  console.warn('   The build may still succeed with default icons.');
}

// Check for platform-specific dependencies
const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
const optionalDeps = packageJson.optionalDependencies || {};

// Check if winreg is being used on non-Windows platforms
if (targetPlatform !== 'win32' && 'winreg' in optionalDeps) {
  console.log(`✅ winreg is optional dependency - will be skipped on ${targetPlatform}`);
}

// Platform-specific build recommendations
const recommendations = {
  darwin: [
    'Ensure you have Xcode Command Line Tools installed',
    'Run: xcode-select --install (if needed)',
    'Consider code signing for distribution'
  ],
  linux: [
    'Ensure you have build-essential installed',
    'Run: sudo apt-get install build-essential (Ubuntu/Debian)',
    'Run: sudo yum groupinstall "Development Tools" (CentOS/RHEL)',
    'Consider using Docker for consistent builds'
  ],
  win32: [
    'Ensure you have Visual Studio Build Tools or Visual Studio installed',
    'Consider using Windows Subsystem for Linux (WSL) for development'
  ]
};

if (recommendations[targetPlatform]) {
  console.log(`\n💡 Platform-specific recommendations for ${targetPlatform}:`);
  recommendations[targetPlatform].forEach(rec => console.log(`   - ${rec}`));
}

console.log(`\n✅ Build requirements check completed for ${targetPlatform}`);
