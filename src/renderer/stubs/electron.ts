// Stub for electron module in renderer process
// This module should not be used directly in renderer process
// All electron operations should go through IPC exposed in preload script

export const ipcRenderer = {
  send: () => {
    throw new Error('electron.ipcRenderer should not be used in renderer process. Use window.electronAPI instead.');
  },
  invoke: () => {
    throw new Error('electron.ipcRenderer should not be used in renderer process. Use window.electronAPI instead.');
  },
  on: () => {
    throw new Error('electron.ipcRenderer should not be used in renderer process. Use window.electronAPI instead.');
  },
};

export const app = {
  getPath: () => {
    throw new Error(
      'electron.app should not be used in renderer process. Use window.electronAPI.remote.getAppPath instead.',
    );
  },
};

export const shell = {
  openPath: () => {
    throw new Error(
      'electron.shell should not be used in renderer process. Use window.electronAPI.remote.shellOpenPath instead.',
    );
  },
};

export const clipboard = {
  writeText: (text: string) => {
    // Simple stub implementation
    globalThis.console?.log('clipboard.writeText called with:', text);
    return Promise.resolve();
  },
  readText: () => {
    // Simple stub implementation
    globalThis.console?.log('clipboard.readText called');
    return Promise.resolve('');
  },
};

export default {
  ipcRenderer,
  app,
  shell,
  clipboard,
};
