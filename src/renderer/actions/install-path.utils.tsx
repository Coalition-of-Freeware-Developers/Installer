import settings, {
  xplaneBasePath,
  xplaneSteamBasePath,
  defaultAircraftDir,
  defaultCustomDataDir,
  defaultCustomSceneryDir,
  defaultResourcesDir,
  defaultPluginsDir,
} from 'renderer/rendererSettings';
import { Directories } from 'renderer/utils/Directories';
import { XPlaneValidation } from 'renderer/utils/XPlaneValidation';
import { SteamDetection } from 'renderer/utils/SteamDetection';

const selectPath = async (currentPath: string, dialogTitle: string, setting: string): Promise<string> => {
  console.log(`[InstallPathUtils] Selecting path for setting: ${setting}`);

  try {
    // Check if electronAPI is available
    if (!globalThis.window?.electronAPI?.remote?.showOpenDialog) {
      console.error('[InstallPathUtils] electronAPI.remote.showOpenDialog not available');
      await globalThis.window.electronAPI?.remote?.showMessageBox?.({
        title: 'Error',
        message: 'Directory selection is not available. Please restart the application.',
        type: 'error',
        buttons: ['OK'],
      });
      return '';
    }

    console.log(`[InstallPathUtils] Opening directory dialog with title: "${dialogTitle}"`);
    const path = await globalThis.window.electronAPI.remote.showOpenDialog({
      title: dialogTitle,
      defaultPath: typeof currentPath === 'string' ? currentPath : '',
      properties: ['openDirectory'],
    });

    if (!path) {
      console.log('[InstallPathUtils] showOpenDialog returned null/undefined');
      return '';
    }

    if (!path.filePaths || path.filePaths.length === 0) {
      console.log('[InstallPathUtils] User cancelled directory selection or no paths returned');
      return '';
    }

    const selectedPath = path.filePaths[0];
    console.log(`[InstallPathUtils] User selected path: "${selectedPath}"`);

    // Validation logic continues...
    // If this is for X-Plane base path, validate it
    if (setting === 'mainSettings.xp12BasePath') {
      console.log(`[InstallPathUtils] Validating X-Plane base path...`);

      const isValid = await XPlaneValidation.isValidXPlaneBasePath(selectedPath);
      if (!isValid) {
        console.error(`[InstallPathUtils] X-Plane validation failed for path: "${selectedPath}"`);

        await globalThis.window.electronAPI.remote.showMessageBox({
          title: 'Invalid X-Plane Installation',
          message:
            'The selected directory does not contain X-Plane.exe. Please select a valid X-Plane 12 installation directory.\n\n' +
            'Make sure you select the root X-Plane 12 folder that contains the X-Plane.exe file.',
          type: 'error',
          buttons: ['OK'],
        });
        return ''; // Return empty string to indicate failure
      }
      console.log(`[InstallPathUtils] X-Plane validation successful!`);
    }

    // If this is for aircraft path, validate it
    if (setting === 'mainSettings.xp12AircraftPath' || setting === 'mainSettings.installPath') {
      console.log(`[InstallPathUtils] Validating aircraft directory...`);

      const isValid = await XPlaneValidation.isValidAircraftDirectory(selectedPath);
      if (!isValid) {
        console.error(`[InstallPathUtils] Aircraft directory validation failed for path: "${selectedPath}"`);

        await globalThis.window.electronAPI.remote.showMessageBox({
          title: 'Invalid Aircraft Directory',
          message:
            'The selected directory is not accessible or does not exist. Please select a valid Aircraft directory.\n\n' +
            'This should typically be the "Aircraft" folder inside your X-Plane 12 installation.',
          type: 'error',
          buttons: ['OK'],
        });
        return ''; // Return empty string to indicate failure
      }
      console.log(`[InstallPathUtils] Aircraft directory validation successful!`);
    }

    // If this is for any other X-Plane directory, validate it exists
    if (
      setting.startsWith('mainSettings.xp12') &&
      setting !== 'mainSettings.xp12BasePath' &&
      setting !== 'mainSettings.xp12AircraftPath'
    ) {
      console.log(`[InstallPathUtils] Validating X-Plane directory...`);

      const isValid = await XPlaneValidation.isValidAircraftDirectory(selectedPath); // Using this for generic directory validation
      if (!isValid) {
        console.error(`[InstallPathUtils] X-Plane directory validation failed for path: "${selectedPath}"`);

        await globalThis.window.electronAPI.remote.showMessageBox({
          title: 'Invalid Directory',
          message:
            'The selected directory is not accessible or does not exist. Please select a valid directory.\n\n' +
            'Make sure the selected directory exists and is accessible.',
          type: 'error',
          buttons: ['OK'],
        });
        return ''; // Return empty string to indicate failure
      }
      console.log(`[InstallPathUtils] X-Plane directory validation successful!`);
    }

    console.log(`[InstallPathUtils] Setting "${setting}" to: "${selectedPath}"`);
    settings.set(setting, selectedPath);
    return selectedPath;
  } catch (error) {
    console.error('[InstallPathUtils] Error in directory selection:', error);
    await globalThis.window.electronAPI?.remote?.showMessageBox?.({
      title: 'Error',
      message: `Failed to open directory selection dialog: ${error instanceof Error ? error.message : 'Unknown error'}`,
      type: 'error',
      buttons: ['OK'],
    });
    return '';
  }
};

