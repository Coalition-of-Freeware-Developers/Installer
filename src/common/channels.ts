export default {
  window: {
    minimize: 'window/minimize',
    maximize: 'window/maximize',
    close: 'window/close',
    isMaximized: 'window/isMaximized',
    reload: 'window/reload',
  },
  update: {
    error: 'update/error',
    available: 'update/available',
    downloaded: 'update/downloaded',
  },
  fs: {
    existsSync: 'fs/existsSync',
    readdirSync: 'fs/readdirSync',
    rmSync: 'fs/rmSync',
    removeAllTemp: 'fs/removeAllTemp',
  },
  checkForInstallerUpdate: 'checkForInstallerUpdate',
  installManager: {
    installEvent: 'installManager/installEvent',
    installFromUrl: 'installManager/installFromUrl',
    cancelInstall: 'installManager/cancelInstall',
    uninstall: 'installManager/uninstall',
  },
  remote: {
    getAppPath: 'remote/getAppPath',
    showOpenDialog: 'remote/showOpenDialog',
    showMessageBox: 'remote/showMessageBox',
    shellOpenPath: 'remote/shellOpenPath',
    shellOpenExternal: 'remote/shellOpenExternal',
    shellWriteShortcutLink: 'remote/shellWriteShortcutLink',
    clipboardWriteText: 'remote/clipboardWriteText',
  },
  openPath: 'openPath',
};
