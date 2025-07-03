import React from 'react';
import { Addon, AddonTrack, Publisher } from 'renderer/utils/InstallerConfiguration';
import { PromptModal } from 'renderer/components/Modal';
import { ButtonType } from 'renderer/components/Button';
import { deleteDownload, registerNewDownload, updateDownloadProgress } from 'renderer/redux/features/downloads';
import { Directories } from 'renderer/utils/Directories';
import { AddonInstallationManager } from 'renderer/utils/AddonInstallationManager';
import ipcFs from 'renderer/utils/IPCFileSystem';
import { ApplicationStatus, InstallStatus, InstallStatusCategories } from 'renderer/components/AddonSection/Enums';
import {
  InstallError,
  InstallOperation,
  UpdateChecker,
  getCurrentInstall,
  InstallManifest,
} from 'renderer/types/install';
import settings from 'renderer/rendererSettings';
import { store } from 'renderer/redux/store';
import { InstallState, setInstallStatus } from 'renderer/redux/features/installStatus';
import { setSelectedTrack } from 'renderer/redux/features/selectedTrack';
import { setInstalledTrack } from 'renderer/redux/features/installedTrack';
import { join } from 'renderer/stubs/path';
import { DependencyDialogBody } from 'renderer/components/Modal/DependencyDialog';
import { IncompatibleAddonDialogBody } from 'renderer/components/Modal/IncompatibleAddonDialog';
import { Resolver } from 'renderer/utils/Resolver';
import { AutostartDialog } from 'renderer/components/Modal/AutostartDialog';
import { BackgroundServices } from 'renderer/utils/BackgroundServices';
import { CannotInstallDialog } from 'renderer/components/Modal/CannotInstallDialog';
import { ExternalApps } from 'renderer/utils/ExternalApps';
import { ExternalAppsUI } from './ExternalAppsUI';
import { ErrorDialog } from 'renderer/components/Modal/ErrorDialog';
import { InstallSizeDialog } from 'renderer/components/Modal/InstallSizeDialog';
import { IncompatibleAddOnsCheck } from 'renderer/utils/IncompatibleAddOnsCheck';
import { FreeDiskSpace, FreeDiskSpaceStatus } from 'renderer/utils/FreeDiskSpace';
import { setAddonAndTrackLatestReleaseInfo } from 'renderer/redux/features/latestVersionNames';
import { AddonData, ReleaseInfo } from 'renderer/utils/AddonData';

export enum InstallResult {
  Success,
  Failure,
  Cancelled,
}

export class InstallManager {
  private static abortControllers = (() => {
    const arr = new Array<AbortController>(20);

    arr.fill(new AbortController());

    return arr;
  })();

  private static get electronAPI() {
    if (typeof window !== 'undefined' && (window as { electronAPI?: unknown }).electronAPI) {
      return (
        window as unknown as {
          electronAPI: {
            installManager: {
              onInstallEvent: (
                handler: (event: unknown, installID: number, eventName: string, ...args: unknown[]) => void,
              ) => void;
              removeInstallEventListener: (
                handler: (event: unknown, installID: number, eventName: string, ...args: unknown[]) => void,
              ) => void;
              cancelInstall: (installID: number) => void;
              installFromUrl: (installID: number, url: string, tempDir: string, destDir: string) => Promise<unknown>;
              uninstall: (installDir: string, directories: string[]) => Promise<void>;
            };
          };
        }
      ).electronAPI;
    }
    throw new Error('electronAPI is not available. Make sure preload script is properly loaded.');
  }