export const setupXPlaneBasePath = async (): Promise<string> => {
  const currentPath = await Directories.xplaneBasePath();

  console.log('[InstallPathUtils] Starting X-Plane 12 base path setup with Steam detection');

  const availablePaths: string[] = [];
  const detectedPaths: { [key: string]: string } = {};

  // First, try Steam detection using steam-locate
  console.log('[InstallPathUtils] Attempting Steam detection');
  try {
    const steamPath = await SteamDetection.detectSteamXPlane12();
    if (steamPath) {
      console.log(`[InstallPathUtils] Steam detection found: ${steamPath}`);
      availablePaths.push('Steam Edition (Auto-detected)');
      detectedPaths['Steam Edition (Auto-detected)'] = steamPath;
    }
  } catch (error) {
    console.warn('[InstallPathUtils] Steam detection failed:', error);
  }

  // Check common standard installation path
  console.log('[InstallPathUtils] Checking standard installation path');
  const basePathValid = await XPlaneValidation.isValidXPlaneBasePath(xplaneBasePath);
  if (basePathValid) {
    availablePaths.push('Standard X-Plane 12 Installation');
    detectedPaths['Standard X-Plane 12 Installation'] = xplaneBasePath;
  }

  // Check common Steam path (fallback if steam-locate didn't find it)
  console.log('[InstallPathUtils] Checking fallback Steam path');
  const steamPathValid = await XPlaneValidation.isValidXPlaneBasePath(xplaneSteamBasePath);
  if (steamPathValid && !detectedPaths['Steam Edition (Auto-detected)']) {
    availablePaths.push('Steam Edition');
    detectedPaths['Steam Edition'] = xplaneSteamBasePath;
  }

  if (availablePaths.length > 0) {
    availablePaths.push('Custom Directory');

    console.log(
      `[InstallPathUtils] Found ${availablePaths.length - 1} X-Plane 12 installations: ${availablePaths.slice(0, -1).join(', ')}`,
    );

    const { response } = await globalThis.window.electronAPI.remote.showMessageBox({
      title: 'Coalition Installer',
      message: 'We found X-Plane 12 installations on your system. Please select which one to use:',
      type: 'info',
      buttons: availablePaths,
    });

    const selection = availablePaths[response];
    console.log(`[InstallPathUtils] User selected: ${selection}`);

    if (selection === 'Custom Directory') {
      // User chose custom directory, continue to manual selection
    } else {
      // User selected a detected installation
      const selectedPath = detectedPaths[selection];
      if (selectedPath) {
        settings.set('mainSettings.xp12BasePath', selectedPath);
        await setupDefaultXPlaneDirectories(selectedPath);
        console.log(`[InstallPathUtils] Set X-Plane base path to: ${selectedPath}`);
        return selectedPath;
      }
    }
  } else {
    console.log('[InstallPathUtils] No X-Plane 12 installations detected, prompting for manual selection');
  }

  // Loop until user provides valid path or cancels
  while (true) {
    const selectedPath = await selectPath(
      currentPath,
      'Select your X-Plane 12 base directory',
      'mainSettings.xp12BasePath',
    );

    // If user cancelled (empty string), return empty
    if (!selectedPath) {
      return '';
    }

    // If we got a valid path (selectPath handles validation), set up default directories and return it
    await setupDefaultXPlaneDirectories(selectedPath);
    return selectedPath;
  }
};

