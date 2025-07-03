import net from 'renderer/stubs/net';

export class XPlane {
  static async isRunning(): Promise<boolean> {
    try {
      // Use IPC-based TCP connection check for X-Plane 12 default port
      const result = await net.connect(49000);
      return result;
    } catch (error) {
      console.error('Error checking if X-Plane is running:', error);
      return false;
    }
  }
}
