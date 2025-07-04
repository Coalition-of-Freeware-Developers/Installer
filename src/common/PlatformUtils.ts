/**
 * Cross-platform utility functions for handling platform-specific operations
 * This version works in the main process only. For renderer process, use the values directly.
 */

// Environment detection
const isMainProcess = typeof process !== 'undefined' && process.type === 'browser';
const isRendererProcess = typeof window !== 'undefined';

// Platform detection that works in different contexts
const getPlatform = (): string => {
  // In main process
  if (typeof process !== 'undefined' && process.platform) {
    return process.platform;
  }

  // In renderer process, try to get from electronAPI first
  if (typeof globalThis !== 'undefined' && (globalThis as any).window?.electronAPI?.platform) {
    return (globalThis as any).window.electronAPI.platform;
  }

  // Fallback for renderer process - detect from user agent
  if (typeof navigator !== 'undefined' && navigator.platform) {
    const platform = navigator.platform.toLowerCase();
    if (platform.includes('win')) return 'win32';
    if (platform.includes('mac')) return 'darwin';
    if (platform.includes('linux')) return 'linux';
  }

  // Default fallback
  return 'win32';
};

// Simple path utilities that don't require Node.js path module
const createSimplePath = () => {
  const isWindows = getPlatform() === 'win32';
  const sep = isWindows ? '\\' : '/';

  return {
    join: (...paths: string[]) => {
      return paths
        .filter((p) => p && typeof p === 'string')
        .map((p, i) => (i === 0 ? p.replace(/[/\\]+$/, '') : p.replace(/^[/\\]+/, '').replace(/[/\\]+$/, '')))
        .filter((p) => p.length > 0)
        .join(sep);
    },
    sep,
    normalize: (p: string) => p.replace(/[/\\]+/g, sep),
  };
};

// Use Node.js path in main process, simple implementation in renderer
const pathLib = (() => {
  if (isMainProcess) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('path');
    } catch {
      return createSimplePath();
    }
  }
  return createSimplePath();
})();

/**
 * Cross-platform utility functions for handling platform-specific operations
 */
export class PlatformUtils {
  private static _platform: string = getPlatform();

  /**
   * Get the current platform
   */
  static get currentPlatform(): 'win32' | 'darwin' | 'linux' | 'unknown' {
    switch (this._platform) {
      case 'win32':
        return 'win32';
      case 'darwin':
        return 'darwin';
      case 'linux':
        return 'linux';
      default:
        return 'unknown';
    }
  }

  /**
   * Check if the current platform is Windows
   */
  static get isWindows(): boolean {
    return this.currentPlatform === 'win32';
  }

  /**
   * Check if the current platform is macOS
   */
  static get isMac(): boolean {
    return this.currentPlatform === 'darwin';
  }

  /**
   * Check if the current platform is Linux
   */
  static get isLinux(): boolean {
    return this.currentPlatform === 'linux';
  }

  /**
   * Get the path separator for the current platform
   */
  static get pathSeparator(): string {
    return this.isWindows ? '\\' : '/';
  }

  /**
   * Get X-Plane executable name for the current platform
   */
  static get xplaneExecutableName(): string {
    if (this.isWindows) {
      return 'X-Plane.exe';
    } else if (this.isMac) {
      return 'X-Plane.app';
    } else {
      return 'X-Plane';
    }
  }

  /**
   * Get alternative X-Plane executable names for the current platform
   */
  static get xplaneAlternativeNames(): string[] {
    if (this.isWindows) {
      return ['X-Plane 12.exe', 'X-Plane12.exe', 'xplane.exe', 'x-plane.exe'];
    } else if (this.isMac) {
      return ['X-Plane 12.app', 'X-Plane12.app'];
    } else {
      return ['X-Plane-12', 'X-Plane12', 'xplane', 'x-plane'];
    }
  }

  /**
   * Get default X-Plane installation paths for the current platform
   */
  static get defaultXPlaneInstallPaths(): string[] {
    if (this.isWindows) {
      return ['C:\\X-Plane 12', 'C:\\Program Files\\X-Plane 12', 'C:\\Program Files (x86)\\X-Plane 12'];
    } else if (this.isMac) {
      return [
        '/Applications/X-Plane 12',
        pathLib.join(process.env.HOME || '/Users/user', 'X-Plane 12'),
        '/Users/Shared/X-Plane 12',
      ];
    } else {
      return [
        pathLib.join(process.env.HOME || '/home/user', 'X-Plane 12'),
        '/opt/X-Plane 12',
        '/usr/local/X-Plane 12',
        '/home/X-Plane 12',
      ];
    }
  }

