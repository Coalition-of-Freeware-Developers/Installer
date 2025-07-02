import { Addon, ExternalApplicationDefinition, Publisher } from 'renderer/utils/InstallerConfiguration';
import { Resolver } from 'renderer/utils/Resolver';
import { store } from 'renderer/redux/store';
import { ApplicationStatus } from 'renderer/components/AddonSection/Enums';
import { ExternalApps } from 'renderer/utils/ExternalApps';
import { join, extname, parse, dirname, normalize } from 'renderer/stubs/path';
import { Directories } from 'renderer/utils/Directories';
import ipcFs from 'renderer/utils/IPCFileSystem';

// Simplified types
type WindowWithElectron = typeof globalThis & {
  electronAPI?: {
    remote?: {
      shellWriteShortcutLink?: (shortcutPath: string, operation: string, options: unknown) => Promise<boolean>;
      shellOpenPath?: (path: string) => Promise<string>;
    };
  };
};

const getShellWriteShortcutLink = async (
  shortcutPath: string,
  operation: string,
  options: unknown,
): Promise<boolean> => {
  const win = globalThis as WindowWithElectron;
  if (win.electronAPI?.remote?.shellWriteShortcutLink) {
    return await win.electronAPI.remote.shellWriteShortcutLink(shortcutPath, operation, options);
  }
  throw new Error('shell.writeShortcutLink is not available');
};

const getShellOpenPath = async (path: string): Promise<string> => {
  const win = globalThis as WindowWithElectron;
  if (win.electronAPI?.remote?.shellOpenPath) {
    return await win.electronAPI.remote.shellOpenPath(path);
  }
  throw new Error('shell.openPath is not available');
};

const console = globalThis.console;

export const STARTUP_FOLDER_PATH = 'Microsoft\\Windows\\Start Menu\\Programs\\Startup\\';

export class BackgroundServices {
  private static validateExecutablePath(path: string): boolean {
    return /^[a-zA-Z\d_-]+$/.test(path);
  }

  public static getExternalAppFromBackgroundService(addon: Addon, publisher: Publisher): ExternalApplicationDefinition {
    if (!addon.backgroundService) {
      throw new Error('Addon has no background service');
    }

    const appRef = addon.backgroundService.runCheckExternalAppRef;
    const app = Resolver.findDefinition(appRef, publisher);

    if (!app || app.kind !== 'externalApp') {
      throw new Error(
        `Attempted to find external app for background service, but runCheckExternalAppRef=${appRef} does not refer to a valid external app`,
      );
    }

    return app;
  }

  static isRunning(addon: Addon, publisher: Publisher): boolean {
    const app = this.getExternalAppFromBackgroundService(addon, publisher);

    const state = store.getState().applicationStatus[app.key];

    return state === ApplicationStatus.Open;
  }

  static async isAutoStartEnabled(addon: Addon): Promise<boolean> {
    const backgroundService = addon.backgroundService;

    if (!backgroundService) {
      throw new Error('Addon has no background service');
    }

    let folderEntries: string[] = [];
    try {
      folderEntries = (await ipcFs.readdirSync(join(Directories.appData(), STARTUP_FOLDER_PATH))) as string[];
    } catch (e) {
      console.error(
        '[BackgroundServices](isAutoStartEnabled) Could not read contents of startup folder. See exception below',
      );
      console.error(e);
    }

    if (!folderEntries || folderEntries.length === 0) {
      return false;
    }

    const shortcuts = folderEntries.filter((filename: string) => extname(filename) === '.lnk');
    const matchingShortcut = shortcuts.find(
      (filename: string) => parse(filename).name === backgroundService.executableFileBasename,
    );

    return matchingShortcut !== undefined;
  }

  static async setAutoStartEnabled(addon: Addon, publisher: Publisher, enabled: boolean): Promise<void> {
    const backgroundService = addon.backgroundService;

    if (!backgroundService) {
      throw new Error('Addon has no background service');
    }

    if (!this.validateExecutablePath(backgroundService.executableFileBasename)) {
      throw new Error('Executable path much match /^[a-zA-Z\\d_-]+$/.');
    }

    const commandLineArgs = backgroundService.commandLineArgs ? ` ${backgroundService.commandLineArgs.join(' ')}` : '';
    const shortcutDir = join(Directories.appData(), STARTUP_FOLDER_PATH);
    const shortcutPath = join(shortcutDir, `${backgroundService.executableFileBasename}.lnk`);
    const installLocation = await Directories.inInstallLocation(addon.targetDirectory);
    const exePath = join(installLocation, `${backgroundService.executableFileBasename}.exe`);

    if (enabled) {
      try {
        const created = await getShellWriteShortcutLink(shortcutPath, 'create', {
          target: exePath,
          args: commandLineArgs,
          cwd: dirname(exePath),
        });

        if (!created) {
          console.error('[BackgroundServices](setAutoStartEnabled) Could not create shortcut');
        } else {
          console.log('[BackgroundServices](setAutoStartEnabled) Shortcut created');
        }
      } catch (e) {
        console.error('[BackgroundServices](setAutoStartEnabled) Could not create shortcut');
        console.error(e);
      }
    } else {
      ipcFs.rmSync(shortcutPath).catch((e: unknown) => {
        console.error('[BackgroundServices](setAutoStartEnabled) Could not remove shortcut. See exception below.');
        console.error(e);
      });
    }
  }

  static async start(addon: Addon): Promise<void> {
    const backgroundService = addon.backgroundService;

    if (!backgroundService) {
      throw new Error('Addon has no background service');
    }

    if (!this.validateExecutablePath(backgroundService.executableFileBasename)) {
      throw new Error('Executable path much match /^[a-zA-Z\\d_-]+$/.');
    }

    const installLocation = await Directories.inInstallLocation(addon.targetDirectory);
    const exePath = normalize(join(installLocation, `${backgroundService.executableFileBasename}.exe`));

    await getShellOpenPath(exePath);

    // if (exestartsWith('..')) {
    //     throw new Error('Validated and normalized path still traversed directory.');
    // }
    //
    // const commandLineArgs = backgroundService.commandLineArgs ?? [];
    //
    // spawn(exePath, commandLineArgs, { cwd: Directories.inCommunity(addon.targetDirectory), shell: true, detached: true });
  }

  static async kill(addon: Addon, publisher: Publisher): Promise<void> {
    const app = this.getExternalAppFromBackgroundService(addon, publisher);

    return ExternalApps.kill(app);
  }
}
