// Stub for net in renderer process
// This module should only be used in the main process
// All network operations should go through IPC

export const connect = () => {
  throw new Error('net should not be used in renderer process. Use IPC instead.');
};

export default {
  connect,
};