  public static async installAddon(
    addon: Addon,
    publisher: Publisher,
    showModal: (modal: React.JSX.Element) => Promise<boolean>,
    _dependencyOf?: Addon,
  ): Promise<InstallResult> {
    this.setCurrentInstallState(addon, { status: InstallStatus.DownloadPending });

    const setErrorState = () => {
      this.setCurrentInstallState(addon, { status: InstallStatus.DownloadError });
    };

    const setCancelledState = () => {
      this.setCurrentInstallState(addon, { status: InstallStatus.DownloadCanceled, timestamp: Date.now() });
    };

    const startResetStateTimer = (timeout = 3_000) => {
      setTimeout(async () => {
        store.dispatch(deleteDownload({ id: addon.key }));
        this.setCurrentInstallState(addon, await this.determineAddonInstallStatus(addon));
      }, timeout);
    };

    const removeDownloadState = () => {
      store.dispatch(deleteDownload({ id: addon.key }));
    };

    const track = this.getAddonSelectedTrack(addon);

    const disallowedRunningExternalApps = ExternalApps.forAddon(addon, publisher);

    const runningExternalApps = disallowedRunningExternalApps.filter(
      (it) => store.getState().applicationStatus[it.key] === ApplicationStatus.Open,
    );

    if (runningExternalApps.length > 0) {
      const doInstall = await showModal(<CannotInstallDialog addon={addon} publisher={publisher} />);

      if (!doInstall) {
        startResetStateTimer(0);

        return InstallResult.Cancelled;
      }
    }

    // Find dependencies
    for (const dependency of addon.dependencies ?? []) {
      const [, publisherKey, addonKey] = dependency.addon.match(/@(\w+)\/(\w+)/);

      const dependencyPublisher = Resolver.findPublisher(publisherKey);
      const dependencyAddon = Resolver.findAddon(publisherKey, addonKey);

      if (!dependencyAddon) {
        console.error(
          `[InstallManager](installAddon) Addon specified dependency for unknown addon: @${publisherKey}/${addonKey}`,
        );

        return InstallResult.Failure;
      }

      const dependencyInstallState = await this.getAddonInstallState(dependencyAddon);

      const isDependencyUptoDate = dependencyInstallState.status === InstallStatus.UpToDate;
      const isDependencyNotInstalled = dependencyInstallState.status === InstallStatus.NotInstalled;

      if (!isDependencyUptoDate) {
        let doInstallDependency = true;

        if (dependency.optional && isDependencyNotInstalled) {
          const settingString = `mainSettings.disableDependencyPrompt.${publisher.key}.${addon.key}.@${dependencyPublisher.key}/${dependencyAddon.key}`;
          const doNotAsk = settings.get(settingString);

          doInstallDependency = false;

          if (!doNotAsk) {
            doInstallDependency = await showModal(
              <PromptModal
                title="Dependency"
                bodyText={
                  <DependencyDialogBody
                    addon={addon}
                    dependency={dependency}
                    dependencyAddon={dependencyAddon}
                    dependencyPublisher={dependencyPublisher}
                  />
                }
                cancelText="No"
                confirmText="Yes"
                confirmColor={ButtonType.Positive}
                dontShowAgainSettingName={settingString}
              />,
            );
          }
        }

        if (doInstallDependency) {
          this.setCurrentInstallState(addon, {
            status: InstallStatus.InstallingDependency,
            dependencyAddonKey: dependencyAddon.key,
            dependencyPublisherKey: dependencyPublisher.key,
          });

          const result = await this.installAddon(dependencyAddon, dependencyPublisher, showModal, addon);

          if (result === InstallResult.Failure) {
            console.error('[InstallManager](installAddon) Error while installing dependency - aborting');

            setErrorState();
            startResetStateTimer();

            return InstallResult.Failure;
          } else if (result === InstallResult.Cancelled) {
            console.log('[InstallManager](installAddon) Dependency install cancelled, canceling main addon too.');

            setCancelledState();
            startResetStateTimer();

            return InstallResult.Cancelled;
          } else {
            console.log(
              `[InstallManager](installAddon) Dependency @${publisherKey}/${addonKey} installed successfully.`,
            );
          }
        }
      }
    }

    // Check for incompatible addons
    if (addon.incompatibleAddons && addon.incompatibleAddons.length > 0) {
      const incompatibleAddons = await IncompatibleAddOnsCheck.checkIncompatibleAddOns(addon);
      if (incompatibleAddons.length > 0) {
        const continueInstall = await showModal(
          <PromptModal
            title="Incompatible Add-ons Found!"
            bodyText={<IncompatibleAddonDialogBody addon={addon} incompatibleAddons={incompatibleAddons} />}
            cancelText="No"
            confirmText="Yes"
            confirmColor={ButtonType.Positive}
          />,
        );
        if (!continueInstall) {
          startResetStateTimer();

          return InstallResult.Cancelled;
        }
      }
    }

    // Prepare installation environment using category-based logic
    const installPrep = await AddonInstallationManager.prepareInstallationEnvironment(addon);

    if (!installPrep.success) {
      console.error(`[InstallManager](installAddon) Installation preparation failed: ${installPrep.errorMessage}`);

      await showModal(
        <PromptModal
          title="Installation Error"
          bodyText={
            `Cannot install ${addon.name} because the required directory is not properly configured:\n\n` +
            `${installPrep.errorMessage}\n\n` +
            `Please check your X-Plane 12 installation and directory settings.`
          }
          confirmColor={ButtonType.Neutral}
        />,
      );

      setErrorState();
      startResetStateTimer();
      return InstallResult.Failure;
    }

    const destDir = installPrep.installPath;
    const tempDir = await Directories.temp();

    console.log(`[InstallManager](installAddon) Installing ${addon.name} (${addon.category}) to: ${destDir}`);

    const updateChecker = new UpdateChecker();
    const updateInfo = await updateChecker.needsUpdate(track.url, destDir, { forceCacheBust: true });

    // Confirm download size and required disk space with user
    const requiredDiskSpace = updateInfo.requiredDiskSpace;

    const freeDeskSpaceInfo = await FreeDiskSpace.analyse(requiredDiskSpace);

    const diskSpaceModalSettingString = `mainSettings.disableAddonDiskSpaceModal.${publisher.key}.${addon.key}`;
    const dontAsk = settings.get(diskSpaceModalSettingString);

    if (
      (!dontAsk || freeDeskSpaceInfo.status !== FreeDiskSpaceStatus.NotLimited) &&
      freeDeskSpaceInfo.status !== FreeDiskSpaceStatus.Unknown
    ) {
      const continueInstall = await showModal(
        <InstallSizeDialog
          updateInfo={updateInfo}
          freeDeskSpaceInfo={freeDeskSpaceInfo}
          dontShowAgainSettingName={diskSpaceModalSettingString}
        />,
      );

      if (!continueInstall) {
        startResetStateTimer();

        return InstallResult.Cancelled;
      }
    }

    // Initialize abort controller for downloads
    const abortControllerID = this.lowestAvailableAbortControllerID();

    this.abortControllers[abortControllerID] = new AbortController();
    const signal = this.abortControllers[abortControllerID].signal;

    let moduleCount = updateInfo.isFreshInstall ? 1 : updateInfo.updatedModules.length + updateInfo.addedModules.length;
    if (!updateInfo.isFreshInstall && updateInfo.baseChanged) {
      moduleCount++;
    }

    store.dispatch(
      registerNewDownload({
        id: addon.key,
        module: '',
        moduleCount,
        abortControllerID: abortControllerID,
      }),
    );

    const installLocation = await Directories.installLocation();
    if (tempDir === installLocation) {
      console.error('[InstallManager](installAddon) Community directory equals temp directory');

      this.notifyDownload(addon, false);
      return InstallResult.Failure;
    }

    console.log(`[InstallManager](installAddon) Installing track=${track.key}`);
    console.log('[InstallManager](installAddon) Installing into:');
    console.log('[InstallManager](installAddon) ---');
    console.log(`[InstallManager](installAddon) installDir: ${destDir}`);
    console.log(`[InstallManager](installAddon) tempDir:    ${tempDir}`);
    console.log('[InstallManager](installAddon) ---');

    try {
      // Create dest dir if it doesn't exist
      const destDirExists = await ipcFs.existsSync(destDir);
      if (!destDirExists) {
        // Directory creation is handled by the main process during install
        console.log(`[InstallManager](installAddon) Destination directory will be created: ${destDir}`);
      }

      this.setCurrentInstallState(addon, { status: InstallStatus.DownloadPrep });

      // Generate a random install ID to keep track of events related to our install
      const ourInstallID = Math.floor(Math.random() * 1_000_000);

      const handleDownloadEvent = (_: unknown, installID: number, event: string, ...args: unknown[]) => {
        if (installID !== ourInstallID) {
          return;
        }

        switch (event) {
          case 'downloadStarted': {
            console.log('[InstallManager](installAddon) Download started');
            this.setCurrentInstallState(addon, { status: InstallStatus.Downloading });

            store.dispatch(
              updateDownloadProgress({
                id: addon.key,
                module: 'main',
                progress: {
                  interrupted: false,
                  totalPercent: 0,
                },
              }),
            );
            break;
          }
          case 'downloadProgress': {
            const [, progress] = args as [unknown, { percent: number }];

            store.dispatch(
              updateDownloadProgress({
                id: addon.key,
                module: 'main',
                progress: {
                  interrupted: false,
                  totalPercent: progress.percent,
                },
              }),
            );
            break;
          }
          case 'downloadFinished': {
            console.log('[InstallManager](installAddon) Download finished');
            break;
          }
          case 'copyStarted': {
            console.log('[InstallManager](installAddon) Copy started');
            this.setCurrentInstallState(addon, { status: InstallStatus.Decompressing, percent: 0 });
            break;
          }
          case 'copyProgress': {
            const [, progress] = args as [unknown, { percent: number }];

            this.setCurrentInstallState(addon, {
              status: InstallStatus.Decompressing,
              percent: progress.percent,
            });
            break;
          }
          case 'copyFinished': {
            console.log('[InstallManager](installAddon) Copy finished');
            break;
          }
          case 'phaseChange': {
            const [phase] = args as [{ op: string }];

            if (phase.op === InstallOperation.InstallFinish) {
              this.setCurrentInstallState(addon, { status: InstallStatus.DownloadEnding });
              return;
            }
            break;
          }
          case 'cancelled': {
            console.log('[InstallManager](installAddon) Download cancelled');
            this.setCurrentInstallState(addon, { status: InstallStatus.DownloadCanceled, timestamp: Date.now() });
            break;
          }
          case 'error': {
            const [error] = args as [Error];
            console.error('[InstallManager](installAddon) Error during install:', error);
            break;
          }
        }
      };

      // Listen to download events
      this.electronAPI.installManager.onInstallEvent(handleDownloadEvent);

      // Send cancel message when abort controller is aborted
      this.abortControllers[abortControllerID].signal.addEventListener('abort', () => {
        this.electronAPI.installManager.cancelInstall(ourInstallID);
      });

      console.log('[InstallManager](installAddon) Starting download for URL', track.url);

      const installResult = await this.electronAPI.installManager.installFromUrl(
        ourInstallID,
        track.url,
        tempDir,
        destDir,
      );

      // Throw any error so we can display the error dialog
      if (typeof installResult === 'object') {
        throw installResult;
      }

      console.log('[InstallManager](installAddon) Download finished for URL', track.url);

      // Stop listening to download events
      this.electronAPI.installManager.removeInstallEventListener(handleDownloadEvent);

      // Remove installs existing under alternative names
      console.log('[InstallManager](installAddon) Removing installs existing under alternative names');
      Directories.removeAlternativesForAddon(addon);
      console.log('[InstallManager](installAddon) Finished removing installs existing under alternative names');

      this.notifyDownload(addon, true);

      // Flash completion text
      this.setCurrentlyInstalledTrack(addon, track);
      this.setCurrentInstallState(addon, { status: InstallStatus.DownloadDone });

      // If we have a background service, ask if we want to enable it
      if (addon.backgroundService && (addon.backgroundService.enableAutostartConfiguration ?? true)) {
        const app = BackgroundServices.getExternalAppFromBackgroundService(addon, publisher);

        const isAutoStartEnabled = await BackgroundServices.isAutoStartEnabled(addon);
        const doNotAskAgain = (await settings.get(
          `mainSettings.disableBackgroundServiceAutoStartPrompt.${publisher.key}.${addon.key}`,
        )) as boolean;

        if (!isAutoStartEnabled && !doNotAskAgain) {
          await showModal(<AutostartDialog app={app} addon={addon} publisher={publisher} isPrompted={true} />);
        }
      }
    } catch (e) {
      const isInstallError = InstallError.isInstallError(e);

      if (signal.aborted) {
        console.warn('[InstallManager](installAddon) Download was cancelled');

        setCancelledState();
        startResetStateTimer();

        return InstallResult.Cancelled;
      } else {
        console.error('[InstallManager](installAddon) Download failed, see exception below');
        console.error(e);

        setErrorState();

        await showModal(<ErrorDialog error={isInstallError ? e : InstallError.createFromError(e)} />);

        startResetStateTimer();

        return InstallResult.Failure;
      }
    }

    removeDownloadState();

    return InstallResult.Success;
  }

