import React, { FC, useState } from 'react';
import { AlertModal } from 'renderer/components/Modal/index';
import {
  Clipboard,
  ClipboardCheck,
  Ethernet,
  ExclamationTriangle,
  Hdd,
  ShieldExclamation,
  ShieldLock,
} from 'react-bootstrap-icons';
import { InstallError, InstallErrorCode } from 'renderer/types/install';

const DISCORD_SUPPORT_URL = 'https://discord.com/channels/738864299392630914/1065394439608078336';

export interface ErrorDialogProps {
  error: Error;
  onAcknowledge?: () => void;
}

export const ErrorDialog: FC<ErrorDialogProps> = ({ error, onAcknowledge }) => {
  const handleOpenDiscordSupport = async () => {
    await window.electronAPI?.remote.shellOpenExternal(DISCORD_SUPPORT_URL);
  };

  let installError;
  try {
    installError = InstallError.parseFromMessage(error.message);
  } catch {
    // noop
  }

  let errorVisualisation = null;
  if (installError) {
    switch (installError.code) {
      case InstallErrorCode.PermissionsError:
        errorVisualisation = (
          <ErrorVisualisationBox icon={<ShieldLock className="text-utility-red" size={36} />}>
            <span className="font-manrope text-4xl font-bold">Windows permissions error</span>
            <span className="text-2xl">Make sure the install folder has appropriate permissions.</span>
          </ErrorVisualisationBox>
        );
        break;
      case InstallErrorCode.NoSpaceOnDevice:
        errorVisualisation = (
          <ErrorVisualisationBox icon={<Hdd className="text-utility-red" size={36} />}>
            <span className="font-manrope text-4xl font-bold">No space left on device</span>
            <span className="text-2xl">Try to free up space in order to install this addon.</span>
          </ErrorVisualisationBox>
        );
        break;
      case InstallErrorCode.NetworkError:
        errorVisualisation = (
          <ErrorVisualisationBox icon={<Ethernet className="text-utility-red" size={36} />}>
            <span className="font-manrope text-4xl font-bold">Network error</span>
            <span className="text-2xl">Try again or use a VPN when connection problems persist.</span>
          </ErrorVisualisationBox>
        );
        break;
      case InstallErrorCode.ResourcesBusy: // fallthrough
      case InstallErrorCode.MaxModuleRetries: // fallthrough
      case InstallErrorCode.FileNotFound: // fallthrough
      case InstallErrorCode.DirectoryNotEmpty: // fallthrough
      case InstallErrorCode.NotADirectory: // fallthrough
      case InstallErrorCode.ModuleJsonInvalid: // fallthrough
      case InstallErrorCode.ModuleCrcMismatch: // fallthrough
      case InstallErrorCode.UserAborted: // fallthrough
      case InstallErrorCode.CorruptedZipFile:
      case InstallErrorCode.Null: // fallthrough
      case InstallErrorCode.Unknown: // Fallthrough
      default:
        errorVisualisation = (
          <ErrorVisualisationBox icon={<ShieldExclamation className="text-utility-red" size={36} />}>
            <span className="font-manrope text-4xl font-bold">An error has occurred!</span>
            <span className="text-2xl">Please contact FlyByWire support on Discord. See below. </span>
          </ErrorVisualisationBox>
        );
        break;
    }
  }

  // Error stack to clipboard handling
  const [showCopied, setShowCopied] = useState(false);
  const handleCopy = () => {
    window.electronAPI?.remote.clipboardWriteText(error.stack || '', 'clipboard');
    setShowCopied(true);
    setTimeout(() => {
      setShowCopied(false);
    }, 1_500);
  };

  return (
    <AlertModal
      title={
        <div className="mb-2.5 flex flex-col items-center gap-y-2.5 fill-current text-utility-red">
          <ExclamationTriangle size={64} />
          <h1 className="modal-title">Error while installing</h1>
        </div>
      }
      bodyText={
        <div className="flex flex-col gap-y-5">
          <div className="flex flex-col">
            {errorVisualisation}
            <pre className="h-96 overflow-scroll rounded-md bg-gray-800 p-2.5 text-2xl">{error.stack}</pre>
          </div>

          <div className="flex flex-col">
            <p>
              Obtain support on <a onClick={handleOpenDiscordSupport}>Discord</a> and provide the error message:
            </p>
            <div className="relative flex w-full items-center justify-center rounded-md border-2 border-gray-800 p-3.5 text-center text-3xl">
              {showCopied ? (
                <>
                  <span className="font-mono text-utility-green">Copied!</span>
                  <div className="absolute right-3">
                    <span className="flex items-center gap-x-2.5">
                      <ClipboardCheck
                        className="cursor-pointer transition-colors duration-200"
                        size={24}
                        onClick={handleCopy}
                      />
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <span className="font-mono">Copy error message to clipboard</span>
                  <div className="absolute right-3">
                    <span className="flex items-center gap-x-2.5">
                      <Clipboard
                        className="cursor-pointer text-gray-500 transition-colors duration-200 hover:text-gray-300"
                        size={24}
                        onClick={handleCopy}
                      />
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      }
      acknowledgeText="Dismiss"
      onAcknowledge={onAcknowledge}
    />
  );
};

interface ErrorVisualisationBoxProps {
  icon: JSX.Element;
}

const ErrorVisualisationBox: FC<ErrorVisualisationBoxProps> = ({ icon, children }) => (
  <div className="mb-5 flex w-full items-center gap-x-7 rounded-md border-2 border-utility-red px-7 py-3.5 text-utility-red">
    {icon}

    <div className="flex flex-col gap-y-2.5">{children}</div>
  </div>
);
