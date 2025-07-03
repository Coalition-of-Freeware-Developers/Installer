import Store, { Schema } from 'electron-store';
import { BrowserWindow } from 'electron';

export const persistWindowSettings = (window: BrowserWindow): void => {
  store.set('cache.main.maximized', window.isMaximized());

  const winSize = window.getSize();
  store.set('cache.main.lastWindowX', winSize[0]);
  store.set('cache.main.lastWindowY', winSize[1]);
};

interface Settings {
  mainSettings: {
    autoStartApp: boolean;
    disableExperimentalWarning: boolean;
    disableDependencyPrompt: { [k: string]: { [k: string]: boolean } };
    disableBackgroundServiceAutoStartPrompt: { [k: string]: { [k: string]: boolean } };
    disableAddonDiskSpaceModal: { [k: string]: { [k: string]: boolean } };
    useCdnCache: boolean;
    dateLayout: string;
    useLongDateFormat: boolean;
    useDarkTheme: boolean;
    allowSeasonalEffects: boolean;
    xp12BasePath: string;
    xp12AircraftPath: string;
    xp12CustomDataPath: string;
    xp12CustomSceneryPath: string;
    xp12ResourcesPath: string;
    xp12PluginsPath: string;
    installPath: string;
    separateTempLocation: boolean;
    tempLocation: string;
    configDownloadUrl: string;
    configForceUseLocal: boolean;
  };
  cache: {
    main: {
      lastWindowX: number;
      lastWindowY: number;
      maximized: boolean;
      lastShownSection: string;
      lastShownAddonKey: string;
    };
  };
  metaInfo: {
    lastVersion: string;
    lastLaunch: number;
  };
}

const schema: Schema<Settings> = {
  mainSettings: {
    type: 'object',
    default: {},
  },
  cache: {
    type: 'object',
    default: {},
    properties: {
      main: {
        type: 'object',
        default: {},
        properties: {
          lastWindowX: {
            type: 'integer',
          },
          lastWindowY: {
            type: 'integer',
          },
          maximized: {
            type: 'boolean',
            default: false,
          },
        },
      },
    },
  },
  metaInfo: {
    type: 'object',
    default: {},
  },
};

const store = new Store({ schema, clearInvalidConfig: true });

export default store;