export const setupXPlaneAircraftPath = async (): Promise<string> => {
  const currentPath = await Directories.installLocation();

  return await selectPath(currentPath, 'Select your X-Plane 12 Aircraft directory', 'mainSettings.xp12AircraftPath');
};

export const setupInstallPath = async (): Promise<string> => {
  const currentPath = await Directories.installLocation();

  return await selectPath(currentPath, 'Select your install directory', 'mainSettings.installPath');
};

export const setupTempLocation = async (): Promise<string> => {
  const currentPath = await Directories.tempLocation();

  return await selectPath(currentPath, 'Select a location for temporary folders', 'mainSettings.tempLocation');
};

export const setupXPlaneCustomSceneryPath = async (): Promise<string> => {
  const currentPath = await Directories.customSceneryLocation();

  return await selectPath(
    currentPath,
    'Select your X-Plane 12 Custom Scenery directory',
    'mainSettings.xp12CustomSceneryPath',
  );
};

export const setupXPlaneCustomDataPath = async (): Promise<string> => {
  const currentPath = await Directories.customDataLocation();

  return await selectPath(
    currentPath,
    'Select your X-Plane 12 Custom Data directory',
    'mainSettings.xp12CustomDataPath',
  );
};

export const setupXPlaneResourcesPath = async (): Promise<string> => {
  const currentPath = await Directories.resourcesLocation();

  return await selectPath(currentPath, 'Select your X-Plane 12 Resources directory', 'mainSettings.xp12ResourcesPath');
};

export const setupXPlanePluginsPath = async (): Promise<string> => {
  const currentPath = await Directories.pluginsLocation();

  return await selectPath(currentPath, 'Select your X-Plane 12 Plugins directory', 'mainSettings.xp12PluginsPath');
};

export const setupDefaultXPlaneDirectories = async (xplaneBasePath: string): Promise<void> => {
  console.log(`[InstallPathUtils] Setting up default X-Plane directories for base path: ${xplaneBasePath}`);

  // Set up default directories based on X-Plane base path
  const aircraftPath = defaultAircraftDir(xplaneBasePath);
  const customDataPath = defaultCustomDataDir(xplaneBasePath);
  const customSceneryPath = defaultCustomSceneryDir(xplaneBasePath);
  const resourcesPath = defaultResourcesDir(xplaneBasePath);
  const pluginsPath = defaultPluginsDir(xplaneBasePath);

  console.log(`[InstallPathUtils] Setting default paths:
    Aircraft: ${aircraftPath}
    Custom Data: ${customDataPath}
    Custom Scenery: ${customSceneryPath}
    Resources: ${resourcesPath}
    Plugins: ${pluginsPath}`);

  // Set all the default paths
  await Promise.all([
    settings.set('mainSettings.xp12AircraftPath', aircraftPath),
    settings.set('mainSettings.xp12CustomDataPath', customDataPath),
    settings.set('mainSettings.xp12CustomSceneryPath', customSceneryPath),
    settings.set('mainSettings.xp12ResourcesPath', resourcesPath),
    settings.set('mainSettings.xp12PluginsPath', pluginsPath),
    settings.set('mainSettings.installPath', aircraftPath), // Default install path to aircraft
  ]);

  console.log(`[InstallPathUtils] Default X-Plane directories configured successfully`);
};
