// Stub for net in renderer process
// This module provides IPC-based network functionality
// replacing direct Node.js net module usage

import channels from 'common/channels';

export const connect = (port: number, host: string = 'localhost'): Promise<boolean> => {
  // Use IPC to communicate with main process for TCP connections
  const api = (window as { electronAPI?: { invoke: (channel: string, ...args: unknown[]) => Promise<unknown> } })
    ?.electronAPI;
  if (!api) {
    console.error('electronAPI is not available. Make sure preload script is properly loaded.');
    return Promise.resolve(false);
  }

  return api
    .invoke(channels.net.tcpConnect, port, host)
    .then((result: unknown) => result as boolean)
    .catch((error: Error) => {
      console.error('Error in net.connect stub:', error);
      return false;
    });
};

// Stub to prevent accidental use of Node.js net module
export const createConnection = () => {
  throw new Error('net should not be used in renderer process. Use IPC instead.');
};

export const createServer = () => {
  throw new Error('net should not be used in renderer process. Use IPC instead.');
};

export const Server = class {
  constructor() {
    throw new Error('net should not be used in renderer process. Use IPC instead.');
  }
};

export const Socket = class {
  constructor() {
    throw new Error('net should not be used in renderer process. Use IPC instead.');
  }
};

export const isIP = () => {
  throw new Error('net should not be used in renderer process. Use IPC instead.');
};

export const isIPv4 = () => {
  throw new Error('net should not be used in renderer process. Use IPC instead.');
};

export const isIPv6 = () => {
  throw new Error('net should not be used in renderer process. Use IPC instead.');
};

export default {
  connect,
  createConnection,
  createServer,
  Server,
  Socket,
  isIP,
  isIPv4,
  isIPv6,
};
