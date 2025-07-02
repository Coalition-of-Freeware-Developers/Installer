import React, { useState, useEffect } from 'react';
import { setupInstallPath, setupXPlaneBasePath } from 'renderer/actions/install-path.utils';
import settings, { defaultAircraftDir } from 'renderer/rendererSettings';
import { Directories } from 'renderer/utils/Directories';
import { Button, ButtonType } from 'renderer/components/Button';
import ipcFs from 'renderer/utils/IPCFileSystem';
import { XPlaneValidation } from 'renderer/utils/XPlaneValidation';

// Extend window type to include electronAPI
const window = globalThis.window as typeof globalThis.window & {
  electronAPI: {
    reloadWindow: () => void;
  };
};

export const ErrorModal = (): React.JSX.Element => {
  const [xplaneBasePathError, setXplaneBasePathError] = useState<boolean>(false);
  const [installLocationError, setInstallLocationError] = useState<boolean>(false);
  const [installLocationPath, setInstallLocationPath] = useState<string>('');

  useEffect(() => {
    const checkPaths = async () => {
      try {
        // Ensure IPC is available before proceeding
        if (!globalThis.window?.electronAPI?.fs) {
          console.warn('[ErrorModal] electronAPI.fs not available, skipping path checks');
          // Set timeout to retry after a delay
          setTimeout(() => {
            if (globalThis.window?.electronAPI?.fs) {
              checkPaths();
            }
          }, 1000);
          return;
        }

        console.log('[ErrorModal] Starting path checks...');

        // Check X-Plane base path
        const xplanePath = await Directories.xplaneBasePath();
        console.log('[ErrorModal] X-Plane path:', xplanePath);

        const xplaneValid =
          xplanePath === 'notInstalled' ? false : await XPlaneValidation.isValidXPlaneBasePath(xplanePath);
        const xplaneError = !xplaneValid && xplanePath !== 'notInstalled';
        setXplaneBasePathError(xplaneError);

        console.log(
          `[ErrorModal] X-Plane validation - Path: "${xplanePath}", Valid: ${xplaneValid}, Error: ${xplaneError}`,
        );

        // Check install locations
        const installLocation = await Directories.installLocation();
        const communityLocation = await Directories.communityLocation();
        const tempLocation = await Directories.tempLocation();

        console.log('[ErrorModal] Install paths:', { installLocation, communityLocation, tempLocation });

        // Store install location for display
        setInstallLocationPath(installLocation);

        // Validate aircraft directory - only check if the main install location exists
        const aircraftValid = await XPlaneValidation.isValidAircraftDirectory(installLocation);

        // For temp location, just check if it exists (or if separate temp is disabled, use install location)
        const tempLocationValid = tempLocation === installLocation || (await ipcFs.existsSync(tempLocation));

        const installError = !aircraftValid || !tempLocationValid;

        setInstallLocationError(installError);
        console.log('[ErrorModal] Path checks completed', {
          xplaneValid,
          aircraftValid,
          tempLocationValid,
          xplaneError,
          installError,
        });
      } catch (error) {
        console.error('[ErrorModal] Error checking paths:', error);
        // In case of error, assume paths are invalid to be safe
        setXplaneBasePathError(true);
        setInstallLocationError(true);
      }
    };

    // Add a small delay to ensure the preload script has finished setting up the electronAPI
    const timer = setTimeout(() => {
      checkPaths();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleSelectXPlaneBasePath = async () => {
    const path = await setupXPlaneBasePath();
    if (path) {
      const aircraftDir = defaultAircraftDir(path);
      settings.set('mainSettings.xplaneAircraftPath', aircraftDir);
      settings.set('mainSettings.installPath', aircraftDir);
      settings.set('mainSettings.separateTempLocation', false);
      settings.set('mainSettings.tempLocation', aircraftDir);
      window.electronAPI.reloadWindow();
    }
    // If path is empty, user cancelled or validation failed, so don't reload
  };

  const handleSelectInstallPath = async () => {
    const path = await setupInstallPath();
    if (path) {
      settings.set('mainSettings.xplaneAircraftPath', path);
      settings.set('mainSettings.separateTempLocation', false);
      settings.set('mainSettings.tempLocation', path);
      window.electronAPI.reloadWindow();
    }
    // If path is empty, user cancelled or validation failed, so don't reload
  };

  const handleNoXPlane = () => {
    settings.set('mainSettings.xp12BasePath', 'notInstalled');
    window.electronAPI.reloadWindow();
  };

  const content = (): React.JSX.Element => {
    // Linux's error goes first because it may interfere with the other dir checkers
    // For now, we'll assume non-Linux platform since this is primarily a Windows/X-Plane focused installer
    const isLinux = false; // TODO: Implement proper platform detection via IPC
    if (isLinux) {
      if (xplaneBasePathError) {
        return (
          <>
            <span className="w-3/5 text-center text-2xl">Seems like you&apos;re using Linux</span>
            <span className="w-3/5 text-center text-2xl">
              We&apos;re unable to autodetect your X-Plane 12 installation. Please select the correct X-Plane 12 base
              directory (containing X-Plane executable) before we can continue. It is usually located somewhere here:
              <br />
              ~/.local/share/Steam/steamapps/common/X-Plane 12/
            </span>

            <Button type={ButtonType.Neutral} onClick={handleSelectXPlaneBasePath}>
              Select Path
            </Button>
            <Button type={ButtonType.Neutral} onClick={handleNoXPlane}>
              I don&apos;t have X-Plane 12 installed
            </Button>
          </>
        );
      }
      if (installLocationError) {
        return (
          <>
            <span className="w-3/5 text-center text-2xl">Seems like you&apos;re using Linux</span>
            <span className="w-3/5 text-center text-2xl">
              We&apos;re unable to autodetect your aircraft directory. Please select the correct Aircraft directory
              before we can continue. This should be the Aircraft folder inside your X-Plane 12 installation.
            </span>

            <Button type={ButtonType.Neutral} onClick={handleSelectInstallPath}>
              Select Path
            </Button>
          </>
        );
      }
    }
    if (xplaneBasePathError) {
      return (
        <>
          <span className="w-3/5 text-center text-2xl">
            We couldn&apos;t find a valid X-Plane 12 installation at the specified path. <br /> <br />
            Please select the root X-Plane 12 directory that contains the X-Plane.exe file. <br /> <br />
            Common installation locations: <br />
            &quot;C:\X-Plane 12\&quot; <br />
            &quot;C:\Program Files\X-Plane 12\&quot; <br />
            &quot;C:\Program Files (x86)\X-Plane 12\&quot; <br />
            <br />
            Steam installations: <br />
            &quot;C:\Program Files (x86)\Steam\steamapps\common\X-Plane 12\&quot; <br /> <br />
            Make sure the selected folder directly contains X-Plane.exe
          </span>

          <Button type={ButtonType.Neutral} onClick={handleSelectXPlaneBasePath}>
            Select Path
          </Button>
          <Button type={ButtonType.Neutral} onClick={handleNoXPlane}>
            I don&apos;t have X-Plane 12 installed
          </Button>
        </>
      );
    }
    if (installLocationError) {
      return (
        <>
          <span className="w-3/5 text-center text-2xl">Your Aircraft folder is set to</span>
          <pre className="mb-0 w-3/5 rounded-lg bg-gray-700 px-6 py-2.5 text-center font-mono text-2xl">
            {installLocationPath}
          </pre>
          <span className="w-3/5 text-center text-2xl">
            but we couldn&apos;t find it there or it&apos;s not accessible. Please select a valid Aircraft directory
            before we can continue. <br /> <br />
            The Aircraft directory should be inside your X-Plane 12 installation folder. <br />
            Example: &quot;C:\X-Plane 12\Aircraft&quot; <br /> <br />
            Make sure the selected folder exists and is accessible.
          </span>

          <Button type={ButtonType.Neutral} onClick={handleSelectInstallPath}>
            Select Aircraft Directory
          </Button>
        </>
      );
    }
    return <></>;
  };

  if (installLocationError || xplaneBasePathError) {
    return (
      <div className="fixed left-0 top-0 z-50 flex h-screen w-screen flex-col items-center justify-center gap-y-5 bg-navy text-gray-100">
        <span className="text-5xl font-semibold">Something went wrong.</span>
        {content()}
      </div>
    );
  }
  return <></>;
};
