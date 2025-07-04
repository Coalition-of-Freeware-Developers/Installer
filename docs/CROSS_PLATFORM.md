# Cross-Platform Development Guide

This application is designed to work on Windows, macOS, and Linux. Here's how to develop and build for different platforms.

## Platform Support

- **Windows**: x64, ia32 (NSIS installer and portable)
- **macOS**: x64, ARM64 (DMG and ZIP packages)
- **Linux**: x64, ARM64 (AppImage, DEB, RPM, and TAR.GZ packages)

## Development Setup

### Prerequisites

#### All Platforms
- Node.js 18.x or 20.x
- npm or yarn
- Git

#### Windows
- Visual Studio Build Tools or Visual Studio with C++ workload
- Windows SDK

#### macOS
- Xcode Command Line Tools: `xcode-select --install`
- For code signing: Apple Developer account and certificates

#### Linux
- Build essentials:
  - Ubuntu/Debian: `sudo apt-get install build-essential`
  - CentOS/RHEL: `sudo yum groupinstall "Development Tools"`
  - Arch: `sudo pacman -S base-devel`

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Coalition-Installer

# Install dependencies
npm install

# Run platform-specific checks
npm run platform-check
```

## Building

### Development
```bash
# Start development server
npm run dev

# Run on current platform
npm start
```

### Production Builds

#### Build for Current Platform
```bash
npm run package:current
```

#### Build for Specific Platforms
```bash
# Windows (run on any platform)
npm run package:win

# macOS (run on any platform, but signing requires macOS)
npm run package:mac

# Linux (run on any platform)
npm run package:linux

# All platforms (requires appropriate tools for each)
npm run package:all
```

## Platform-Specific Features

### Windows
- Registry access for Steam detection (optional dependency)
- NSIS installer with custom scripts
- Portable executable option
- Windows-specific paths (`C:\Program Files`, etc.)

### macOS
- .app bundle handling for X-Plane
- Hardened runtime and notarization support
- macOS-specific paths (`/Applications`, `~/Library`, etc.)
- DMG packaging with custom background

### Linux
- Multiple package formats (AppImage, DEB, RPM)
- Support for various Steam installation paths
- XDG Base Directory specification compliance
- Desktop integration

## Cross-Platform Code Guidelines

### Path Handling
Use the `PlatformUtils` class for platform-specific paths:

```typescript
import { PlatformUtils } from 'common/PlatformUtils';

// Get platform-specific X-Plane executable name
const executable = PlatformUtils.xplaneExecutableName;

// Get platform-specific Steam paths
const steamPaths = PlatformUtils.steamInstallPaths;

// Get platform-specific default install paths
const defaultPaths = PlatformUtils.defaultXPlaneInstallPaths;
```

### Platform Detection
In the renderer process:
```typescript
const platform = window.electronAPI?.platform || 'unknown';
const isWindows = platform === 'win32';
const isMac = platform === 'darwin';
const isLinux = platform === 'linux';
```

In the main process:
```typescript
const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';
```

### File System Operations
Always use the IPC-based file system operations in the renderer:
```typescript
import ipcFs from 'renderer/utils/IPCFileSystem';

const exists = await ipcFs.existsSync(path);
const files = await ipcFs.readdirSync(directory);
```

## Testing on Different Platforms

### Virtual Machines
- Use VirtualBox or VMware for testing Windows/Linux
- Use Parallels or VMware Fusion on Mac for Windows testing

### Docker
For Linux testing on other platforms:
```bash
# Build in Ubuntu container
docker run -it --rm -v $(pwd):/app -w /app node:18-ubuntu npm run package:linux
```

### GitHub Actions
The project includes automated cross-platform builds via GitHub Actions.

## Troubleshooting

### Common Issues

#### Windows
- **Build fails**: Ensure Visual Studio Build Tools are installed
- **Icons missing**: Check that `.ico` files exist in `src/main/icons/`

#### macOS
- **Code signing fails**: Ensure certificates are properly installed
- **Notarization fails**: Check Apple Developer account and app-specific password

#### Linux
- **Build tools missing**: Install `build-essential` or equivalent
- **AppImage doesn't run**: Check execute permissions and FUSE availability

### Platform-Specific Dependencies

The application handles platform-specific dependencies gracefully:
- `winreg`: Only used on Windows (marked as optional dependency)
- `steam-locate`: Works on all platforms but has platform-specific behavior

## Distribution

### Windows
- NSIS installer for full installation experience
- Portable executable for users who prefer not to install

### macOS
- DMG for easy drag-and-drop installation
- ZIP archive for advanced users

### Linux
- AppImage for universal compatibility
- DEB packages for Debian/Ubuntu users
- RPM packages for Red Hat/SUSE users
- TAR.GZ for manual installation

## Performance Considerations

### Platform-Specific Optimizations
- Windows: Uses registry for Steam detection when available
- macOS: Optimized for both Intel and Apple Silicon
- Linux: Multiple Steam library detection methods

### Bundle Size
Different platforms have different bundle size considerations:
- Windows: NSIS compression reduces installer size
- macOS: Universal binaries increase size but improve compatibility
- Linux: AppImage includes all dependencies, increasing size
