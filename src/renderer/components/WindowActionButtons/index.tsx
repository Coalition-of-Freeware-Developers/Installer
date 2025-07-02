import React from 'react';
import { WindowsControl } from 'react-windows-controls';
import { Directories } from 'renderer/utils/Directories';
import { store } from 'renderer/redux/store';
import { InstallStatusCategories } from 'renderer/components/AddonSection/Enums';
import { AlertModal, useModals } from 'renderer/components/Modal';
import { ExclamationCircle } from 'react-bootstrap-icons';

const console = globalThis.console;
const window = globalThis.window;

export type ButtonProps = { id?: string; className?: string; onClick?: () => void; isClose?: boolean };

export const Button: React.FC<ButtonProps> = ({ id, className, onClick, isClose, children }) => {
  return (
    <button
      className={`flex h-full w-14 flex-row items-center justify-center text-gray-200 ${isClose ? 'hover:bg-red-500' : 'hover:bg-gray-700'} ${className}`}
      onClick={onClick ?? (() => {})}
      id={id}
    >
      {children}
    </button>
  );
};

export const WindowButtons: React.FC = () => {
  const { showModal } = useModals();

  const openGithub = () =>
    window.electronAPI?.remote.shellOpenExternal('https://github.com/flybywiresim/a32nx/issues/new/choose');

  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow();
  };

  const handleMaximize = () => {
    window.electronAPI?.maximizeWindow();
  };

  const handleClose = () => {
    const installStatuses = store.getState().installStatus;

    const anyInstalling = Object.values(installStatuses).some((it) =>
      InstallStatusCategories.installing.includes(it.status),
    );

    if (anyInstalling) {
      showModal(
        <AlertModal
          title="Hold on"
          bodyText="You currently have addons being installed or updated. Please finish or cancel those before closing the app."
          acknowledgeText="OK"
        />,
      );
    } else {
      // Clean up temp directories asynchronously, then close
      Directories.removeAllTemp()
        .then(() => {
          window.electronAPI?.closeWindow();
        })
        .catch((error) => {
          console.error('Failed to clean up temp directories:', error);
          // Still close the window even if cleanup fails
          window.electronAPI?.closeWindow();
        });
    }
  };

  return (
    <div className="ml-auto flex h-12 flex-row">
      <Button onClick={openGithub}>
        <ExclamationCircle size={16} />
      </Button>
      <WindowsControl minimize whiteIcon onClick={handleMinimize} />
      <WindowsControl maximize whiteIcon onClick={handleMaximize} />
      <WindowsControl close whiteIcon onClick={handleClose} />
    </div>
  );
};
