import net from 'net';

export class XPlane {
  static async isRunning(): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = net.connect(49000); // X-Plane 12 default port

      socket.on('connect', () => {
        resolve(true);
        socket.destroy();
      });
      socket.on('error', () => {
        resolve(false);
        socket.destroy();
      });
    });
  }
}
