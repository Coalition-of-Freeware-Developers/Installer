import { Addon } from 'renderer/utils/InstallerConfiguration';
import { Directories } from 'renderer/utils/Directories';
import { XPlaneValidation } from 'renderer/utils/XPlaneValidation';

/**
 * Manages addon installation logic based on addon category and type
 */
export class AddonInstallationManager {
  /**
   * Gets the appropriate installation directory for an addon based on its category
   */
  static async getInstallationDirectory(addon: Addon): Promise<string> {
    console.log(
      `[AddonInstallationManager] Getting installation directory for addon: ${addon.name}, category: ${addon.category}`,
    );

    return await Directories.getAddonInstallLocation(addon);
  }

  /**
   * Gets the full installation path for an addon (including target directory)
   */
  static async getInstallationPath(addon: Addon): Promise<string> {
    console.log(`[AddonInstallationManager] Getting full installation path for addon: ${addon.name}`);

    return await Directories.getAddonInstallPath(addon);
  }

  /**
   * Validates that the installation directory exists and is accessible for the addon
   */
  static async validateInstallationDirectory(addon: Addon): Promise<{
    isValid: boolean;
    errorMessage?: string;
  }> {
    console.log(`[AddonInstallationManager] Validating installation directory for addon: ${addon.name}`);

    const installDir = await this.getInstallationDirectory(addon);
    const category = addon.category;

    try {
      let isValid = false;
      let errorMessage = '';

      switch (category) {
        case '@aircraft':
          isValid = await XPlaneValidation.isValidAircraftDirectory(installDir);
          if (!isValid) {
            errorMessage = `Invalid Aircraft directory: ${installDir}. Please ensure the Aircraft folder exists in your X-Plane 12 installation.`;
          }
          break;

        case '@scenery':
          isValid = await XPlaneValidation.isValidCustomSceneryDirectory(installDir);
          if (!isValid) {
            errorMessage = `Invalid Custom Scenery directory: ${installDir}. Please ensure the Custom Scenery folder exists in your X-Plane 12 installation.`;
          }
          break;

        case '@sceneryLibrary':
          isValid = await XPlaneValidation.isValidCustomSceneryDirectory(installDir);
          if (!isValid) {
            errorMessage = `Invalid Custom Scenery directory: ${installDir}. Please ensure the Custom Scenery folder exists in your X-Plane 12 installation.`;
          }
          break;

        case '@plugin':
        case '@plugins':
          isValid = await XPlaneValidation.isValidPluginsDirectory(installDir);
          if (!isValid) {
            errorMessage = `Invalid Plugins directory: ${installDir}. Please ensure the Resources/plugins folder exists in your X-Plane 12 installation.`;
          }
          break;

        case '@utility':
          isValid = await XPlaneValidation.isValidResourcesDirectory(installDir);
          if (!isValid) {
            errorMessage = `Invalid Resources directory: ${installDir}. Please ensure the Resources folder exists in your X-Plane 12 installation.`;
          }
          break;

        default:
          // Default to aircraft directory for unknown categories
          isValid = await XPlaneValidation.isValidAircraftDirectory(installDir);
          if (!isValid) {
            errorMessage = `Invalid installation directory: ${installDir}. Defaulting to Aircraft directory but it doesn't exist.`;
          }
          break;
      }

      console.log(`[AddonInstallationManager] Validation result for ${addon.name}: ${isValid ? 'Valid' : 'Invalid'}`);

      return {
        isValid,
        errorMessage: isValid ? undefined : errorMessage,
      };
    } catch (error) {
      console.error(`[AddonInstallationManager] Error validating installation directory for ${addon.name}:`, error);
      return {
        isValid: false,
        errorMessage: `Error validating installation directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Gets a human-readable description of where an addon will be installed
   */
  static getInstallLocationDescription(addon: Addon): string {
    const category = addon.category;

    switch (category) {
      case '@aircraft':
        return 'X-Plane 12 Aircraft folder';
      case '@scenery':
        return 'X-Plane 12 Custom Scenery folder';
      case '@sceneryLibrary':
        return 'X-Plane 12 Custom Scenery folder';
      case '@plugin':
      case '@plugins':
        return 'X-Plane 12 Resources/plugins folder';
      case '@utility':
        return 'X-Plane 12 Resources folder';
      default:
        return 'X-Plane 12 Aircraft folder (default)';
    }
  }

  /**
   * Checks if all required X-Plane directories are properly configured for addon installation
   */
  static async validateXPlaneDirectoriesSetup(): Promise<{
    isValid: boolean;
    missingDirectories: string[];
    errors: string[];
  }> {
    console.log('[AddonInstallationManager] Validating X-Plane directories setup');

    const validation = await XPlaneValidation.validateAllXPlaneDirectories();
    const missingDirectories: string[] = [];

    if (!validation.xplaneBaseValid) {
      missingDirectories.push('X-Plane 12 Base Directory');
    }
    if (!validation.aircraftValid) {
      missingDirectories.push('Aircraft Directory');
    }
    if (!validation.customSceneryValid) {
      missingDirectories.push('Custom Scenery Directory');
    }
    if (!validation.customDataValid) {
      missingDirectories.push('Custom Data Directory');
    }
    if (!validation.resourcesValid) {
      missingDirectories.push('Resources Directory');
    }
    if (!validation.pluginsValid) {
      missingDirectories.push('Plugins Directory');
    }

    const isValid = missingDirectories.length === 0;

    console.log(
      `[AddonInstallationManager] X-Plane directories validation: ${isValid ? 'Valid' : 'Invalid'}, missing: ${missingDirectories.length}`,
    );

    return {
      isValid,
      missingDirectories,
      errors: validation.errors,
    };
  }

  /**
   * Prepares the installation environment for an addon
   * This should be called before installing an addon to ensure the directories are set up
   */
  static async prepareInstallationEnvironment(addon: Addon): Promise<{
    success: boolean;
    installPath: string;
    errorMessage?: string;
  }> {
    console.log(`[AddonInstallationManager] Preparing installation environment for: ${addon.name}`);

    try {
      // First, validate that the addon's installation directory is set up correctly
      const validation = await this.validateInstallationDirectory(addon);

      if (!validation.isValid) {
        console.error(
          `[AddonInstallationManager] Installation directory validation failed: ${validation.errorMessage}`,
        );
        return {
          success: false,
          installPath: '',
          errorMessage: validation.errorMessage,
        };
      }

      // Get the full installation path
      const installPath = await this.getInstallationPath(addon);

      console.log(
        `[AddonInstallationManager] Installation environment prepared successfully for ${addon.name} at: ${installPath}`,
      );

      return {
        success: true,
        installPath,
      };
    } catch (error) {
      const errorMessage = `Failed to prepare installation environment: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(`[AddonInstallationManager] ${errorMessage}`);

      return {
        success: false,
        installPath: '',
        errorMessage,
      };
    }
  }
}