  public static cancelDownload(addon: Addon): void {
    let download = store.getState().downloads.find((it) => it.id === addon.key);
    if (!download) {
      for (const dependency of addon.dependencies ?? []) {
        const [, publisherKey, addonKey] = dependency.addon.match(/@(\w+)\/(\w+)/);

        const dependencyAddon = Resolver.findAddon(publisherKey, addonKey);

        const dependencyDownload = store.getState().downloads.find((it) => it.id === dependencyAddon.key);

        if (dependencyDownload) {
          download = dependencyDownload;
        }
      }
    }

    if (!download) {
      throw new Error('[InstallManager](cancelDownload) Cannot cancel when no addon or dependency download is ongoing');
    }

    const abortController = this.abortControllers[download.abortControllerID];

    abortController?.abort();
  }

  public static async uninstallAddon(
    addon: Addon,
    publisher: Publisher,
    showModal: (modal: JSX.Element) => Promise<boolean>,
  ): Promise<void> {
    const doUninstall = await showModal(
      <PromptModal
        title="Are you sure?"
        bodyText={`You are about to uninstall the addon **${addon.name}**. You cannot undo this, except by reinstalling.`}
        confirmColor={ButtonType.Danger}
      />,
    );

    if (!doUninstall) {
      return;
    }

    // Make sure no disallowed external apps are running
    const noExternalAppsRunning = await ExternalAppsUI.ensureNoneRunningForAddon(addon, publisher, showModal);

    if (!noExternalAppsRunning) {
      return;
    }

    // Remove autostart of the background service if the addon has one
    if (addon.backgroundService && (addon.backgroundService.enableAutostartConfiguration ?? true)) {
      await BackgroundServices.setAutoStartEnabled(addon, publisher, false);
    }

    const installDir = await AddonInstallationManager.getInstallationPath(addon);

    await this.electronAPI.installManager.uninstall(installDir, [await Directories.inPackages(addon.targetDirectory)]);

    this.setCurrentInstallState(addon, { status: InstallStatus.NotInstalled });
    this.setCurrentlyInstalledTrack(addon, null);
  }

