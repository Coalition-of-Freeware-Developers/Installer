import Store, { Schema } from 'electron-store';
import * as fs from 'fs';
import walk from 'walkdir';
import * as path from 'path';
import * as os from 'os';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import * as packageInfo from '../../package.json';
import { Directories } from 'renderer/utils/Directories';

export const steamXPlaneBasePath = path.join(Directories.steamAppsCommon(), 'X-Plane 12');

const findXPlane12BasePath = (): string => {
  if (os.platform().toString() === 'linux') {
    return '/home'; // Default Linux path, user will need to configure
  }

  // Check Steam installation first
  if (fs.existsSync(steamXPlaneBasePath) && fs.existsSync(path.join(steamXPlaneBasePath, 'X-Plane.exe'))) {
    return steamXPlaneBasePath;
  }

  // Look for manual installations in common locations
  const commonPaths = [
    'C:\\X-Plane 12',
    'D:\\X-Plane 12',
    'E:\\X-Plane 12',
    path.join(Directories.documentsDir(), 'X-Plane 12'),
  ];

  for (const commonPath of commonPaths) {
    if (fs.existsSync(commonPath) && fs.existsSync(path.join(commonPath, 'X-Plane.exe'))) {
      return commonPath;
    }
  }

  // Search in Program Files
  const programFiles = ['C:\\Program Files\\X-Plane 12', 'C:\\Program Files (x86)\\X-Plane 12'];

  for (const programPath of programFiles) {
    if (fs.existsSync(programPath) && fs.existsSync(path.join(programPath, 'X-Plane.exe'))) {
      return programPath;
    }
  }

  return 'C:\\'; // Fallback
};

export const defaultAircraftDir = (xp12Base: string): string => {
  if (os.platform().toString() === 'linux') {
    return '/home';
  }

  const aircraftDir = path.join(xp12Base, 'Aircraft');
  return fs.existsSync(aircraftDir) ? aircraftDir : 'C:\\';
};

export const defaultCustomDataDir = (xp12Base: string): string => {
  if (os.platform().toString() === 'linux') {
    return '/home';
  }

  const customDataDir = path.join(xp12Base, 'Custom Data');
  return fs.existsSync(customDataDir) ? customDataDir : 'C:\\';
};

export const defaultCustomSceneryDir = (xp12Base: string): string => {
  if (os.platform().toString() === 'linux') {
    return '/home';
  }

  const customSceneryDir = path.join(xp12Base, 'Custom Scenery');
  return fs.existsSync(customSceneryDir) ? customSceneryDir : 'C:\\';
};

export const useSetting = <T>(key: string, defaultValue?: T): [T, Dispatch<SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState(store.get<string, T>(key, defaultValue));

  useEffect(() => {
    setStoredValue(store.get<string, T>(key, defaultValue));

    const cancel = store.onDidChange(key as never, (val) => {
      setStoredValue(val as T);
    });

    return () => {
      cancel();
    };
  }, [defaultValue, key]);

  const setValue = (newVal: T) => {
    store.set(key, newVal);
  };

  return [storedValue, setValue];
};

export const useIsDarkTheme = (): boolean => {
  return true;
};

interface RendererSettings {
  mainSettings: {
    autoStartApp: boolean;
    disableExperimentalWarning: boolean;
    disableDependencyPrompt: { [k: string]: { [k: string]: boolean } };
    disableBackgroundServiceAutoStartPrompt: { [k: string]: { [k: string]: boolean } };
    useCdnCache: boolean;
    dateLayout: string;
    useLongDateFormat: boolean;
    useDarkTheme: boolean;
    allowSeasonalEffects: boolean;
    xp12BasePath: string;
    xp12AircraftPath: string;
    xp12CustomDataPath: string;
    xp12CustomSceneryPath: string;
    configDownloadUrl: string;
    configForceUseLocal: boolean;
  };
  cache: {
    main: {
      lastShownSection: string;
      lastShownAddonKey: string;
    };
  };
  metaInfo: {
    lastVersion: string;
    lastLaunch: number;
  };
}

const schema: Schema<RendererSettings> = {
  mainSettings: {
    type: 'object',
    // Empty defaults are required when using type: "object" (https://github.com/sindresorhus/conf/issues/85#issuecomment-531651424)
    default: {},
    properties: {
      autoStartApp: {
        type: 'boolean',
        default: false,
      },
      disableExperimentalWarning: {
        type: 'boolean',
        default: false,
      },
      disableDependencyPrompt: {
        type: 'object',
        default: {},
        additionalProperties: {
          type: 'object',
          default: {},
          additionalProperties: {
            type: 'object',
            default: {},
            additionalProperties: {
              type: 'boolean',
              default: false,
            },
          },
        },
      },
      disableBackgroundServiceAutoStartPrompt: {
        type: 'object',
        default: {},
        additionalProperties: {
          type: 'object',
          default: {},
          additionalProperties: {
            type: 'boolean',
            default: false,
          },
        },
      },
      disableAddonDiskSpaceModal: {
        type: 'object',
        default: {},
        additionalProperties: {
          type: 'object',
          default: {},
          additionalProperties: {
            type: 'boolean',
            default: false,
          },
        },
      },
      useCdnCache: {
        type: 'boolean',
        default: true,
      },
      dateLayout: {
        type: 'string',
        default: 'yyyy/mm/dd',
      },
      useLongDateFormat: {
        type: 'boolean',
        default: false,
      },
      useDarkTheme: {
        type: 'boolean',
        default: false,
      },
      allowSeasonalEffects: {
        type: 'boolean',
        default: true,
      },
      xp12BasePath: {
        type: 'string',
        default: findXPlane12BasePath(),
      },
      xp12AircraftPath: {
        type: 'string',
        default: defaultAircraftDir(findXPlane12BasePath()),
      },
      xp12CustomDataPath: {
        type: 'string',
        default: defaultCustomDataDir(findXPlane12BasePath()),
      },
      xp12CustomSceneryPath: {
        type: 'string',
        default: defaultCustomSceneryDir(findXPlane12BasePath()),
      },
      installPath: {
        type: 'string',
        default: defaultAircraftDir(findXPlane12BasePath()),
      },
      separateTempLocation: {
        type: 'boolean',
        default: false,
      },
      tempLocation: {
        type: 'string',
        default: defaultAircraftDir(findXPlane12BasePath()),
      },
      configDownloadUrl: {
        type: 'string',
        default: packageInfo.configUrls.production,
      },
      configForceUseLocal: {
        type: 'boolean',
        default: false,
      },
    },
  },
  cache: {
    type: 'object',
    default: {},
    properties: {
      main: {
        type: 'object',
        default: {},
        properties: {
          lastShownSection: {
            type: 'string',
            default: '',
          },
          lastShownAddonKey: {
            type: 'string',
            default: '',
          },
        },
      },
    },
  },
  metaInfo: {
    type: 'object',
    default: {},
    properties: {
      lastVersion: {
        type: 'string',
        default: '',
      },
      lastLaunch: {
        type: 'integer',
        default: 0,
      },
    },
  },
};

const store = new Store({ schema, clearInvalidConfig: true });

// Workaround to flush the defaults
store.set('metaInfo.lastLaunch', Date.now());

export default store;
