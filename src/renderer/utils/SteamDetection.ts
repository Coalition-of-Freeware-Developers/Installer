import ipcFs from 'renderer/utils/IPCFileSystem';
import { XPlaneValidation } from 'renderer/utils/XPlaneValidation';
import { PlatformUtils } from 'common/PlatformUtils';

/**
 * Utility class for detecting Steam installations of X-Plane 12
 */
export class SteamDetection {
  /**
   * Attempts to find Steam installation directories using steam-locate package
   * This will be called from the main process since steam-locate is a Node.js package
   */
  static async findSteamInstallation(): Promise<string | null> {
    try {
      console.log('[SteamDetection] Requesting Steam X-Plane 12 detection from main process');

      // Request Steam detection from main process
      if (globalThis.window?.electronAPI?.invoke) {
        const steamPath = (await globalThis.window.electronAPI.invoke('steam:findXPlane12')) as string | null;

        if (steamPath) {
          console.log(`[SteamDetection] ✓ Steam X-Plane 12 found via steam-locate: ${steamPath}`);
          return steamPath;
        } else {
          console.log('[SteamDetection] Steam X-Plane 12 not found via steam-locate');
          return null;
        }
      } else {
        console.warn('[SteamDetection] electronAPI.invoke not available, using fallback');
        return null;
      }
    } catch (error) {
      console.error('[SteamDetection] Error detecting Steam X-Plane 12:', error);
      return null;
    }
  }

  /**
   * Fallback method to check common Steam paths manually
   */
  static async findSteamXPlane12Fallback(): Promise<string | null> {
    console.log('[SteamDetection] Using fallback Steam detection method');

    // Use platform-specific Steam paths from PlatformUtils
    const commonSteamPaths = PlatformUtils.steamInstallPaths;

    for (const steamPath of commonSteamPaths) {
      try {
        console.log(`[SteamDetection] Checking Steam path: ${steamPath}`);

        const pathExists = await ipcFs.existsSync(steamPath);
        if (pathExists) {
          console.log(`[SteamDetection] Steam path exists: ${steamPath}`);

          const isValid = await XPlaneValidation.isValidXPlaneBasePath(steamPath);
          if (isValid) {
            console.log(`[SteamDetection] ✓ Found valid Steam X-Plane 12 at: ${steamPath}`);
            return steamPath;
          } else {
            console.log(`[SteamDetection] ✗ Invalid Steam X-Plane 12 at: ${steamPath}`);
          }
        }
      } catch (error) {
        console.warn(`[SteamDetection] Error checking Steam path ${steamPath}:`, error);
      }
    }

    console.log('[SteamDetection] No valid Steam X-Plane 12 installation found in common paths');
    return null;
  }

  /**
   * Comprehensive Steam detection that tries both the steam-locate package and fallback methods
   */
  static async detectSteamXPlane12(): Promise<string | null> {
    console.log('[SteamDetection] Starting Steam X-Plane 12 detection');

    // First try using steam-locate package
    const steamPath = await this.findSteamInstallation();
    if (steamPath) {
      return steamPath;
    }

    // If steam-locate fails, try fallback method
    console.log('[SteamDetection] steam-locate failed, trying fallback method');
    return await this.findSteamXPlane12Fallback();
  }
}
