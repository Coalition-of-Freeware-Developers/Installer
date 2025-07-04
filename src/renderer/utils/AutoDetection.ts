import { SteamDetection } from 'renderer/utils/SteamDetection';
import { XPlaneValidation } from 'renderer/utils/XPlaneValidation';
import settings, { defaultAircraftDir } from 'renderer/rendererSettings';
import { PlatformUtils } from 'common/PlatformUtils';

/**
 * Utility class for automatically detecting X-Plane installations on startup
 */
export class AutoDetection {
  /**
   * Automatically detects X-Plane 12 installation on application startup
   * This is called when the app starts to minimize user interaction
   */
  static async detectXPlaneOnStartup(): Promise<{
    detected: boolean;
    path?: string;
    method?: 'steam' | 'standard' | 'existing';
  }> {
    console.log('[AutoDetection] Starting automatic X-Plane 12 detection on startup');

    try {
      // Check if X-Plane path is already set and valid
      const existingPath = (await settings.get('mainSettings.xp12BasePath')) as string;

      if (existingPath && existingPath !== 'notInstalled' && existingPath !== 'C:\\X-Plane 12') {
        console.log(`[AutoDetection] Checking existing X-Plane path: ${existingPath}`);

        const isValid = await XPlaneValidation.isValidXPlaneBasePath(existingPath);
        if (isValid) {
          console.log(`[AutoDetection] ✓ Existing X-Plane path is valid: ${existingPath}`);
          return { detected: true, path: existingPath, method: 'existing' };
        } else {
          console.log(`[AutoDetection] ✗ Existing X-Plane path is invalid: ${existingPath}`);
        }
      }

      // Try Steam detection first (most specific)
      console.log('[AutoDetection] Attempting Steam detection');
      try {
        const steamPath = await SteamDetection.detectSteamXPlane12();
        if (steamPath) {
          console.log(`[AutoDetection] ✓ Steam X-Plane 12 detected: ${steamPath}`);
          await this.setupDetectedPath(steamPath);
          return { detected: true, path: steamPath, method: 'steam' };
        }
      } catch (error) {
        console.warn('[AutoDetection] Steam detection failed:', error);
      }

      // Try standard installation paths
      console.log('[AutoDetection] Attempting standard installation detection');
      const standardPaths = PlatformUtils.defaultXPlaneInstallPaths;

      for (const path of standardPaths) {
        console.log(`[AutoDetection] Checking standard path: ${path}`);
        try {
          const isValid = await XPlaneValidation.isValidXPlaneBasePath(path);
          if (isValid) {
            console.log(`[AutoDetection] ✓ Standard X-Plane 12 detected: ${path}`);
            await this.setupDetectedPath(path);
            return { detected: true, path, method: 'standard' };
          }
        } catch (error) {
          console.warn(`[AutoDetection] Error checking standard path ${path}:`, error);
        }
      }

      console.log('[AutoDetection] No X-Plane 12 installation automatically detected');
      return { detected: false };
    } catch (error) {
      console.error('[AutoDetection] Error during automatic detection:', error);
      return { detected: false };
    }
  }

  /**
   * Sets up the detected X-Plane path and all related directories
   */
  private static async setupDetectedPath(xplanePath: string): Promise<void> {
    console.log(`[AutoDetection] Setting up detected X-Plane path: ${xplanePath}`);

    // Set the base path
    await settings.set('mainSettings.xp12BasePath', xplanePath);

    // Set up default directories
    const aircraftDir = defaultAircraftDir(xplanePath);
    const customDataDir = `${xplanePath}\\Custom Data`;
    const customSceneryDir = `${xplanePath}\\Custom Scenery`;
    const resourcesDir = `${xplanePath}\\Resources`;
    const pluginsDir = `${xplanePath}\\Resources\\plugins`;

    await Promise.all([
      settings.set('mainSettings.xp12AircraftPath', aircraftDir),
      settings.set('mainSettings.installPath', aircraftDir),
      settings.set('mainSettings.separateTempLocation', false),
      settings.set('mainSettings.tempLocation', aircraftDir),
      settings.set('mainSettings.xp12CustomDataPath', customDataDir),
      settings.set('mainSettings.xp12CustomSceneryPath', customSceneryDir),
      settings.set('mainSettings.xp12ResourcesPath', resourcesDir),
      settings.set('mainSettings.xp12PluginsPath', pluginsDir),
    ]);

    console.log(`[AutoDetection] Successfully configured X-Plane directories:
      Base: ${xplanePath}
      Aircraft: ${aircraftDir}
      Custom Data: ${customDataDir}
      Custom Scenery: ${customSceneryDir}
      Resources: ${resourcesDir}
      Plugins: ${pluginsDir}`);
  }

  /**
   * Checks if X-Plane detection should be skipped (e.g., user explicitly set "notInstalled")
   */
  static async shouldSkipDetection(): Promise<boolean> {
    const existingPath = (await settings.get('mainSettings.xp12BasePath')) as string;

    // Skip detection if user explicitly set "notInstalled"
    if (existingPath === 'notInstalled') {
      console.log('[AutoDetection] Skipping detection - user set X-Plane as not installed');
      return true;
    }

    // Skip detection if we have a valid existing path
    if (existingPath && existingPath !== 'C:\\X-Plane 12') {
      const isValid = await XPlaneValidation.isValidXPlaneBasePath(existingPath);
      if (isValid) {
        console.log(`[AutoDetection] Skipping detection - valid existing path: ${existingPath}`);
        return true;
      }
    }

    return false;
  }
}
