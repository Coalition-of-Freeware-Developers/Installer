import { join, normalize } from 'renderer/stubs/path';
import ipcFs from 'renderer/utils/IPCFileSystem';

export class XPlaneValidation {
  /**
   * Validates that a given path is a valid X-Plane 12 installation
   * by checking for the presence of X-Plane.exe
   */
  static async isValidXPlaneBasePath(path: string): Promise<boolean> {
    if (!path || path.trim() === '' || path === 'C:\\') {
      console.log(`[XPlaneValidation] Invalid or empty path provided: "${path}"`);
      return false;
    }

    try {
      // Normalize the path to handle different path formats
      const normalizedPath = normalize(path.trim());
      console.log(`[XPlaneValidation] Checking X-Plane base path: "${normalizedPath}"`);

      // Check if the directory exists
      const dirExists = await ipcFs.existsSync(normalizedPath);
      console.log(`[XPlaneValidation] Directory exists: ${dirExists}`);

      if (!dirExists) {
        console.log(`[XPlaneValidation] Directory does not exist: ${normalizedPath}`);
        return false;
      }

      // Check for X-Plane.exe in the base directory
      const xplaneExePath = join(normalizedPath, 'X-Plane.exe');
      console.log(`[XPlaneValidation] Checking for X-Plane.exe at: "${xplaneExePath}"`);

      const xplaneExeExists = await ipcFs.existsSync(xplaneExePath);
      console.log(`[XPlaneValidation] X-Plane.exe exists: ${xplaneExeExists}`);

      if (xplaneExeExists) {
        console.log(`[XPlaneValidation] ✓ Valid X-Plane 12 installation found at: ${normalizedPath}`);
        return true;
      }

      // Also check for X-Plane (no .exe extension) for potential Linux/Mac compatibility
      const xplaneAltPath = join(normalizedPath, 'X-Plane');
      console.log(`[XPlaneValidation] Checking for X-Plane (no .exe) at: "${xplaneAltPath}"`);

      const xplaneAltExists = await ipcFs.existsSync(xplaneAltPath);
      console.log(`[XPlaneValidation] X-Plane (no .exe) exists: ${xplaneAltExists}`);

      if (xplaneAltExists) {
        console.log(
          `[XPlaneValidation] ✓ Valid X-Plane 12 installation found at: ${normalizedPath} (Linux/Mac variant)`,
        );
        return true;
      }

      // Check common alternative names for X-Plane executable
      const alternativeNames = ['X-Plane 12.exe', 'X-Plane12.exe', 'xplane.exe'];
      for (const altName of alternativeNames) {
        const altPath = join(normalizedPath, altName);
        console.log(`[XPlaneValidation] Checking alternative name: "${altPath}"`);

        const altExists = await ipcFs.existsSync(altPath);
        if (altExists) {
          console.log(`[XPlaneValidation] ✓ Valid X-Plane 12 installation found with alternative name: ${altPath}`);
          return true;
        }
      }

      console.log(`[XPlaneValidation] ✗ X-Plane executable not found in: ${normalizedPath}`);

      // List directory contents for debugging
      try {
        const dirContents = await ipcFs.readdirSync(normalizedPath);
        console.log(`[XPlaneValidation] Directory contents:`, dirContents);
      } catch (listError) {
        console.error(`[XPlaneValidation] Could not list directory contents:`, listError);
      }

      return false;
    } catch (error) {
      console.error('[XPlaneValidation] Error validating X-Plane base path:', error);
      return false;
    }
  }

  /**
   * Validates that a given path is a valid aircraft directory
   * by simply checking if the directory exists
   */
  static async isValidAircraftDirectory(path: string): Promise<boolean> {
    if (!path || path.trim() === '' || path === 'C:\\') {
      console.log(`[XPlaneValidation] Invalid or empty aircraft path provided: "${path}"`);
      return false;
    }

    try {
      // Normalize the path to handle different path formats
      const normalizedPath = normalize(path.trim());
      console.log(`[XPlaneValidation] Checking aircraft directory: "${normalizedPath}"`);

      // Simply check if the directory exists
      const dirExists = await ipcFs.existsSync(normalizedPath);
      console.log(`[XPlaneValidation] Aircraft directory exists: ${dirExists}`);

      if (dirExists) {
        console.log(`[XPlaneValidation] ✓ Valid aircraft directory found at: ${normalizedPath}`);
        return true;
      } else {
        console.log(`[XPlaneValidation] ✗ Aircraft directory does not exist: ${normalizedPath}`);
        return false;
      }
    } catch (error) {
      console.error('[XPlaneValidation] Error validating aircraft directory:', error);
      return false;
    }
  }

  /**
   * Validates X-Plane base path and returns default aircraft directory if valid
   */
  static async validateAndGetAircraftPath(xplaneBasePath: string): Promise<string | null> {
    console.log(`[XPlaneValidation] Validating X-Plane base path for aircraft directory: "${xplaneBasePath}"`);

    const isValid = await this.isValidXPlaneBasePath(xplaneBasePath);
    if (!isValid) {
      console.log(`[XPlaneValidation] X-Plane base path is invalid, cannot determine aircraft directory`);
      return null;
    }

    // Return the Aircraft subdirectory
    const aircraftPath = join(normalize(xplaneBasePath.trim()), 'Aircraft');
    console.log(`[XPlaneValidation] Generated aircraft path: "${aircraftPath}"`);
    return aircraftPath;
  }

  /**
   * Comprehensive validation that checks both X-Plane base path and aircraft directory
   */
  static async validateInstallation(
    xplaneBasePath: string,
    aircraftPath: string,
  ): Promise<{
    xplaneValid: boolean;
    aircraftValid: boolean;
    errors: string[];
  }> {
    console.log(
      `[XPlaneValidation] Comprehensive validation - X-Plane: "${xplaneBasePath}", Aircraft: "${aircraftPath}"`,
    );

    const errors: string[] = [];

    // Validate X-Plane base path
    const xplaneValid = await this.isValidXPlaneBasePath(xplaneBasePath);
    if (!xplaneValid) {
      const errorMsg = `Invalid X-Plane 12 installation path: ${xplaneBasePath}. X-Plane.exe not found.`;
      errors.push(errorMsg);
      console.error(`[XPlaneValidation] ${errorMsg}`);
    }

    // Validate aircraft directory
    const aircraftValid = await this.isValidAircraftDirectory(aircraftPath);
    if (!aircraftValid) {
      const errorMsg = `Invalid aircraft directory: ${aircraftPath}. Directory does not exist or is not accessible.`;
      errors.push(errorMsg);
      console.error(`[XPlaneValidation] ${errorMsg}`);
    }

    console.log(
      `[XPlaneValidation] Validation complete - X-Plane valid: ${xplaneValid}, Aircraft valid: ${aircraftValid}`,
    );

    return {
      xplaneValid,
      aircraftValid,
      errors,
    };
  }
}