  /**
   * Get Steam installation paths for the current platform
   */
  static get steamInstallPaths(): string[] {
    if (this.isWindows) {
      return [
        'C:\\Program Files (x86)\\Steam\\steamapps\\common\\X-Plane 12',
        'C:\\Program Files\\Steam\\steamapps\\common\\X-Plane 12',
      ];
    } else if (this.isMac) {
      return [
        pathLib.join(
          process.env.HOME || '/Users/user',
          'Library/Application Support/Steam/steamapps/common/X-Plane 12'
        ),
        '/Applications/Steam.app/Contents/MacOS/steamapps/common/X-Plane 12',
      ];
    } else {
      return [
        pathLib.join(process.env.HOME || '/home/user', '.steam/steam/steamapps/common/X-Plane 12'),
        pathLib.join(process.env.HOME || '/home/user', '.local/share/Steam/steamapps/common/X-Plane 12'),
        '/opt/steam/steamapps/common/X-Plane 12',
      ];
    }
  }

  /**
   * Get application data directory for the current platform
   */
  static get appDataDirectory(): string {
    if (this.isWindows) {
      return process.env.APPDATA || 'C:\\Users\\User\\AppData\\Roaming';
    } else if (this.isMac) {
      return pathLib.join(process.env.HOME || '/Users/user', 'Library/Application Support');
    } else {
      return pathLib.join(process.env.HOME || '/home/user', '.config');
    }
  }

  /**
   * Get local application data directory for the current platform
   */
  static get localAppDataDirectory(): string {
    if (this.isWindows) {
      return process.env.LOCALAPPDATA || 'C:\\Users\\User\\AppData\\Local';
    } else if (this.isMac) {
      return pathLib.join(process.env.HOME || '/Users/user', 'Library/Caches');
    } else {
      return pathLib.join(process.env.HOME || '/home/user', '.cache');
    }
  }

  /**
   * Get documents directory for the current platform
   */
  static get documentsDirectory(): string {
    if (this.isWindows) {
      return process.env.USERPROFILE
        ? pathLib.join(process.env.USERPROFILE, 'Documents')
        : 'C:\\Users\\User\\Documents';
    } else {
      return pathLib.join(process.env.HOME || (this.isMac ? '/Users/user' : '/home/user'), 'Documents');
    }
  }

  /**
   * Get home directory for the current platform
   */
  static get homeDirectory(): string {
    if (this.isWindows) {
      return process.env.USERPROFILE || 'C:\\Users\\User';
    } else {
      return process.env.HOME || (this.isMac ? '/Users/user' : '/home/user');
    }
  }

  /**
   * Normalize a path for the current platform
   */
  static normalizePath(inputPath: string): string {
    return pathLib.normalize(inputPath);
  }

  /**
   * Join path segments using the correct separator for the current platform
   */
  static joinPath(...segments: string[]): string {
    return pathLib.join(...segments);
  }

  /**
   * Check if a path is absolute
   */
  static isAbsolutePath(inputPath: string): boolean {
    return pathLib.isAbsolute
      ? pathLib.isAbsolute(inputPath)
      : inputPath.startsWith('/') || /^[a-zA-Z]:/.test(inputPath);
  }

  /**
   * Get the directory name from a path
   */
  static dirname(inputPath: string): string {
    return pathLib.dirname
      ? pathLib.dirname(inputPath)
      : inputPath.substring(0, Math.max(inputPath.lastIndexOf('/'), inputPath.lastIndexOf('\\')));
  }

  /**
   * Get the base name from a path
   */
  static basename(inputPath: string, ext?: string): string {
    const name = pathLib.basename
      ? pathLib.basename(inputPath, ext)
      : inputPath.substring(Math.max(inputPath.lastIndexOf('/'), inputPath.lastIndexOf('\\')) + 1);
    return ext && name.endsWith(ext) ? name.substring(0, name.length - ext.length) : name;
  }

  /**
   * Get the extension from a path
   */
  static extname(inputPath: string): string {
    if (pathLib.extname) {
      return pathLib.extname(inputPath);
    }
    const lastDot = inputPath.lastIndexOf('.');
    const lastSlash = Math.max(inputPath.lastIndexOf('/'), inputPath.lastIndexOf('\\'));
    return lastDot > lastSlash ? inputPath.substring(lastDot) : '';
  }
}