  private static getAddonInstall(directory: string): InstallManifest | null {
    try {
      return getCurrentInstall(directory);
    } catch {
      return null;
    }
  }

  public static async getAddonInstallState(addon: Addon): Promise<InstallState> {
    const status = store.getState().installStatus[addon.key] as InstallState;

    if (status) {
      return status;
    }

    return this.refreshAddonInstallState(addon);
  }

  public static async refreshAddonInstallState(addon: Addon): Promise<InstallState> {
    const currentState = store.getState().installStatus[addon.key] as InstallState;

    if (currentState?.status === InstallStatus.DownloadCanceled) {
      setTimeout(
        async () => {
          const status = await this.determineAddonInstallStatus(addon);
          this.setCurrentInstallState(addon, status);
        },
        3_000 - (Date.now() - currentState.timestamp),
      );

      return currentState;
    }

    const status = await this.determineAddonInstallStatus(addon);
    this.setCurrentInstallState(addon, status);

    return status;
  }

  public static getAddonSelectedTrack(addon: Addon): AddonTrack {
    const selectedTrack = store.getState().selectedTracks[addon.key] as AddonTrack;

    if (selectedTrack) {
      return selectedTrack;
    }

    this.setCurrentSelectedTrack(addon, addon.tracks[0]);

    return addon.tracks[0];
  }

