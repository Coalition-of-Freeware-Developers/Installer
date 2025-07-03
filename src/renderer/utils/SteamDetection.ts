import ipcFs from 'renderer/utils/IPCFileSystem';
import { XPlaneValidation } from 'renderer/utils/XPlaneValidation';

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

      // Check if electronAPI is available
      if (!globalThis.window?.electronAPI?.invoke) {
        console.warn('[SteamDetection] electronAPI.invoke not available, using fallback');
        return null;
      }

      // Request Steam detection from main process with timeout
      const steamPath = await Promise.race([
        globalThis.window.electronAPI.invoke('steam:findXPlane12') as Promise<string | null>,
        new Promise<null>((resolve) =>
          setTimeout(() => {
            console.warn('[SteamDetection] Steam detection timeout after 10 seconds');
            resolve(null);
          }, 10000),
        ),
      ]);

      if (steamPath) {
        console.log(`[SteamDetection] ✓ Steam X-Plane 12 found via steam-locate: ${steamPath}`);
        return steamPath;
      } else {
        console.log('[SteamDetection] Steam X-Plane 12 not found via steam-locate');
        return null;
      }
    } catch (error) {
      console.error('SteamDetection - Error detecting Steam X-Plane 12:', error);
      return null;
    }
  }

  /**
   * Fallback method to check common Steam paths manually
   */
  static async findSteamXPlane12Fallback(): Promise<string | null> {
    console.log('[SteamDetection] Using fallback Steam detection method');

    const commonSteamPaths = [
      'C:\\Program Files (x86)\\Steam\\steamapps\\common\\X-Plane 12',
      'C:\\Program Files\\Steam\\steamapps\\common\\X-Plane 12',
      'D:\\Steam\\steamapps\\common\\X-Plane 12',
      'E:\\Steam\\steamapps\\common\\X-Plane 12',
      'F:\\Steam\\steamapps\\common\\X-Plane 12',
      // Add more common drive letters for Steam libraries
      'G:\\Steam\\steamapps\\common\\X-Plane 12',
      'H:\\Steam\\steamapps\\common\\X-Plane 12',
    ];

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
