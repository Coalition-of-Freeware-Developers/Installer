import { contextBridge, ipcRenderer } from 'electron';
import channels from 'common/channels';

const console = globalThis.console;

console.log('Preload script is loading...');

// Type for window with polyfills
interface WindowWithPolyfills {
  Buffer?: typeof globalThis.Buffer;
  module?: unknown;
  process?: unknown;
  electronAPI?: unknown;
  electronStore?: unknown;
}

// Polyfill for Node.js globals in renderer if needed
if (typeof globalThis.window !== 'undefined') {
  const windowWithGlobals = globalThis.window as unknown as WindowWithPolyfills;

  // Ensure module global exists for compatibility
  if (typeof windowWithGlobals.module === 'undefined') {
    windowWithGlobals.module = {};
  }

  // Comprehensive process polyfill
  if (typeof windowWithGlobals.process === 'undefined') {
    windowWithGlobals.process = {
      platform: 'win32',
      env: {},
      argv: [],
      version: '',
      versions: {} as Record<string, string>,
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

  // Ensure Buffer is available globally if not already polyfilled
  if (typeof windowWithGlobals.Buffer === 'undefined' && typeof globalThis.Buffer !== 'undefined') {
    windowWithGlobals.Buffer = globalThis.Buffer;
  }

  // Ensure process is available globally if not already polyfilled
  if (typeof windowWithGlobals.process === 'undefined' && typeof globalThis.process !== 'undefined') {
    windowWithGlobals.process = globalThis.process as unknown;
  }

  // Ensure global is available
  if (!globalThis.global) {
    globalThis.global = globalThis;
  }
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI = {
  // Window controls
  minimizeWindow: () => ipcRenderer.send(channels.window.minimize),
  maximizeWindow: () => ipcRenderer.send(channels.window.maximize),
  closeWindow: () => ipcRenderer.send(channels.window.close),
  reloadWindow: () => ipcRenderer.send(channels.window.reload),
  isMaximized: () => ipcRenderer.send(channels.window.isMaximized),
  onIsMaximized: (callback: (isMaximized: boolean) => void) => {
    ipcRenderer.on(channels.window.isMaximized, (_, isMaximized) => callback(isMaximized));
  },

  // General IPC
  openPath: (path: string) => ipcRenderer.send(channels.openPath, path),
  setStartupAtLogin: (value: boolean) => ipcRenderer.send('request-startup-at-login-changed', value),
  setWindowProgressBar: (value: number) => ipcRenderer.send('set-window-progress-bar', value),
  checkForInstallerUpdate: () => ipcRenderer.send(channels.checkForInstallerUpdate),
  restartAndUpdate: () => ipcRenderer.send('restartAndUpdate'),
  onUpdateDownloaded: (callback: (data: unknown) => void) => {
    ipcRenderer.on(channels.update.downloaded, callback);
  },
  onUpdateAvailable: (callback: () => void) => {
    ipcRenderer.on(channels.update.available, callback);
  },
  onUpdateError: (callback: (data: unknown) => void) => {
    ipcRenderer.on(channels.update.error, callback);
  },
  remote: {
    getAppPath: (name: string) => ipcRenderer.invoke(channels.remote.getAppPath, name),
    showOpenDialog: (options: unknown) => ipcRenderer.invoke(channels.remote.showOpenDialog, options),
    showMessageBox: (options: unknown) => ipcRenderer.invoke(channels.remote.showMessageBox, options),
    shellOpenPath: (path: string) => ipcRenderer.invoke(channels.remote.shellOpenPath, path),
    shellOpenExternal: (url: string) => ipcRenderer.invoke(channels.remote.shellOpenExternal, url),
    shellWriteShortcutLink: (shortcutPath: string, operation: string, options: unknown) =>
      ipcRenderer.invoke(channels.remote.shellWriteShortcutLink, shortcutPath, operation, options),
    clipboardWriteText: (text: string, type?: string) =>
      ipcRenderer.invoke(channels.remote.clipboardWriteText, text, type),
  },

  // Install Manager
  installManager: {
    installFromUrl: (installID: string, url: string, tempDir: string, destDir: string) =>
      ipcRenderer.invoke(channels.installManager.installFromUrl, installID, url, tempDir, destDir),
    uninstall: (installDir: string, files: string[]) =>
      ipcRenderer.invoke(channels.installManager.uninstall, installDir, files),
    cancelInstall: (installID: string) => ipcRenderer.send(channels.installManager.cancelInstall, installID),
    onInstallEvent: (callback: (data: unknown) => void) => {
      ipcRenderer.on(channels.installManager.installEvent, (_, data) => callback(data));
    },
    removeInstallEventListener: (callback: (data: unknown) => void) => {
      ipcRenderer.removeListener(channels.installManager.installEvent, callback);
    },
  },

  // Filesystem operations
  fs: {
    existsSync: (path: string) => ipcRenderer.invoke(channels.fs.existsSync, path),
    readdirSync: (path: string, options?: unknown) => ipcRenderer.invoke(channels.fs.readdirSync, path, options),
    rmSync: (path: string, options?: { recursive?: boolean; force?: boolean }) =>
      ipcRenderer.invoke(channels.fs.rmSync, path, options),
    removeAllTemp: () => ipcRenderer.invoke(channels.fs.removeAllTemp),
  },

  // Generic IPC methods for any remaining use cases
  send: (channel: string, ...args: unknown[]) => ipcRenderer.send(channel, ...args),
  invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args),
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.on(channel, (_, ...args) => callback(...args));
  },
  removeListener: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },
  removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel),
};

// Expose electron-store for settings through IPC
const electronStore = {
  get: (key: string, defaultValue?: unknown) => {
    return ipcRenderer.invoke('electron-store-get', key, defaultValue);
  },
  set: (key: string, value: unknown) => {
    return ipcRenderer.invoke('electron-store-set', key, value);
  },
  delete: (key: string) => {
    return ipcRenderer.invoke('electron-store-delete', key);
  },
  clear: () => {
    return ipcRenderer.invoke('electron-store-clear');
  },
  onDidChange: (key: string, callback: (newValue: unknown, oldValue: unknown) => void) => {
    const channel = `electron-store-changed-${key}`;
    const wrappedCallback = (_: unknown, newValue: unknown, oldValue: unknown) => {
      callback(newValue, oldValue);
    };
    ipcRenderer.on(channel, wrappedCallback);

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener(channel, wrappedCallback);
    };
  },
};

// Check if contextBridge is available and context isolation is enabled
try {
  console.log('Setting up context bridge...');
  contextBridge.exposeInMainWorld('electronAPI', electronAPI);
  contextBridge.exposeInMainWorld('electronStore', electronStore);
  console.log('Context bridge setup complete');
} catch (error) {
  console.error('Failed to set up context bridge:', error);
  // Fallback for when contextIsolation is disabled
  if (typeof globalThis.window !== 'undefined') {
    console.log('Using window fallback for API exposure');
    const windowWithAPIs = globalThis.window as unknown as WindowWithPolyfills;
    windowWithAPIs.electronAPI = electronAPI;
    windowWithAPIs.electronStore = electronStore;
  }
}
