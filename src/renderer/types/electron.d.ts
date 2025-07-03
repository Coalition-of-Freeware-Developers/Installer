// Electron API types exposed via preload script
interface ElectronAPI {
  // Window controls
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  reloadWindow: () => void;
  isMaximized: () => void;
  onIsMaximized: (callback: (isMaximized: boolean) => void) => void;

  // General IPC
  openPath: (path: string) => void;
  setStartupAtLogin: (value: boolean) => void;
  setWindowProgressBar: (value: number) => void;

  // Updates
  checkForInstallerUpdate: () => void;
  restartAndUpdate: () => void;
  onUpdateDownloaded: (callback: (data: unknown) => void) => void;
  onUpdateAvailable: (callback: () => void) => void;
  onUpdateError: (callback: (data: unknown) => void) => void;

  // Remote functionality
  remote: {
    getAppPath: (name: string) => Promise<string>;
    showOpenDialog: (options: unknown) => Promise<{ filePaths: string[]; canceled: boolean }>;
    showMessageBox: (options: unknown) => Promise<{ response: number; checkboxChecked?: boolean }>;
    shellOpenPath: (path: string) => Promise<string>;
    shellOpenExternal: (url: string) => Promise<void>;
    shellWriteShortcutLink: (shortcutPath: string, operation: string, options: unknown) => Promise<boolean>;
    clipboardWriteText: (text: string, type?: string) => Promise<void>;
  };

  // Install Manager
  installManager: {
    installFromUrl: (installID: string, url: string, tempDir: string, destDir: string) => Promise<unknown>;
    uninstall: (installDir: string, files: string[]) => Promise<unknown>;
    cancelInstall: (installID: string) => void;
    onInstallEvent: (callback: (data: unknown) => void) => void;
    removeInstallEventListener: (callback: (data: unknown) => void) => void;
  };

  // Filesystem operations
  fs: {
    existsSync: (path: string) => Promise<boolean>;
    readdirSync: (path: string, options?: unknown) => Promise<string[] | unknown[]>;
    rmSync: (
      path: string,
      options?: { recursive?: boolean; force?: boolean },
    ) => Promise<{ success: boolean; error?: string }>;
    removeAllTemp: () => Promise<{ success: boolean; error?: string }>;
  };

  // Network operations
  net: {
    tcpConnect: (port: number, host?: string) => Promise<boolean>;
  };

  // Generic IPC methods
  send: (channel: string, ...args: unknown[]) => void;
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  on: (channel: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (channel: string, callback: (...args: unknown[]) => void) => void;
  removeAllListeners: (channel: string) => void;
}

interface ElectronStore {
  get: (key: string, defaultValue?: unknown) => Promise<unknown>;
  set: (key: string, value: unknown) => Promise<void>;
  delete: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  onDidChange: (key: string, callback: (newValue: unknown, oldValue: unknown) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    electronStore?: ElectronStore;
    // Polyfilled Node.js globals
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    process?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Buffer?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    module?: any;
  }
}

export {};
