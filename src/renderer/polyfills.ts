// Global polyfills for Node.js compatibility in Electron renderer
// This file ensures process and other globals are available before any module initialization

// Ensure process is available globally BEFORE any imports
if (typeof globalThis !== 'undefined') {
  // Process polyfill for renderer
  if (typeof globalThis.process === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).process = {
      platform: 'win32',
      env: {},
      argv: [],
      version: '',
      versions: {},
      pid: 0,
      title: '',
      arch: 'x64',
      cwd: () => '',
      chdir: () => {},
      nextTick: (callback: () => void) => globalThis.setTimeout(callback, 0),
      browser: true,
      node: false,
    };
  }

  // Ensure global points to globalThis
  if (typeof globalThis.global === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).global = globalThis;
  }

  // Make sure window has these as well in browser context
  if (typeof globalThis.window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = globalThis.window as any;
    if (!win.process) {
      win.process = globalThis.process;
    }
    if (!win.global) {
      win.global = globalThis;
    }
  }
}

export {};
