import { Directories } from 'renderer/utils/Directories';
import { Addon, AddonIncompatibleAddon } from 'renderer/utils/InstallerConfiguration';
import ipcFs from 'renderer/utils/IPCFileSystem';
import { join } from 'renderer/stubs/path';

export class IncompatibleAddOnsCheck {
  /**
   * Find incompatible add-ons
   * This iterates through the first level of folders of the X-Plane 12 Aircraft folder looking for the acf
   * file or other identifying files. It compares the aircraft info with the configured incompatible add-ons (data.ts) and if it
   * finds one or more matches, it will issue a warning.
   */
  static async checkIncompatibleAddOns(addon: Addon): Promise<AddonIncompatibleAddon[]> {
    console.log('Searching incompatible add-ons');

    const incompatibleAddons: AddonIncompatibleAddon[] = [];
    const aircraftDir = await Directories.aircraftLocation();

    try {
      const addonFolders = (await ipcFs.readdirSync(aircraftDir)) as string[];

      for (const entry of addonFolders) {
        const filePath = join(aircraftDir, entry);
        const pathExists = await ipcFs.existsSync(filePath);

        if (pathExists) {
          try {
            const dirEntries = (await ipcFs.readdirSync(filePath)) as string[];
            const acfFiles = dirEntries.filter((file: string) => file.endsWith('.acf'));

            if (acfFiles.length > 0) {
              // For X-Plane, we'll check based on folder name and acf file presence
              // Since X-Plane doesn't have manifest.json files like MSFS
              for (const item of addon.incompatibleAddons) {
                const folderMatches = !item.title || entry.toLowerCase().includes(item.title.toLowerCase());

                if (folderMatches) {
                  // Also write this to the log as this info might be useful for support.
                  console.log(`Incompatible Add-On found: ${entry}: ${item.description}`);

                  incompatibleAddons.push({
                    title: item.title,
                    creator: item.creator,
                    packageVersion: item.packageVersion,
                    folder: entry,
                    description: item.description,
                  });
                }
              }
            }
          } catch (e) {
            console.warn(`Failed to check aircraft folder ${filePath}:`, (e as Error).message);
          }
        }
      }
    } catch (e) {
      console.error('Error searching incompatible add-ons in %s: %s', aircraftDir, e);
    }

    if (incompatibleAddons.length > 0) {
      console.log('Incompatible add-ons found');
    } else {
      console.log('No incompatible add-ons found');
    }

    return incompatibleAddons;
  }
}
