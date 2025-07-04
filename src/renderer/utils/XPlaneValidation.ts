import { join, normalize } from 'renderer/stubs/path';
import ipcFs from 'renderer/utils/IPCFileSystem';
import settings from 'renderer/rendererSettings';

// Platform detection for renderer process
const getPlatform = (): 'win32' | 'darwin' | 'linux' | 'unknown' => {
  // Try to get platform from electron API
  if (typeof globalThis !== 'undefined' && (globalThis as any).electronAPI?.platform) {
    return (globalThis as any).electronAPI.platform;
  }
  
  // Try to detect from user agent or other browser APIs
  if (typeof navigator !== 'undefined' && navigator.platform) {
    const platform = navigator.platform.toLowerCase();
    if (platform.includes('win')) return 'win32';
    if (platform.includes('mac')) return 'darwin';
    if (platform.includes('linux')) return 'linux';
  }
  
  // Fallback to process if available
  if (typeof process !== 'undefined' && process.platform) {
    return process.platform as 'win32' | 'darwin' | 'linux';
  }
  
  return 'unknown';
};

const currentPlatform = getPlatform();

/**
 * Get X-Plane executable name for the current platform
 */
const getXPlaneExecutableName = (): string => {
  switch (currentPlatform) {
    case 'win32':
      return 'X-Plane.exe';
    case 'darwin':
      return 'X-Plane.app';
    case 'linux':
      return 'X-Plane';
    default:
      return 'X-Plane.exe'; // Default to Windows
  }
};

/**
 * Get alternative X-Plane executable names for the current platform
 */
const getXPlaneAlternativeNames = (): string[] => {
  switch (currentPlatform) {
    case 'win32':
      return ['X-Plane 12.exe', 'X-Plane12.exe', 'xplane.exe', 'x-plane.exe'];
    case 'darwin':
      return ['X-Plane 12.app', 'X-Plane12.app'];
    case 'linux':
      return ['X-Plane-12', 'X-Plane12', 'xplane', 'x-plane'];
    default:
      return ['X-Plane 12.exe', 'X-Plane12.exe', 'xplane.exe', 'x-plane.exe'];
  }
};

/**
 * Check if a path represents an invalid or root directory
 */
const isInvalidPath = (path: string): boolean => {
  if (!path || path.trim() === '' || path === 'notInstalled') {
    return true;
  }
  
  const trimmedPath = path.trim();
  
  // Check for root directories on different platforms
  const rootPaths = [
    'C:\\',           // Windows root
    '/',              // Unix/Linux root
    '/System',        // macOS system directory
    '/Applications',  // macOS apps directory (too broad)
    '/Users',         // macOS users directory (too broad)
    '/home',          // Linux home directory (too broad)
  ];
  
  return rootPaths.includes(trimmedPath) || trimmedPath.endsWith('\\') || trimmedPath.endsWith('/');
};

