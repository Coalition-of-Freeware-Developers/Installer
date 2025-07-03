import { join } from 'renderer/stubs/path';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Directories } from 'renderer/utils/Directories';
import { XPlaneValidation } from 'renderer/utils/XPlaneValidation';
import { SteamDetection } from 'renderer/utils/SteamDetection';

export const steamXPlaneBasePath = join(Directories.steamAppsCommon(), 'X-Plane 12');
export const xplaneSteamBasePath = steamXPlaneBasePath; // Alias for consistency
export const xplaneBasePath = 'C:\\X-Plane 12'; // Default standard installation path

// Helper functions for default X-Plane paths
export const findXPlane12BasePath = async (): Promise<string> => {
  console.log('[findXPlane12BasePath] Starting comprehensive X-Plane 12 detection');

  // First try Steam detection using steam-locate package
  try {
    console.log('[findXPlane12BasePath] Attempting Steam detection via steam-locate');
    const steamPath = await SteamDetection.detectSteamXPlane12();
    if (steamPath) {
      console.log(`[findXPlane12BasePath] ✓ Found valid Steam X-Plane 12 installation: ${steamPath}`);
      return steamPath;
    }
    console.log('[findXPlane12BasePath] Steam detection did not find X-Plane 12');
  } catch (error) {
    console.warn('[findXPlane12BasePath] Steam detection failed:', error);
  }

  // Fallback to checking common installation paths
  console.log('[findXPlane12BasePath] Checking common installation paths');
  const commonPaths = [
    xplaneBasePath,
    steamXPlaneBasePath,
    'C:\\Program Files\\X-Plane 12',
    'C:\\Program Files (x86)\\X-Plane 12',
  ];

  for (const path of commonPaths) {
    console.log(`[findXPlane12BasePath] Checking: ${path}`);
    const isValid = await XPlaneValidation.isValidXPlaneBasePath(path);
    if (isValid) {
      console.log(`[findXPlane12BasePath] ✓ Found valid X-Plane 12 installation: ${path}`);
      return path;
    }
  }

  console.log('[findXPlane12BasePath] No valid X-Plane 12 installation found in common paths');
  return 'C:\\X-Plane 12'; // Fallback
};

export const defaultAircraftDir = (xp12Base: string): string => {
  return `${xp12Base}\\Aircraft`;
};

export const defaultCustomDataDir = (xp12Base: string): string => {
  return `${xp12Base}\\Custom Data`;
};

export const defaultCustomSceneryDir = (xp12Base: string): string => {
  return `${xp12Base}\\Custom Scenery`;
};

export const defaultResourcesDir = (xp12Base: string): string => {
  return `${xp12Base}\\Resources`;
};

export const defaultPluginsDir = (xp12Base: string): string => {
  return `${xp12Base}\\Resources\\plugins`;
};

export const useSetting = <T>(key: string, defaultValue?: T): [T, Dispatch<SetStateAction<T>>] => {
  const electronStore = window.electronStore;
  const [storedValue, setStoredValue] = useState<T>(() => {
    // Since electronStore methods are now async, we'll start with defaultValue
    // and update via useEffect
    return defaultValue as T;
  });

  useEffect(() => {
    if (!electronStore) return;

    // Get initial value
    electronStore.get(key, defaultValue).then((value: T) => {
      setStoredValue(value);
    });

    const cancel = electronStore.onDidChange(key, (val) => {
      setStoredValue(val as T);
    });

    return () => {
      cancel();
    };
  }, [defaultValue, key, electronStore]);

  const setValue = (newVal: T) => {
    electronStore?.set(key, newVal).catch(console.error);
    setStoredValue(newVal); // Update local state immediately for responsiveness
  };

  return [storedValue, setValue];
};

export const useIsDarkTheme = (): boolean => {
  return true;
};

// Store wrapper that uses electronStore API from preload script
const store = {
  get: async <T>(key: string, defaultValue?: T): Promise<T> => {
    const electronStore = window.electronStore;
    if (!electronStore) return defaultValue as T;
    const value = await electronStore.get(key, defaultValue);
    return value as T;
  },
  set: async (key: string, value: unknown): Promise<void> => {
    const electronStore = window.electronStore;
    if (electronStore) {
      await electronStore.set(key, value);
    }
  },
  delete: async (key: string): Promise<void> => {
    const electronStore = window.electronStore;
    if (electronStore) {
      await electronStore.delete(key);
    }
  },
  clear: async (): Promise<void> => {
    const electronStore = window.electronStore;
    if (electronStore) {
      await electronStore.clear();
    }
  },
  onDidChange: (key: string, callback: (newValue: unknown, oldValue: unknown) => void) => {
    const electronStore = window.electronStore;
    return electronStore?.onDidChange(key, callback) || (() => {});
  },
};

// Initialize last launch time
store.set('metaInfo.lastLaunch', Date.now()).catch(console.error);

export default store;
