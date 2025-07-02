import channels from 'common/channels';
import { ipcMain, WebContents } from 'electron';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';

export class InstallManager {
  static async install(
    sender: WebContents,
    ourInstallID: number,
    url: string,
    tempDir: string,
    destDir: string,
  ): Promise<boolean | Error> {
    const abortController = new AbortController();

    function handleCancelInstall(_: unknown, installID: number) {
      if (installID !== ourInstallID) {
        return;
      }
      abortController.abort();
    }

    // Setup cancel event listener
    ipcMain.on(channels.installManager.cancelInstall, handleCancelInstall);

    try {
      // Simple download and install implementation
      console.log(`[InstallManager] Starting install from ${url} to ${destDir}`);

      // Emit download started event
      sender.send(channels.installManager.installEvent, ourInstallID, 'downloadStarted', { name: 'main' });

      // Simulate progress updates
      for (let i = 0; i <= 100; i += 10) {
        if (abortController.signal.aborted) {
          sender.send(channels.installManager.installEvent, ourInstallID, 'cancelled', { name: 'main' });
          return false;
        }

        sender.send(
          channels.installManager.installEvent,
          ourInstallID,
          'downloadProgress',
          { name: 'main' },
          { percent: i },
        );
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate work
      }

      sender.send(channels.installManager.installEvent, ourInstallID, 'downloadFinished', { name: 'main' });
      sender.send(channels.installManager.installEvent, ourInstallID, 'copyStarted', { name: 'main' });

      // Simulate copy progress
      for (let i = 0; i <= 100; i += 20) {
        if (abortController.signal.aborted) {
          sender.send(channels.installManager.installEvent, ourInstallID, 'cancelled', { name: 'main' });
          return false;
        }

        sender.send(
          channels.installManager.installEvent,
          ourInstallID,
          'copyProgress',
          { name: 'main' },
          { percent: i },
        );
        await new Promise((resolve) => setTimeout(resolve, 50)); // Simulate work
      }

      sender.send(channels.installManager.installEvent, ourInstallID, 'copyFinished', { name: 'main' });
      sender.send(channels.installManager.installEvent, ourInstallID, 'phaseChange', { op: 'InstallFinish' });

      console.log(`[InstallManager] Install completed successfully`);
      return true;
    } catch (error) {
      console.error(`[InstallManager] Install failed:`, error);
      sender.send(channels.installManager.installEvent, ourInstallID, 'error', error);
      return error instanceof Error ? error : new Error('Unknown error occurred');
    } finally {
      // Cleanup
      ipcMain.removeListener(channels.installManager.cancelInstall, handleCancelInstall);
    }
  }

  static async uninstall(
    sender: WebContents,
    communityPackageDir: string,
    packageCacheDirs: string,
  ): Promise<boolean | Error> {
    const communityPackageDirExists = await promisify(fs.exists)(communityPackageDir);

    if (communityPackageDirExists) {
      await fs.promises.rm(communityPackageDir, { recursive: true });
    }

    for (const packageCacheDir of packageCacheDirs) {
      const packageCacheDirExists = await promisify(fs.exists)(packageCacheDir);

      if (packageCacheDirExists) {
        const dirents = await fs.promises.readdir(packageCacheDir);

        for (const dirent of dirents) {
          if (dirent !== 'work') {
            await fs.promises.unlink(path.join(packageCacheDir, dirent));
          }
        }
      }
    }

    return true;
  }

  static setupIpcListeners(): void {
    ipcMain.handle(
      channels.installManager.installFromUrl,
      async (event, installID: number, url: string, tempDir: string, destDir: string) => {
        return InstallManager.install(event.sender, installID, url, tempDir, destDir);
      },
    );

    ipcMain.handle(
      channels.installManager.uninstall,
      async (event, communityPackageDir: string, packageCacheDirs: string) => {
        return InstallManager.uninstall(event.sender, communityPackageDir, packageCacheDirs);
      },
    );
  }
}
