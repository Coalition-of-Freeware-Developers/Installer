// Install-related types and interfaces
// Types and utilities for installation functionality

export interface UpdateInfo {
  requiredDiskSpace: number;
  downloadSize: number;
  isFreshInstall: boolean;
  updatedModules: Array<{ name: string }>;
  addedModules: Array<{ name: string }>;
  baseChanged: boolean;
  needsUpdate: boolean;
  distributionManifest: {
    version: string;
  };
}

export interface InstallManifest {
  name: string;
  version: string;
  track: string;
  installDate: string;
  source: string;
}

export enum InstallOperation {
  InstallFinish = 'InstallFinish',
}

export enum InstallErrorCode {
  PermissionsError = 'PermissionsError',
  NoSpaceOnDevice = 'NoSpaceOnDevice',
  NetworkError = 'NetworkError',
  ResourcesBusy = 'ResourcesBusy',
  MaxModuleRetries = 'MaxModuleRetries',
  FileNotFound = 'FileNotFound',
  DirectoryNotEmpty = 'DirectoryNotEmpty',
  NotADirectory = 'NotADirectory',
  ModuleJsonInvalid = 'ModuleJsonInvalid',
  ModuleCrcMismatch = 'ModuleCrcMismatch',
  UserAborted = 'UserAborted',
  CorruptedZipFile = 'CorruptedZipFile',
  Null = 'Null',
  Unknown = 'Unknown',
}

export class InstallError extends Error {
  public code: InstallErrorCode;

  constructor(message: string, code: InstallErrorCode) {
    super(message);
    this.code = code;
    this.name = 'InstallError';
  }

  static parseFromMessage(message: string): InstallError {
    if (message.includes('permission')) {
      return new InstallError(message, InstallErrorCode.PermissionsError);
    }
    if (message.includes('space')) {
      return new InstallError(message, InstallErrorCode.NoSpaceOnDevice);
    }
    if (message.includes('network')) {
      return new InstallError(message, InstallErrorCode.NetworkError);
    }
    return new InstallError(message, InstallErrorCode.Unknown);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static isInstallError(error: any): error is InstallError {
    return error instanceof InstallError;
  }

  static createFromError(error: Error): InstallError {
    if (error instanceof InstallError) {
      return error;
    }
    return new InstallError(error.message, InstallErrorCode.Unknown);
  }
}

// Simplified install functionality
export class UpdateChecker {
  async needsUpdate(_url: string, _destDir: string, _options?: { forceCacheBust?: boolean }): Promise<UpdateInfo> {
    console.log('[UpdateChecker] Checking for updates...');

    // Simplified implementation - assumes update is needed for CDN releases
    return {
      requiredDiskSpace: 1024 * 1024 * 100, // 100MB default
      downloadSize: 1024 * 1024 * 50, // 50MB default
      isFreshInstall: true,
      updatedModules: [],
      addedModules: [{ name: 'main' }],
      baseChanged: false,
      needsUpdate: false, // For CDN, we'll handle this differently
      distributionManifest: {
        version: '1.0.0',
      },
    };
  }
}

export function getCurrentInstall(directory: string): InstallManifest | null {
  console.log('[getCurrentInstall] Checking install in directory:', directory);
  // Simplified implementation - returns null (no install found)
  return null;
}