export class XPlaneValidation {
  /**
   * Validates that a given path is a valid X-Plane 12 installation
   * by checking for the presence of the X-Plane executable
   */
  static async isValidXPlaneBasePath(path: string): Promise<boolean> {
    if (isInvalidPath(path)) {
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

      // Check for the primary X-Plane executable
      const primaryExecutable = getXPlaneExecutableName();
      const xplaneExePath = join(normalizedPath, primaryExecutable);
      console.log(`[XPlaneValidation] Checking for ${primaryExecutable} at: "${xplaneExePath}"`);

      const xplaneExeExists = await ipcFs.existsSync(xplaneExePath);
      console.log(`[XPlaneValidation] ${primaryExecutable} exists: ${xplaneExeExists}`);

      if (xplaneExeExists) {
        console.log(`[XPlaneValidation] ✓ Valid X-Plane 12 installation found at: ${normalizedPath}`);
        return true;
      }

      // Check alternative executable names
      const alternativeNames = getXPlaneAlternativeNames();
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
    if (isInvalidPath(path)) {
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
   * Validates that a given path is a valid custom scenery directory
   */
  static async isValidCustomSceneryDirectory(path: string): Promise<boolean> {
    if (isInvalidPath(path)) {
      console.log(`[XPlaneValidation] Invalid or empty custom scenery path provided: "${path}"`);
      return false;
    }

    try {
      const normalizedPath = normalize(path.trim());
      console.log(`[XPlaneValidation] Checking custom scenery directory: "${normalizedPath}"`);

      const dirExists = await ipcFs.existsSync(normalizedPath);
      console.log(`[XPlaneValidation] Custom scenery directory exists: ${dirExists}`);

      if (dirExists) {
        console.log(`[XPlaneValidation] ✓ Valid custom scenery directory found at: ${normalizedPath}`);
        return true;
      } else {
        console.log(`[XPlaneValidation] ✗ Custom scenery directory does not exist: ${normalizedPath}`);
        return false;
      }
    } catch (error) {
      console.error('[XPlaneValidation] Error validating custom scenery directory:', error);
      return false;
    }
  }

  /**
   * Validates that a given path is a valid plugins directory
   */
  static async isValidPluginsDirectory(path: string): Promise<boolean> {
    if (isInvalidPath(path)) {
      console.log(`[XPlaneValidation] Invalid or empty plugins path provided: "${path}"`);
      return false;
    }

    try {
      const normalizedPath = normalize(path.trim());
      console.log(`[XPlaneValidation] Checking plugins directory: "${normalizedPath}"`);

      const dirExists = await ipcFs.existsSync(normalizedPath);
      console.log(`[XPlaneValidation] Plugins directory exists: ${dirExists}`);

      if (dirExists) {
        console.log(`[XPlaneValidation] ✓ Valid plugins directory found at: ${normalizedPath}`);
        return true;
      } else {
        console.log(`[XPlaneValidation] ✗ Plugins directory does not exist: ${normalizedPath}`);
        return false;
      }
    } catch (error) {
      console.error('[XPlaneValidation] Error validating plugins directory:', error);
      return false;
    }
  }

  /**
   * Validates that a given path is a valid custom data directory
   */
  static async isValidCustomDataDirectory(path: string): Promise<boolean> {
    if (isInvalidPath(path)) {
      console.log(`[XPlaneValidation] Invalid or empty custom data path provided: "${path}"`);
      return false;
    }

    try {
      const normalizedPath = normalize(path.trim());
      console.log(`[XPlaneValidation] Checking custom data directory: "${normalizedPath}"`);

      const dirExists = await ipcFs.existsSync(normalizedPath);
      console.log(`[XPlaneValidation] Custom data directory exists: ${dirExists}`);

      if (dirExists) {
        console.log(`[XPlaneValidation] ✓ Valid custom data directory found at: ${normalizedPath}`);
        return true;
      } else {
        console.log(`[XPlaneValidation] ✗ Custom data directory does not exist: ${normalizedPath}`);
        return false;
      }
    } catch (error) {
      console.error('[XPlaneValidation] Error validating custom data directory:', error);
      return false;
    }
  }

  /**
   * Validates that a given path is a valid resources directory
   */
  static async isValidResourcesDirectory(path: string): Promise<boolean> {
    if (!path || path.trim() === '' || path === 'C:\\') {
      console.log(`[XPlaneValidation] Invalid or empty resources path provided: "${path}"`);
      return false;
    }

    try {
      const normalizedPath = normalize(path.trim());
      console.log(`[XPlaneValidation] Checking resources directory: "${normalizedPath}"`);

      const dirExists = await ipcFs.existsSync(normalizedPath);
      console.log(`[XPlaneValidation] Resources directory exists: ${dirExists}`);

      if (dirExists) {
        console.log(`[XPlaneValidation] ✓ Valid resources directory found at: ${normalizedPath}`);
        return true;
      } else {
        console.log(`[XPlaneValidation] ✗ Resources directory does not exist: ${normalizedPath}`);
        return false;
      }
    } catch (error) {
      console.error('[XPlaneValidation] Error validating resources directory:', error);
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

  /**
   * Comprehensive validation for all X-Plane directories
   */
  static async validateAllXPlaneDirectories(): Promise<{
    xplaneBaseValid: boolean;
    aircraftValid: boolean;
    customSceneryValid: boolean;
    customDataValid: boolean;
    resourcesValid: boolean;
    pluginsValid: boolean;
    errors: string[];
  }> {
    console.log('[XPlaneValidation] Validating all X-Plane directories');

    const errors: string[] = [];

    // Get all directory paths from settings
    const xplaneBasePath = (await settings.get('mainSettings.xp12BasePath')) as string;
    const aircraftPath = (await settings.get('mainSettings.xp12AircraftPath')) as string;
    const customSceneryPath = (await settings.get('mainSettings.xp12CustomSceneryPath')) as string;
    const customDataPath = (await settings.get('mainSettings.xp12CustomDataPath')) as string;
    const resourcesPath = (await settings.get('mainSettings.xp12ResourcesPath')) as string;
    const pluginsPath = (await settings.get('mainSettings.xp12PluginsPath')) as string;

    // Validate each directory
    const xplaneBaseValid = await this.isValidXPlaneBasePath(xplaneBasePath);
    if (!xplaneBaseValid) {
      errors.push(`Invalid X-Plane base directory: ${xplaneBasePath}`);
    }

    const aircraftValid = await this.isValidAircraftDirectory(aircraftPath);
    if (!aircraftValid) {
      errors.push(`Invalid Aircraft directory: ${aircraftPath}`);
    }

    const customSceneryValid = await this.isValidCustomSceneryDirectory(customSceneryPath);
    if (!customSceneryValid) {
      errors.push(`Invalid Custom Scenery directory: ${customSceneryPath}`);
    }

    const customDataValid = await this.isValidCustomDataDirectory(customDataPath);
    if (!customDataValid) {
      errors.push(`Invalid Custom Data directory: ${customDataPath}`);
    }

    const resourcesValid = await this.isValidResourcesDirectory(resourcesPath);
    if (!resourcesValid) {
      errors.push(`Invalid Resources directory: ${resourcesPath}`);
    }

    const pluginsValid = await this.isValidPluginsDirectory(pluginsPath);
    if (!pluginsValid) {
      errors.push(`Invalid Plugins directory: ${pluginsPath}`);
    }

    console.log('[XPlaneValidation] Directory validation complete:', {
      xplaneBaseValid,
      aircraftValid,
      customSceneryValid,
      customDataValid,
      resourcesValid,
      pluginsValid,
      errorCount: errors.length,
    });

    return {
      xplaneBaseValid,
      aircraftValid,
      customSceneryValid,
      customDataValid,
      resourcesValid,
      pluginsValid,
      errors,
    };
  }
}
