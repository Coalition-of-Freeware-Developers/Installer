import { normalize, join } from 'renderer/stubs/path';
import { Addon } from 'renderer/utils/InstallerConfiguration';
import ipcFs from 'renderer/utils/IPCFileSystem';
import settings from 'renderer/rendererSettings';

// Simplified types
type WindowWithElectron = typeof globalThis & {
  electronAPI?: {
    remote?: {
      getAppPath?: (name: string) => Promise<string>;
    };
  };
};

const console = globalThis.console;

const _getAppPath = async (name: string): Promise<string> => {
  const win = globalThis as WindowWithElectron;
  if (win.electronAPI?.remote?.getAppPath) {
    return await win.electronAPI.remote.getAppPath(name);
  }
  // Fallback for development/testing
  switch (name) {
    case 'appData':
      return 'C:\\Users\\User\\AppData\\Roaming';
    case 'documents':
      return 'C:\\Users\\User\\Documents';
    default:
      return '';
  }
};

const TEMP_DIRECTORY_PREFIX = 'coalition-current-install';

const _TEMP_DIRECTORY_PREFIXES_FOR_CLEANUP = [
  'flybywire_current_install',
  'coalition_current_install',
  TEMP_DIRECTORY_PREFIX,
];
export class Directories {
  private static sanitize(suffix: string): string {
    return normalize(suffix).replace(/^(\.\.(\/|\\|$))+/, '');
  }

  static appData(): string {
    // Provide synchronous fallback - this will be improved with async methods
    return 'C:\\Users\\User\\AppData\\Roaming';
  }

  static localAppData(): string {
    return join(this.appData(), '..', 'Local');
  }

  static documentsDir(): string {
    // Provide synchronous fallback - this will be improved with async methods
    return 'C:\\Users\\User\\Documents';
  }

  static steamAppsCommon(): string {
    return join('C:', 'Program Files (x86)', 'Steam', 'steamapps', 'common');
  }

  static async xp12BasePath(): Promise<string> {
    return settings.get('mainSettings.xp12BasePath') as Promise<string>;
  }

  static async xplaneBasePath(): Promise<string> {
    return this.xp12BasePath();
  }

  static async communityLocation(): Promise<string> {
    // In X-Plane 12, addons typically go in Aircraft folder
    return await this.aircraftLocation();
  }

  static async aircraftLocation(): Promise<string> {
    return settings.get('mainSettings.xp12AircraftPath') as Promise<string>;
  }

  static async customDataLocation(): Promise<string> {
    return settings.get('mainSettings.xp12CustomDataPath') as Promise<string>;
  }

  static async customSceneryLocation(): Promise<string> {
    return settings.get('mainSettings.xp12CustomSceneryPath') as Promise<string>;
  }

  static async resourcesLocation(): Promise<string> {
    return settings.get('mainSettings.xp12ResourcesPath') as Promise<string>;
  }

  static async pluginsLocation(): Promise<string> {
    return settings.get('mainSettings.xp12PluginsPath') as Promise<string>;
  }

  static async inAircraftLocation(targetDir: string): Promise<string> {
    return join(await Directories.aircraftLocation(), this.sanitize(targetDir));
  }

  static async inAircraftPackage(addon: Addon, targetDir: string): Promise<string> {
    const baseDir = await this.inAircraftLocation(this.sanitize(addon.targetDirectory));
    return join(baseDir, this.sanitize(targetDir));
  }

  static async inCustomDataLocation(targetDir: string): Promise<string> {
    return join(await Directories.customDataLocation(), this.sanitize(targetDir));
  }

  static async inCustomDataPackage(addon: Addon, targetDir: string): Promise<string> {
    const baseDir = await this.inCustomDataLocation(this.sanitize(addon.targetDirectory));
    return join(baseDir, this.sanitize(targetDir));
  }

  static async inCustomSceneryLocation(targetDir: string): Promise<string> {
    return join(await Directories.customSceneryLocation(), this.sanitize(targetDir));
  }

  static async inCustomSceneryPackage(addon: Addon, targetDir: string): Promise<string> {
    const baseDir = await this.inCustomSceneryLocation(this.sanitize(addon.targetDirectory));
    return join(baseDir, this.sanitize(targetDir));
  }

  static async inResourcesLocation(targetDir: string): Promise<string> {
    return join(await Directories.resourcesLocation(), this.sanitize(targetDir));
  }

  static async inResourcesPackage(addon: Addon, targetDir: string): Promise<string> {
    const baseDir = await this.inResourcesLocation(this.sanitize(addon.targetDirectory));
    return join(baseDir, this.sanitize(targetDir));
  }

  static async inPluginsLocation(targetDir: string): Promise<string> {
    return join(await Directories.pluginsLocation(), this.sanitize(targetDir));
  }

  static async inPluginsPackage(addon: Addon, targetDir: string): Promise<string> {
    const baseDir = await this.inPluginsLocation(this.sanitize(addon.targetDirectory));
    return join(baseDir, this.sanitize(targetDir));
  }

