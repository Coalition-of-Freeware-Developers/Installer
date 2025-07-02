import React, { useEffect, useState } from 'react';
import { join } from 'renderer/stubs/path';
import channels from 'common/channels';

type IpcCallback = (data?: unknown) => void;

enum UpdateState {
  Standby,
  DownloadingUpdate,
  RestartToUpdate,
}

export const InstallerUpdate = (): JSX.Element => {
  const [updateState, setUpdateState] = useState(UpdateState.Standby);

  const updateNeeded = updateState !== UpdateState.Standby;

  let buttonText;
  switch (updateState) {
    case UpdateState.Standby:
      buttonText = '';
      break;
    case UpdateState.DownloadingUpdate:
      buttonText = 'Downloading update';
      break;
    case UpdateState.RestartToUpdate:
      buttonText = 'Restart to update';
      break;
  }

  useEffect(() => {
    // Check if electronAPI is available
    const electronAPI = (globalThis.window as { electronAPI?: unknown })?.electronAPI as
      | {
          onUpdateError?: (callback: IpcCallback) => void;
          onUpdateAvailable?: (callback: IpcCallback) => void;
          onUpdateDownloaded?: (callback: IpcCallback) => void;
          removeListener?: (channel: string, callback: IpcCallback) => void;
        }
      | undefined;
    if (!electronAPI) {
      console.warn('electronAPI not available in InstallerUpdate component');
      return;
    }

    const updateErrorHandler: IpcCallback = (args) => {
      console.error('Update error', args);
    };

    const updateAvailableHandler: IpcCallback = () => {
      console.log('Update available');

      setUpdateState(UpdateState.DownloadingUpdate);
    };

    const updateDownloadedHandler: IpcCallback = (args) => {
      console.log('Update downloaded', args);

      setUpdateState(UpdateState.RestartToUpdate);

      Notification.requestPermission()
        .then(() => {
          console.log('Showing Update notification');
          new Notification('Restart to update!', {
            icon: join(process.resourcesPath, 'extraResources', 'icon.ico'),
            body: 'An update to the installer has been downloaded',
          });
        })
        .catch((e) => console.log(e));
    };

    electronAPI.onUpdateError(updateErrorHandler);
    electronAPI.onUpdateAvailable(updateAvailableHandler);
    electronAPI.onUpdateDownloaded(updateDownloadedHandler);

    return () => {
      // Cleanup listeners if electronAPI provides removeListener methods
      if (electronAPI.removeListener) {
        electronAPI.removeListener(channels.update.error, updateErrorHandler);
        electronAPI.removeListener(channels.update.available, updateAvailableHandler);
        electronAPI.removeListener(channels.update.downloaded, updateDownloadedHandler);
      }
    };
  }, []);

  return (
    <div
      className={`z-50 flex h-full cursor-pointer items-center justify-center place-self-start bg-yellow-500 px-4 transition duration-200 hover:bg-yellow-600 ${
        updateNeeded ? 'visible' : 'hidden'
      }`}
      onClick={() => {
        if (updateState === UpdateState.RestartToUpdate) {
          const electronAPI = (globalThis.window as { electronAPI?: { restartAndUpdate?: () => void } })?.electronAPI;
          if (electronAPI?.restartAndUpdate) {
            electronAPI.restartAndUpdate();
          }
        }
      }}
    >
      <div className="text-lg font-semibold text-white">{buttonText}</div>
    </div>
  );
};