  public static async determineAddonInstalledTrack(addon: Addon): Promise<AddonTrack | null> {
    const installedTrack = store.getState().installedTracks[addon.key] as AddonTrack;

    if (installedTrack) {
      return installedTrack;
    }

    // Use the new category-based installation path
    const installDir = await AddonInstallationManager.getInstallationPath(addon);
    const install = this.getAddonInstall(installDir);

    if (!install) {
      return null;
    }

    const matchingTrack = addon.tracks.find((it) => it.url === install.source);

    if (!matchingTrack) {
      return null;
    }

    this.setCurrentlyInstalledTrack(addon, matchingTrack);
    this.setCurrentSelectedTrack(addon, matchingTrack);

    return matchingTrack;
  }

  private static lowestAvailableAbortControllerID(): number {
    for (let i = 0; i < this.abortControllers.length; i++) {
      if (
        !store
          .getState()
          .downloads.map((download) => download.abortControllerID)
          .includes(i)
      ) {
        return i;
      }
    }
    // If no available controller found, return the last index
    return this.abortControllers.length - 1;
  }
  private static async determineAddonInstallStatus(addon: Addon): Promise<InstallState> {
    console.log('[InstallManager](determineAddonInstallStatus) Checking install status');

    // Use the new category-based installation path
    const installDir = await AddonInstallationManager.getInstallationPath(addon);
    const addonInstalledTrack = await this.determineAddonInstalledTrack(addon);
    const addonSelectedTrack = this.getAddonSelectedTrack(addon);

    const installDirExists = await ipcFs.existsSync(installDir);
    if (!installDirExists) {
      console.log('[InstallManager](determineAddonInstallStatus) Is not installed');

      return { status: InstallStatus.NotInstalled };
    }

    console.log('[InstallManager](determineAddonInstallStatus) Checking for git install');

    const isGitInstall = await Directories.isGitInstall(installDir);
    if (isGitInstall) {
      console.log('[InstallManager](determineAddonInstallStatus) Is git install');

      return { status: InstallStatus.GitInstall };
    }

    // For CDN releases, skip update checking as it's not implemented
    if (addonSelectedTrack.releaseModel.type === 'CDN') {
      console.log('[InstallManager](determineAddonInstallStatus) CDN track detected, assuming up to date');

      if (addonSelectedTrack !== addonInstalledTrack && addonInstalledTrack) {
        return { status: InstallStatus.TrackSwitch };
      }

      return { status: InstallStatus.UpToDate };
    }

    try {
      const updateInfo = await new UpdateChecker().needsUpdate(addonSelectedTrack.url, installDir, {
        forceCacheBust: true,
      });

      console.log('[InstallManager](determineAddonInstallStatus) Update info', updateInfo);

      if (addonSelectedTrack !== addonInstalledTrack && addonInstalledTrack) {
        return { status: InstallStatus.TrackSwitch };
      }

      if (updateInfo.isFreshInstall) {
        return { status: InstallStatus.NotInstalled };
      }

      if (updateInfo.needsUpdate) {
        return { status: InstallStatus.NeedsUpdate };
      }

      return { status: InstallStatus.UpToDate };
    } catch (e) {
      console.error(e);
      return { status: InstallStatus.Unknown };
    }
  }

