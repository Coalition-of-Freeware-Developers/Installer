// IPC-based filesystem operations for renderer process
// This module provides filesystem operations through IPC instead of direct fs access

const console = globalThis.console;

interface FileSystemAPI {
  existsSync: (path: string) => Promise<boolean>;
  readdirSync: (path: string, options?: unknown) => Promise<string[] | unknown[]>;
  rmSync: (
    path: string,
    options?: { recursive?: boolean; force?: boolean },
  ) => Promise<{ success: boolean; error?: string }>;
  removeAllTemp: () => Promise<{ success: boolean; error?: string }>;
}

class IPCFileSystem implements FileSystemAPI {
  private get electronAPI() {
    const api = globalThis.window?.electronAPI;
    if (!api?.fs) {
      throw new Error('electronAPI.fs is not available. Make sure preload script is properly loaded.');
    }
    return api.fs;
  }

  private async retryOperation<T>(operation: () => Promise<T>, retries = 3, delay = 100): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === retries - 1) {
          throw error;
        }
        console.warn(
          `[IPCFileSystem] Operation failed (attempt ${i + 1}/${retries}), retrying in ${delay}ms...`,
          error,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
    throw new Error('Should not reach here');
  }

  async existsSync(path: string): Promise<boolean> {
    try {
      console.log(`[IPCFileSystem] Checking if path exists: "${path}"`);
      const result = await this.retryOperation(() => this.electronAPI.existsSync(path));
      console.log(`[IPCFileSystem] Path exists result: ${result}`);
      return result;
    } catch (error) {
      console.error('[IPCFileSystem] Error checking if path exists:', error);
      return false;
    }
  }

  async readdirSync(path: string, options?: unknown): Promise<string[] | unknown[]> {
    try {
      console.log(`[IPCFileSystem] Reading directory: "${path}"`);
      const result = await this.retryOperation(() => this.electronAPI.readdirSync(path, options));
      console.log(
        `[IPCFileSystem] Directory read successfully, ${Array.isArray(result) ? result.length : 0} items found`,
      );
      return result;
    } catch (error) {
      console.error('[IPCFileSystem] Error reading directory:', error);
      return [];
    }
  }

  async rmSync(
    path: string,
    options?: { recursive?: boolean; force?: boolean },
  ): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.electronAPI.rmSync(path, options);
    } catch (error) {
      console.error('Error removing path:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  async removeAllTemp(): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.electronAPI.removeAllTemp();
    } catch (error) {
      console.error('Error removing temp directories:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Legacy sync methods that throw errors to guide migration
  existsSyncLegacy(): never {
    throw new Error('fs.existsSync should not be used in renderer process. Use IPCFileSystem.existsSync instead.');
  }

  readdirSyncLegacy(): never {
    throw new Error('fs.readdirSync should not be used in renderer process. Use IPCFileSystem.readdirSync instead.');
  }

  rmSyncLegacy(): never {
    throw new Error('fs.rmSync should not be used in renderer process. Use IPCFileSystem.rmSync instead.');
  }
}

// Create singleton instance
const ipcFs = new IPCFileSystem();

// Export both the instance and the class for different use cases
export { ipcFs, IPCFileSystem };
export default ipcFs;
