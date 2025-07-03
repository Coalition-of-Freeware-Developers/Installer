import { ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Steam detection utilities using steam-locate package
 */
export class SteamDetectionMain {
  /**
   * Find X-Plane 12 installation through Steam using steam-locate
   */
  static async findXPlane12(): Promise<string | null> {
    console.log('[SteamDetectionMain] Starting Steam X-Plane 12 detection');

    try {
      // Import steam-locate dynamically since it's a Node.js package
      const steamLocate = await import('steam-locate');
      console.log('[SteamDetectionMain] steam-locate imported successfully');

      // Check if findSteamLocation function exists
      if (!steamLocate.findSteamLocation) {
        console.error('[SteamDetectionMain] findSteamLocation function not found in steam-locate package');
        return null;
      }

      // Find Steam installation
      const steamInfo = await steamLocate.findSteamLocation();

      if (!steamInfo) {
        console.log('[SteamDetectionMain] Steam installation not found');
        return null;
      }

      console.log('[SteamDetectionMain] Steam installation found:', steamInfo.path);
      console.log('[SteamDetectionMain] Steam library folders:', steamInfo.libraryFolders);

      // Check Steam library folders for X-Plane 12
      const libraryFolders = steamInfo.libraryFolders || [];

      for (const folder of libraryFolders) {
        const xplanePath = path.join(folder, 'steamapps', 'common', 'X-Plane 12');
        console.log(`[SteamDetectionMain] Checking Steam library path: ${xplanePath}`);

        try {
          // Check if the directory exists
          const stats = await fs.promises.stat(xplanePath);
          if (stats.isDirectory()) {
            // Check for X-Plane.exe to confirm it's a valid installation
            const xplaneExe = path.join(xplanePath, 'X-Plane.exe');
            const xplaneExeStats = await fs.promises.stat(xplaneExe);

            if (xplaneExeStats.isFile()) {
              console.log(`[SteamDetectionMain] ✓ Found valid Steam X-Plane 12 at: ${xplanePath}`);
              return xplanePath;
            } else {
              console.log(`[SteamDetectionMain] ✗ X-Plane.exe not found at: ${xplanePath}`);
            }
          }
        } catch (error) {
          console.log(`[SteamDetectionMain] Path doesn't exist or is not accessible: ${xplanePath}`, error);
        }
      }

      // Also check the main Steam installation path
      const mainSteamXPlanePath = path.join(steamInfo.path, 'steamapps', 'common', 'X-Plane 12');
      console.log(`[SteamDetectionMain] Checking main Steam path: ${mainSteamXPlanePath}`);

      try {
        const stats = await fs.promises.stat(mainSteamXPlanePath);
        if (stats.isDirectory()) {
          const xplaneExe = path.join(mainSteamXPlanePath, 'X-Plane.exe');
          const xplaneExeStats = await fs.promises.stat(xplaneExe);

          if (xplaneExeStats.isFile()) {
            console.log(`[SteamDetectionMain] ✓ Found valid Steam X-Plane 12 at main path: ${mainSteamXPlanePath}`);
            return mainSteamXPlanePath;
          }
        }
      } catch (error) {
        console.log(
          `[SteamDetectionMain] Main Steam path doesn't exist or is not accessible: ${mainSteamXPlanePath}`,
          error,
        );
      }

      console.log('[SteamDetectionMain] X-Plane 12 not found in any Steam library folders');
      return null;
    } catch (error) {
      console.error('[SteamDetectionMain] Error using steam-locate:', error);
      return null;
    }
  }

  /**
   * Setup IPC listeners for Steam detection
   */
  static setupIpcListeners(): void {
    console.log('[SteamDetectionMain] Setting up IPC listeners for Steam detection');

    ipcMain.handle('steam:findXPlane12', async () => {
      return await this.findXPlane12();
    });
  }
}
