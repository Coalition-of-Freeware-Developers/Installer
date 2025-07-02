const console = globalThis.console;

export enum FreeDiskSpaceStatus {
  Unknown,
  NotLimited,
  LimitedByDestination,
  LimitedByTemporary,
  LimitedByBoth,
}

export interface FreeDiskSpaceInfo {
  freeSpaceInDest: number;
  freeSpaceInTemp: number;
  status: FreeDiskSpaceStatus;
}

export class FreeDiskSpace {
  static async analyse(requiredSpace: number): Promise<FreeDiskSpaceInfo> {
    if (!Number.isFinite(requiredSpace)) {
      return {
        freeSpaceInTemp: -1,
        freeSpaceInDest: -1,
        status: FreeDiskSpaceStatus.Unknown,
      };
    }

    // TODO: Implement disk space checking through IPC
    // For now, return unknown status as disk space checking requires system-level access
    console.warn('Disk space analysis not available in renderer process - requires IPC implementation');

    return {
      freeSpaceInTemp: -1,
      freeSpaceInDest: -1,
      status: FreeDiskSpaceStatus.Unknown,
    };

    // Original implementation that would need IPC support:
    // let resolvedDestDir = Directories.installLocation();
    // let resolvedTempDir = Directories.tempLocation();
    //
    // try {
    //   resolvedDestDir = await fs.promises.readlink(resolvedDestDir);
    // } catch (e) {
    //   // noop - it's probably not a link
    // }
    //
    // try {
    //   resolvedTempDir = await fs.promises.readlink(resolvedTempDir);
    // } catch (e) {
    //   // noop - it's probably not a link
    // }
    //
    // let freeDestDirSpace = NaN;
    // try {
    //   freeDestDirSpace = (await checkDiskSpace(resolvedDestDir)).free;
    // } catch (e) {
    //   // noop - user probably does not have `wmic` on their system
    // }
    //
    // let freeTempDirSpace = NaN;
    // try {
    //   freeTempDirSpace = (await checkDiskSpace(resolvedTempDir)).free;
    // } catch (e) {
    //   // noop - user probably does not have `wmic` on their system
    // }
    //
    // if (!Number.isFinite(freeDestDirSpace) || !Number.isFinite(freeTempDirSpace)) {
    //   return {
    //     freeSpaceInTemp: -1,
    //     freeSpaceInDest: -1,
    //     status: FreeDiskSpaceStatus.Unknown,
    //   };
    // }
    //
    // let status = FreeDiskSpaceStatus.NotLimited;
    // if (requiredSpace >= freeDestDirSpace && requiredSpace >= freeTempDirSpace) {
    //   status = FreeDiskSpaceStatus.LimitedByBoth;
    // } else if (requiredSpace >= freeDestDirSpace) {
    //   status = FreeDiskSpaceStatus.LimitedByDestination;
    // } else if (requiredSpace >= freeTempDirSpace) {
    //   status = FreeDiskSpaceStatus.LimitedByTemporary;
    // }
    //
    // return {
    //   freeSpaceInDest: freeDestDirSpace,
    //   freeSpaceInTemp: freeTempDirSpace,
    //   status,
    // };
  }
}
