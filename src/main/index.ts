import { app, BrowserWindow, Menu, shell, ipcMain, dialog, OpenDialogOptions, MessageBoxOptions } from 'electron';
import { NsisUpdater } from 'electron-updater';
import installExtension, { REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import * as packageInfo from '../../package.json';
import settings, { persistWindowSettings } from './mainSettings';
import channels from 'common/channels';
import { InstallManager } from 'main/InstallManager';
import { SteamDetectionMain } from 'main/SteamDetection';
import Store from 'electron-store';
import path from 'path';
import fs from 'fs';
import net from 'net';

// Use process.cwd() instead of __dirname to avoid ESM conflicts
// const appDir = app.isPackaged ? path.dirname(process.execPath) : process.cwd();

// Get proper preload path
const getPreloadPath = () => {
  if (app.isPackaged) {
    // In packaged mode, files are inside app.asar
    const asarPath = path.join(process.resourcesPath, 'app.asar', 'out', 'preload', 'preload.mjs');
    console.log('Using preload path (packaged):', asarPath);
    return asarPath;
  } else {
    return path.join(process.cwd(), 'out', 'preload', 'preload.mjs');
  }
};

// Define renderer paths
const getRendererPaths = () => {
  if (app.isPackaged) {
    // In packaged mode, files are inside app.asar
    return [path.join(process.resourcesPath, 'app.asar', 'out', 'renderer', 'index.html')];
  } else {
    return [path.join(process.cwd(), 'out', 'renderer', 'index.html')];
  }
};

// Polyfills for Node.js globals in ES modules
const console = globalThis.console;
const global = globalThis;

function initializeApp() {
  Store.initRenderer();

  function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      minWidth: 1280,
      minHeight: 800,
      frame: false,
      icon: 'src/main/icons/icon.ico',
      backgroundColor: '#333333',
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: getPreloadPath(),
        webSecurity: !app.isPackaged, // Only disable in development
        sandbox: false, // Keep disabled for filesystem access and IPC functionality
        allowRunningInsecureContent: false, // Disabled for security
        experimentalFeatures: false, // Disable experimental features for stability
        javascript: true, // Explicitly enable JavaScript
        plugins: false, // Disable plugins for security
        defaultEncoding: 'UTF-8',
        nodeIntegrationInWorker: false,
        nodeIntegrationInSubFrames: false,
        enableWebSQL: false,
      },
    });

    const UpsertKeyValue = (
      header: Record<string, string> | Record<string, string[]>,
      keyToChange: string,
      value: string | string[],
    ) => {
      for (const key of Object.keys(header)) {
        if (key.toLowerCase() === keyToChange.toLowerCase()) {
          header[key] = value;
          return;
        }
      }
      header[keyToChange] = value;
    };

    // Prevent <a> tags from opening in Electron
    mainWindow.webContents.setWindowOpenHandler(() => {
      return { action: 'deny' };
    });

    mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
      const { requestHeaders } = details;
      UpsertKeyValue(requestHeaders, 'Access-Control-Allow-Origin', '*');
      callback({ requestHeaders });
    });

    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      const { responseHeaders } = details;
      UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Origin', ['*']);
      UpsertKeyValue(responseHeaders, 'Access-Control-Allow-Headers', ['*']);
      callback({
        responseHeaders,
      });
    });

    // Ensure React DevTools can detect React applications
    if (import.meta.env.DEV) {
      mainWindow.webContents.session.webRequest.onBeforeRequest((details, callback) => {
        // Allow React DevTools to work properly
        callback({});
      });
    }

    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
    });

    // Add error handling for renderer process
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
      console.log(`[RENDERER] ${level}: ${message} at ${sourceId}:${line}`);
    });

    mainWindow.webContents.on('crashed', (event, killed) => {
      console.error('Renderer process crashed:', { event, killed });
    });

    mainWindow.webContents.on('unresponsive', () => {
      console.error('Renderer process became unresponsive');
    });

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      console.error('Failed to load:', { errorCode, errorDescription, validatedURL, isMainFrame });
    });

    mainWindow.webContents.on('did-finish-load', () => {
      console.log('Renderer finished loading');
    });

    mainWindow.on('closed', () => {
      mainWindow.removeAllListeners();
      app.quit();
    });

    ipcMain.on(channels.window.minimize, () => {
      mainWindow.minimize();
    });

    ipcMain.on(channels.window.maximize, () => {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    });

    ipcMain.on(channels.window.close, () => {
      persistWindowSettings(mainWindow);
      mainWindow.destroy();
    });

    ipcMain.on(channels.window.reload, () => {
      mainWindow.reload();
    });

    ipcMain.on(channels.window.isMaximized, (event) => {
      event.sender.send(channels.window.isMaximized, mainWindow.isMaximized());
    });

    ipcMain.on(channels.openPath, (_, value: string) => {
      void shell.openPath(value);
    });

    ipcMain.on('request-startup-at-login-changed', (_, value: boolean) => {
      app.setLoginItemSettings({
        openAtLogin: value,
      });
    });

    /*
     * Setting the value of the program's taskbar progress bar.
     * value: The value to set the progress bar to. ( [0 - 1.0], -1 to hide the progress bar )
     */
    ipcMain.on('set-window-progress-bar', (_, value: number) => {
      mainWindow.setProgressBar(value);
    });

    // Remote functionality handlers
    ipcMain.handle(channels.remote.getAppPath, (_, name: string) => {
      return app.getPath(
        name as
          | 'home'
          | 'appData'
          | 'userData'
          | 'sessionData'
          | 'temp'
          | 'exe'
          | 'module'
          | 'desktop'
          | 'documents'
          | 'downloads'
          | 'music'
          | 'pictures'
          | 'videos'
          | 'recent'
          | 'logs'
          | 'crashDumps',
      );
    });

    ipcMain.handle(channels.remote.showOpenDialog, async (_, options: OpenDialogOptions) => {
      return await dialog.showOpenDialog(mainWindow, options);
    });

    ipcMain.handle(channels.remote.showMessageBox, async (_, options: MessageBoxOptions) => {
      return await dialog.showMessageBox(mainWindow, options);
    });

    ipcMain.handle(channels.remote.shellOpenPath, async (_, path: string) => {
      return await shell.openPath(path);
    });

    ipcMain.handle(channels.remote.shellOpenExternal, async (_, url: string) => {
      return await shell.openExternal(url);
    });

    ipcMain.handle(channels.remote.clipboardWriteText, async (_, text: string, type?: string) => {
      const { clipboard } = await import('electron');
      clipboard.writeText(text, type as 'selection' | 'clipboard' | undefined);
    });

    ipcMain.handle(
      channels.remote.shellWriteShortcutLink,
      async (_, shortcutPath: string, operation: string, options: unknown) => {
        return shell.writeShortcutLink(
          shortcutPath,
          operation as 'create' | 'update' | 'replace',
          options as Parameters<typeof shell.writeShortcutLink>[1],
        );
      },
    );

    // Filesystem functionality handlers
    ipcMain.handle(channels.fs.existsSync, (_, path: string) => {
      try {
        return fs.existsSync(path);
      } catch (error) {
        console.error('Error checking if path exists:', error);
        return false;
      }
    });

    ipcMain.handle(channels.fs.readdirSync, (_, path: string, options?: Parameters<typeof fs.readdirSync>[1]) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return fs.readdirSync(path, options as any);
      } catch (error) {
        console.error('Error reading directory:', error);
        return [];
      }
    });

    ipcMain.handle(channels.fs.rmSync, (_, path: string, options?: { recursive?: boolean; force?: boolean }) => {
      try {
        fs.rmSync(path, options);
        return { success: true };
      } catch (error) {
        console.error('Error removing path:', error);
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle(channels.fs.removeAllTemp, async () => {
      try {
        console.log('[CLEANUP] Removing all temp directories from main process');

        // We need to get the temp location from settings
        const separateTempLocation = settings.get('mainSettings.separateTempLocation');
        const tempLocationPath = separateTempLocation
          ? (settings.get('mainSettings.tempLocation') as string)
          : (settings.get('mainSettings.installPath') as string);

        if (!fs.existsSync(tempLocationPath)) {
          console.warn('[CLEANUP] Location of temporary folders does not exist. Aborting');
          return { success: true };
        }

        const TEMP_DIRECTORY_PREFIXES_FOR_CLEANUP = [
          'coalition_current_install',
          'coalition_current_install',
          'coalition-current-install',
        ];

        const dirents = fs
          .readdirSync(tempLocationPath, { withFileTypes: true })
          .filter((dirEnt) => dirEnt.isDirectory())
          .filter((dirEnt) => TEMP_DIRECTORY_PREFIXES_FOR_CLEANUP.some((prefix) => dirEnt.name.startsWith(prefix)));

        for (const dir of dirents) {
          const fullPath = path.join(tempLocationPath, dir.name);
          console.log('[CLEANUP] Removing', fullPath);
          try {
            fs.rmSync(fullPath, { recursive: true });
            console.log('[CLEANUP] Removed', fullPath);
          } catch (e) {
            console.error('[CLEANUP] Could not remove', fullPath, e);
          }
        }

        console.log('[CLEANUP] Finished removing all temp directories');
        return { success: true };
      } catch (error) {
        console.error('Error removing temp directories:', error);
        return { success: false, error: (error as Error).message };
      }
    });

    // Network functionality handlers
    ipcMain.handle(channels.net.tcpConnect, async (_, port: number, host: string = 'localhost'): Promise<boolean> => {
      return new Promise((resolve) => {
        try {
          // Validate inputs
          if (!port || typeof port !== 'number' || port <= 0 || port > 65535) {
            console.error('Invalid port number:', port);
            resolve(false);
            return;
          }

          if (!host || typeof host !== 'string') {
            console.error('Invalid host:', host);
            resolve(false);
            return;
          }

          const socket = net.connect(port, host);

          socket.on('connect', () => {
            resolve(true);
            socket.destroy();
          });

          socket.on('error', (error) => {
            console.error('Socket error:', error);
            resolve(false);
            socket.destroy();
          });

          // Add a timeout to prevent hanging
          socket.setTimeout(5000, () => {
            resolve(false);
            socket.destroy();
          });
        } catch (error) {
          console.error('Error creating TCP connection:', error);
          resolve(false);
        }
      });
    });

    const lastX = settings.get<string, number>('cache.main.lastWindowX');
    const lastY = settings.get<string, number>('cache.main.lastWindowY');
    const shouldMaximize = settings.get<string, boolean>('cache.main.maximized');

    if (shouldMaximize) {
      mainWindow.maximize();
    } else if (lastX && lastY) {
      // 0 width and height should be reset to defaults
      mainWindow.setBounds({
        width: lastX,
        height: lastY,
      });
    }

    mainWindow.center();

    if ((settings.get('mainSettings.configDownloadUrl') as string) === '') {
      settings.set('mainSettings.configDownloadUrl', packageInfo.configUrls.production);
    }

    if (import.meta.env.DEV) {
      // Open DevTools after the page loads to ensure extensions are properly loaded
      mainWindow.webContents.once('dom-ready', () => {
        console.log('DOM ready, opening DevTools with extensions...');
        mainWindow.webContents.openDevTools();
      });
    }

    const loadRendererWithRetry = async (retries = 3, delay = 1000) => {
      for (let i = 0; i < retries; i++) {
        try {
          console.log(`Attempting to load renderer URL: ${process.env.ELECTRON_RENDERER_URL}`);
          await mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
          console.log('Successfully loaded renderer URL');
          return;
        } catch (error) {
          console.error(`Attempt ${i + 1} failed to load renderer URL:`, error);
          if (i < retries - 1) {
            console.log(`Retrying in ${delay}ms...`);
            await new Promise((resolve) => global.setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
          }
        }
      }
      console.error('All attempts to load renderer URL failed');

      // If all retries failed, try to load a simple fallback
      try {
        const fallbackHTML = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Installer Loading Error</title>
              <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #1b2434; color: white; }
                .error { color: #ff6b6b; margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <h1>Development Server Connection Failed</h1>
              <div class="error">Could not connect to the development server.</div>
              <p>Please make sure the development server is running on ${process.env.ELECTRON_RENDERER_URL}</p>
              <p>Try running: <code>npm run dev</code></p>
            </body>
          </html>
        `;
        await mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(fallbackHTML)}`);
      } catch (fallbackError) {
        console.error('Even fallback HTML failed to load:', fallbackError);
      }
    };

    if (!app.isPackaged) {
      loadRendererWithRetry().catch(console.error);
    } else {
      // In production, load the built HTML file
      const loadRendererFile = async () => {
        const rendererPaths = getRendererPaths();

        for (const rendererPath of rendererPaths) {
          try {
            console.log('Attempting to load renderer from:', rendererPath);

            // Check if the file exists before trying to load it
            if (fs.existsSync(rendererPath)) {
              console.log('Found renderer file at:', rendererPath);
              await mainWindow.loadFile(rendererPath);
              console.log('Successfully loaded renderer from:', rendererPath);
              return;
            } else {
              console.log('Renderer file not found at:', rendererPath);
            }
          } catch (error) {
            console.error('Failed to load renderer from:', rendererPath, error);
          }
        }

        // If we get here, no renderer file was found
        console.error('No renderer file found at any expected location');
        const fallbackHTML = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Installer Loading Error</title>
              <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #1b2434; color: white; }
                .error { color: #ff6b6b; margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <h1>Renderer Loading Error</h1>
              <div class="error">Could not find the renderer files.</div>
              <p>Searched locations:</p>
              <ul style="text-align: left; max-width: 600px; margin: 0 auto;">
                ${rendererPaths.map((p) => `<li>${p}</li>`).join('')}
              </ul>
              <p>Please reinstall the application.</p>
            </body>
          </html>
        `;

        try {
          await mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(fallbackHTML)}`);
        } catch (fallbackError) {
          console.error('Even fallback HTML failed to load:', fallbackError);
        }
      };

      loadRendererFile().catch(console.error);
    }

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url).then();
      return { action: 'deny' };
    });

    if (import.meta.env.DEV) {
      // Open the settings in editor for development
      settings.openInEditor();
    }

    // Auto updater
    if (process.env.NODE_ENV !== 'development') {
      let updateOptions;
      if (packageInfo.version.includes('dev')) {
        updateOptions = {
          provider: 'generic' as const,
          url: 'null',
        };
      } else if (packageInfo.version.includes('rc')) {
        updateOptions = {
          provider: 'generic' as const,
          url: 'null',
        };
      } else {
        updateOptions = {
          provider: 'generic' as const,
          url: 'null',
        };
      }

      const autoUpdater = new NsisUpdater(updateOptions);

      autoUpdater.addListener('update-downloaded', (event) => {
        mainWindow.webContents.send(channels.update.downloaded, { event });
      });

      autoUpdater.addListener('update-available', () => {
        mainWindow.webContents.send(channels.update.available);
      });

      autoUpdater.addListener('error', (error) => {
        mainWindow.webContents.send(channels.update.error, { error });
      });

      // tell autoupdater to check for updates
      mainWindow.once('show', () => {
        autoUpdater.checkForUpdates().then();
      });

      ipcMain.on(channels.checkForInstallerUpdate, () => {
        autoUpdater.checkForUpdates().then();
      });

      ipcMain.on('restartAndUpdate', () => {
        autoUpdater.quitAndInstall();
        app.exit();
      });
    }

    // Electron store IPC handlers
    ipcMain.handle('electron-store-get', (_, key: string, defaultValue?: unknown) => {
      return settings.get(key, defaultValue);
    });

    ipcMain.handle('electron-store-set', (_, key: string, value: unknown) => {
      settings.set(key, value);
    });

    ipcMain.handle('electron-store-delete', (_, key: string) => {
      // Use type assertion to work around strict typing
      (settings as { delete: (key: string) => void }).delete(key);
    });

    ipcMain.handle('electron-store-clear', () => {
      settings.clear();
    });

    // Handle store change notifications
    settings.onDidAnyChange((newValue, oldValue) => {
      // Notify all change listeners for any key that changed
      const oldKeys = oldValue ? Object.keys(oldValue as Record<string, unknown>) : [];
      const newKeys = newValue ? Object.keys(newValue as Record<string, unknown>) : [];
      const allKeys = new Set([...oldKeys, ...newKeys]);

      for (const key of allKeys) {
        const oldVal = oldValue ? (oldValue as Record<string, unknown>)[key] : undefined;
        const newVal = newValue ? (newValue as Record<string, unknown>)[key] : undefined;

        if (oldVal !== newVal) {
          mainWindow.webContents.send(`electron-store-changed-${key}`, newVal, oldVal);
        }
      }
    });

    //Register keybinds
    mainWindow.webContents.on('before-input-event', (event, input) => {
      // Check if the input event is for window reloading
      if (
        input.type === 'keyUp' &&
        (input.key.toLowerCase() === 'r' || input.key === 'F5') &&
        (input.control || input.meta)
      ) {
        if (mainWindow.isFocused()) {
          mainWindow.reload();
        }
      }

      // Check if the input even is for dev tools
      if (input.type === 'keyUp' && input.key === 'F12' && (input.control || input.meta)) {
        if (mainWindow.isFocused()) {
          mainWindow.webContents.toggleDevTools();
        }
      }
    });
  }

  if (!app.requestSingleInstanceLock()) {
    app.quit();
  }

  app.setAppUserModelId('Coalition of Freeware Developers - Installer');

  let mainWindow: BrowserWindow;

  Menu.setApplicationMenu(null);

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', async () => {
    // Install DevTools extensions before creating the window in development
    if (import.meta.env.DEV) {
      try {
        console.log('Installing DevTools extensions...');

        // Install React Developer Tools
        const reactDevToolsName = await installExtension(REACT_DEVELOPER_TOOLS);
        console.log(`Added Extension: ${reactDevToolsName}`);

        // Install Redux DevTools
        const reduxDevToolsName = await installExtension(REDUX_DEVTOOLS);
        console.log(`Added Extension: ${reduxDevToolsName}`);

        console.log('DevTools extensions installed successfully');
      } catch (err) {
        console.error('Failed to install DevTools extensions:', err);
      }
    }

    createWindow();
  });

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Someone tried to run a second instance, we should focus our window.
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });
}

InstallManager.setupIpcListeners();
SteamDetectionMain.setupIpcListeners();

initializeApp();