  public static async checkForUpdates(addon: Addon): Promise<void> {
    console.log('[InstallManager](checkForUpdates) Checking for updates for ' + addon.key);

    const state = store.getState();

    const addonInstallState = state.installStatus[addon.key] ?? { status: InstallStatus.Unknown };

    if (
      InstallStatusCategories.installing.includes(addonInstallState.status) ||
      addonInstallState.status === InstallStatus.Unknown
    ) {
      return;
    }

    for (const track of addon.tracks) {
      // Skip update checking for CDN releases as it's not implemented
      if (track.releaseModel.type === 'CDN') {
        console.log(`[InstallManager](checkForUpdates) Skipping CDN update check for ${addon.key} track ${track.key}`);
        continue;
      }

      const installDir = await AddonInstallationManager.getInstallationPath(addon);
      const updateChecker = new UpdateChecker();
      const updateInfo = await updateChecker.needsUpdate(track.url, installDir, { forceCacheBust: true });

      let info: ReleaseInfo;
      info = await AddonData.latestVersionForTrack(addon, track);

      store.dispatch(setAddonAndTrackLatestReleaseInfo({ addonKey: addon.key, trackKey: track.key, info }));

      if (track.key === state.installedTracks[addon.key]?.key && updateInfo.needsUpdate) {
        store.dispatch(setInstallStatus({ addonKey: addon.key, installState: { status: InstallStatus.NeedsUpdate } }));
      }
    }
  }

  private static setCurrentInstallState(addon: Addon, installState: InstallState): void {
    store.dispatch(setInstallStatus({ addonKey: addon.key, installState }));
  }

  private static setCurrentSelectedTrack(addon: Addon, track: AddonTrack): void {
    store.dispatch(setSelectedTrack({ addonKey: addon.key, track: track }));
  }

  private static setCurrentlyInstalledTrack(addon: Addon, track: AddonTrack): void {
    store.dispatch(setInstalledTrack({ addonKey: addon.key, installedTrack: track }));
  }

  private static notifyDownload(addon: Addon, successful: boolean): void {
    console.log('[InstallManager](notifyDownload) Requesting notification');

    Notification.requestPermission()
      .then(() => {
        console.log('InstallManager](notifyDownload) Showing notification');

        if (successful) {
          new Notification(`${addon.name} download complete!`, {
            icon: join(process.resourcesPath, 'extraResources', 'icon.ico'),
            body: 'Take to the skies!',
          });
        } else {
          new Notification('Download failed!', {
            icon: join(process.resourcesPath, 'extraResources', 'icon.ico'),
            body: 'Oops, something went wrong',
          });
        }
      })
      .catch((e) => console.log(e));
  }
}