  static async installLocation(): Promise<string> {
    return settings.get('mainSettings.installPath') as Promise<string>;
  }

  static async inInstallLocation(targetDir: string): Promise<string> {
    return join(await Directories.installLocation(), this.sanitize(targetDir));
  }

  static async inInstallPackage(addon: Addon, targetDir: string): Promise<string> {
    const baseDir = await this.inInstallLocation(this.sanitize(addon.targetDirectory));
    return join(baseDir, this.sanitize(targetDir));
  }

  static async tempLocation(): Promise<string> {
    return (await settings.get('mainSettings.separateTempLocation'))
      ? (settings.get('mainSettings.tempLocation') as Promise<string>)
      : (settings.get('mainSettings.installPath') as Promise<string>);
  }

  static async inTempLocation(targetDir: string): Promise<string> {
    return join(await Directories.tempLocation(), this.sanitize(targetDir));
  }

  static async inPackages(targetDir: string): Promise<string> {
    return join(await this.xp12BasePath(), this.sanitize(targetDir));
  }

  static async temp(): Promise<string> {
    const dir = join(await Directories.tempLocation(), `${TEMP_DIRECTORY_PREFIX}-${(Math.random() * 1000).toFixed(0)}`);
    const exists = await ipcFs.existsSync(dir);
    if (exists) {
      return Directories.temp();
    }
    return dir;
  }

  static async removeAllTemp(): Promise<void> {
    console.log('[CLEANUP] Removing all temp directories');

    // Use the IPC-based removeAllTemp method that's implemented in the main process
    const result = await ipcFs.removeAllTemp();
    if (!result.success) {
      console.error('[CLEANUP] Failed to remove temp directories:', result.error);
    } else {
      console.log('[CLEANUP] Successfully removed all temp directories');
    }
  }
  static async removeAlternativesForAddon(addon: Addon): Promise<void> {
    if (addon.alternativeNames) {
      // Get the base installation directory for this addon's category
      const baseInstallDir = await this.getAddonInstallLocation(addon);

      for (const altName of addon.alternativeNames) {
        const altDir = join(baseInstallDir, this.sanitize(altName));

        const exists = await ipcFs.existsSync(altDir);
        if (exists) {
          console.log('Removing alternative', altDir);
          const result = await ipcFs.rmSync(altDir, { recursive: true });
          if (!result.success) {
            console.error('Failed to remove alternative directory:', result.error);
          }
        }
      }
    }
  }

  static async isGitInstall(target: string | Addon): Promise<boolean> {
    // TODO: Implement readlinkSync through IPC if needed for git detection
    // For now, return false as git detection through symlinks requires filesystem access
    const targetDir = typeof target === 'string' ? target : await this.getAddonInstallPath(target);
    console.warn('Git installation detection through symlinks not available in renderer process for:', targetDir);
    return false;

    // Original implementation that would need IPC support:
    // try {
    //   const symlinkPath = fs.readlinkSync(targetDir);
    //   if (symlinkPath && fs.existsSync(join(symlinkPath, '/../../../.git'))) {
    //     console.log('Is git repo', targetDir);
    //     return true;
    //   }
    // } catch {
    //   console.log('Is not git repo', targetDir);
    //   return false;
    // }
    // return false;
  }

  /**
   * Determines the appropriate installation directory for an addon based on its category
   */
  static async getAddonInstallLocation(addon: Addon): Promise<string> {
    const category = addon.category;

    console.log(`[Directories] Determining install location for addon "${addon.name}" with category: ${category}`);

    switch (category) {
      case '@aircraft':
        console.log(`[Directories] Installing aircraft addon to Aircraft directory`);
        return await this.aircraftLocation();

      case '@scenery':
        console.log(`[Directories] Installing scenery addon to Custom Scenery directory`);
        return await this.customSceneryLocation();

      case '@sceneryLibrary':
        console.log(`[Directories] Installing scenery library to Custom Scenery directory`);
        return await this.customSceneryLocation();

      case '@plugin':
      case '@plugins':
        console.log(`[Directories] Installing plugin addon to Plugins directory`);
        return await this.pluginsLocation();

      case '@utility':
        console.log(`[Directories] Installing utility addon to Resources directory`);
        return await this.resourcesLocation();

      default:
        console.log(`[Directories] Unknown category "${category}", defaulting to Aircraft directory`);
        return await this.aircraftLocation();
    }
  }

  /**
   * Gets the full installation path for an addon, including the addon's target directory
   */
  static async getAddonInstallPath(addon: Addon): Promise<string> {
    const baseLocation = await this.getAddonInstallLocation(addon);
    return join(baseLocation, this.sanitize(addon.targetDirectory));
  }

  /**
   * Gets a subdirectory path within an addon's installation location
   */
  static async inAddonInstallLocation(addon: Addon, targetDir: string): Promise<string> {
    const addonPath = await this.getAddonInstallPath(addon);
    return join(addonPath, this.sanitize(targetDir));
  }
}
