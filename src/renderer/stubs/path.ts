// Path utilities for renderer process
// This provides path functionality that works in the browser environment

// Detect platform dynamically - try to use navigator if available
const detectPlatform = (): boolean => {
  // Try to detect platform from user agent or other browser APIs
  if (typeof navigator !== 'undefined' && navigator.platform) {
    return navigator.platform.toLowerCase().includes('win');
  }
  
  // Try to detect from global process if available
  if (typeof globalThis !== 'undefined' && (globalThis as any).process?.platform) {
    return (globalThis as any).process.platform === 'win32';
  }
  
  // Default to current environment - will be overridden by main process
  return process?.platform === 'win32' || false;
};

// Platform detection - can be overridden by main process
let isWindows = detectPlatform();

// Allow platform override from main process
if (typeof globalThis !== 'undefined' && (globalThis as any).electronAPI?.platform) {
  isWindows = (globalThis as any).electronAPI.platform === 'win32';
}

export const join = (...paths: string[]): string => {
  // Handle Windows and Unix paths
  const separator = isWindows ? '\\' : '/';

  return paths
    .filter((pathPart) => pathPart != null && typeof pathPart === 'string' && pathPart.length > 0) // Filter out null/undefined/empty
    .map((pathPart, index) => {
      if (index === 0) {
        return pathPart.replace(/[/\\]+$/, '');
      }
      return pathPart.replace(/^[/\\]+/, '').replace(/[/\\]+$/, '');
    })
    .filter((pathPart) => pathPart.length > 0)
    .join(separator);
};

export const normalize = (path: string): string => {
  if (!path || path.trim() === '') return '.';

  // Trim whitespace
  path = path.trim();

  // Handle Windows and Unix paths
  const separator = isWindows ? '\\' : '/';

  // Handle Windows drive letters properly
  let driveLetter = '';
  if (isWindows && /^[a-zA-Z]:/.test(path)) {
    driveLetter = path.substring(0, 2);
    path = path.substring(2);
  }

  // Split the path and clean up empty segments
  const segments = path.split(/[/\\]+/).filter((segment) => segment !== '');
  const normalizedSegments: string[] = [];

  for (const segment of segments) {
    if (segment === '.') {
      continue;
    } else if (segment === '..') {
      if (normalizedSegments.length > 0 && normalizedSegments[normalizedSegments.length - 1] !== '..') {
        normalizedSegments.pop();
      } else {
        normalizedSegments.push(segment);
      }
    } else {
      normalizedSegments.push(segment);
    }
  }

  let result = normalizedSegments.join(separator);

  // Add back drive letter if present
  if (driveLetter) {
    result = driveLetter + separator + result;
  } else if (path.startsWith('/') || path.startsWith('\\')) {
    // Preserve leading slash/backslash for absolute paths
    result = separator + result;
  }

  return result || (driveLetter ? driveLetter + separator : '.');
};

export const extname = (path: string): string => {
  const lastDot = path.lastIndexOf('.');
  const lastSlash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));

  if (lastDot <= lastSlash) {
    return '';
  }

  return path.substring(lastDot);
};

export const parse = (path: string): { name: string; ext: string; base: string; dir: string } => {
  const lastSlash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
  const dir = lastSlash === -1 ? '' : path.substring(0, lastSlash);
  const base = lastSlash === -1 ? path : path.substring(lastSlash + 1);
  const lastDot = base.lastIndexOf('.');

  let name: string;
  let ext: string;

  if (lastDot === -1 || lastDot === 0) {
    name = base;
    ext = '';
  } else {
    name = base.substring(0, lastDot);
    ext = base.substring(lastDot);
  }

  return { name, ext, base, dir };
};

export const dirname = (path: string): string => {
  const lastSlash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));

  if (lastSlash === -1) {
    return '.';
  }

  if (lastSlash === 0) {
    return isWindows ? '\\' : '/';
  }

  return path.substring(0, lastSlash);
};

// Re-export all functions as default export object for compatibility
export default {
  join,
  normalize,
  extname,
  parse,
  dirname,
};
