import settings, { xplaneBasePath, xplaneSteamBasePath } from 'renderer/rendererSettings';
import { Directories } from 'renderer/utils/Directories';
import { XPlaneValidation } from 'renderer/utils/XPlaneValidation';

const selectPath = async (currentPath: string, dialogTitle: string, setting: string): Promise<string> => {
  console.log(`[InstallPathUtils] Selecting path for setting: ${setting}`);

  const path = await globalThis.window.electronAPI.remote.showOpenDialog({
    title: dialogTitle,
    defaultPath: typeof currentPath === 'string' ? currentPath : '',
    properties: ['openDirectory'],
  });

  if (path.filePaths[0]) {
    const selectedPath = path.filePaths[0];
    console.log(`[InstallPathUtils] User selected path: "${selectedPath}"`);

    // If this is for X-Plane base path, validate it
    if (setting === 'mainSettings.xplaneBasePath') {
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

    console.log(`[InstallPathUtils] Setting "${setting}" to: "${selectedPath}"`);
    settings.set(setting, selectedPath);
    return selectedPath;
  } else {
    console.log(`[InstallPathUtils] User cancelled path selection`);
    return '';
  }
};

export const setupXPlaneBasePath = async (): Promise<string> => {
  const currentPath = await Directories.xplaneBasePath();

  const availablePaths: string[] = [];
  const basePathValid = await XPlaneValidation.isValidXPlaneBasePath(xplaneBasePath);
  if (basePathValid) {
    availablePaths.push('Standard X-Plane 12 Installation');
  }
  const steamPathValid = await XPlaneValidation.isValidXPlaneBasePath(xplaneSteamBasePath);
  if (steamPathValid) {
    availablePaths.push('Steam Edition');
  }

  if (availablePaths.length > 0) {
    availablePaths.push('Custom Directory');

    const { response } = await globalThis.window.electronAPI.remote.showMessageBox({
      title: 'FlyByWire Installer',
      message: 'We found a possible X-Plane 12 installation.',
      type: 'warning',
      buttons: availablePaths,
    });

    const selection = availablePaths[response];
    switch (selection) {
      case 'Standard X-Plane 12 Installation':
        settings.set('mainSettings.xplaneBasePath', xplaneBasePath);
        return xplaneBasePath;
      case 'Steam Edition':
        settings.set('mainSettings.xplaneBasePath', xplaneSteamBasePath);
        return xplaneSteamBasePath;
      case 'Custom Directory':
        break;
    }
  }

  return await selectPath(currentPath, 'Select your X-Plane 12 base directory', 'mainSettings.xplaneBasePath');
};

export const setupXPlaneAircraftPath = async (): Promise<string> => {
  const currentPath = await Directories.installLocation();

  return await selectPath(currentPath, 'Select your X-Plane 12 Aircraft directory', 'mainSettings.xp12AircraftPath');
};

export const setupMsfsCommunityPath = async (): Promise<string> => {
  // For X-Plane, this is the same as aircraft path
  return await setupXPlaneAircraftPath();
};

export const setupInstallPath = async (): Promise<string> => {
  const currentPath = await Directories.installLocation();

  return await selectPath(currentPath, 'Select your install directory', 'mainSettings.installPath');
};

export const setupTempLocation = async (): Promise<string> => {
  const currentPath = await Directories.tempLocation();

  return await selectPath(currentPath, 'Select a location for temporary folders', 'mainSettings.tempLocation');
};
