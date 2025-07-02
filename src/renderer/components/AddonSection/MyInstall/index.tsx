import React, { FC, useState, useEffect, useMemo } from 'react';
import {
  Addon,
  DirectoryDefinition,
  ExternalLink,
  NamedDirectoryDefinition,
} from 'renderer/utils/InstallerConfiguration';
import { BoxArrowRight, Folder } from 'react-bootstrap-icons';
import { Directories } from 'renderer/utils/Directories';
import { useAppSelector } from 'renderer/redux/store';
import { InstallStatusCategories } from 'renderer/components/AddonSection/Enums';
import ipcFs from 'renderer/utils/IPCFileSystem';

export interface MyInstallProps {
  addon: Addon;
}

export const MyInstall: FC<MyInstallProps> = ({ addon }) => {
  const installStates = useAppSelector((state) => state.installStatus);
  const [directoryExistence, setDirectoryExistence] = useState<Record<string, boolean>>({});

  const links: ExternalLink[] = [...(addon.myInstallPage?.links ?? [])];

  const directories: NamedDirectoryDefinition[] = useMemo(
    () => [
      {
        location: {
          in: 'community',
          path: addon.targetDirectory,
        },
        title: 'Package Files',
      },
      ...(addon.myInstallPage?.directories ?? []),
    ],
    [addon.targetDirectory, addon.myInstallPage?.directories],
  );

  useEffect(() => {
    const fulldirectoryLocal = async (def: DirectoryDefinition): Promise<string> => {
      switch (def.location.in) {
        case 'community':
          return await Directories.inInstallLocation(def.location.path);
        case 'package':
          return await Directories.inInstallPackage(addon, def.location.path);
        case 'packageCache':
          return await Directories.inInstallLocation(def.location.path); // Fallback
        case 'documents':
          return await Directories.inInstallLocation(def.location.path); // Fallback
        default:
          return '';
      }
    };

    const checkDirectoriesExistence = async () => {
      const existence: Record<string, boolean> = {};

      for (const dir of directories) {
        try {
          const fullPath = await fulldirectoryLocal(dir);
          existence[dir.title] = await ipcFs.existsSync(fullPath);
        } catch (error) {
          console.error('Error checking directory existence:', error);
          existence[dir.title] = false;
        }
      }

      setDirectoryExistence(existence);
    };

    checkDirectoriesExistence();
  }, [addon, directories]);

  const handleClickLink = (link: ExternalLink) => {
    const parsed = new URL(link.url);

    if (parsed.protocol.match(/https?/)) {
      window.electronAPI?.remote.shellOpenExternal(link.url);
    }
  };

  const fulldirectory = async (def: DirectoryDefinition): Promise<string> => {
    switch (def.location.in) {
      case 'community':
        return await Directories.inInstallLocation(def.location.path);
      case 'package':
        return await Directories.inInstallPackage(addon, def.location.path);
      case 'packageCache':
        return await Directories.inInstallLocation(def.location.path); // Fallback to install location
      case 'documents':
        return await Directories.inInstallLocation(def.location.path); // Fallback to install location
      default:
        return '';
    }
  };

  const handleClickDirectory = async (def: DirectoryDefinition) => {
    const path = await fulldirectory(def);
    window.electronAPI?.openPath(path);
  };

  const directoriesDisabled = !InstallStatusCategories.installed.includes(installStates[addon.key]?.status);

  return (
    <div className="mt-5 flex size-full flex-row gap-x-8 text-quasi-white">
      {links.length > 0 && (
        <div>
          <h3 className="font-bold text-white">Links</h3>

          <div className="flex items-center gap-x-3">
            {links.map((it) => (
              <button
                key={it.title}
                className="flex items-center gap-x-5 rounded-md border-2 border-navy-light bg-navy-light px-7 py-4 text-3xl transition-colors duration-100 hover:border-cyan hover:bg-transparent"
                onClick={() => handleClickLink(it)}
              >
                <BoxArrowRight size={24} />

                {it.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {directories.length > 0 && (
        <div>
          <h3 className="font-bold text-white">Directories</h3>

          <div className="flex items-center gap-x-3">
            {directories.map((it) => (
              <button
                key={it.title}
                className={`flex items-center gap-x-5 rounded-md border-2 border-navy-light bg-navy-light px-7 py-4 text-3xl transition-colors duration-100 hover:border-cyan hover:bg-transparent ${directoriesDisabled || !directoryExistence[it.title] ? 'pointer-events-none opacity-60' : ''}`}
                onClick={() => handleClickDirectory(it)}
              >
                <Folder size={24} />

                {it.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
