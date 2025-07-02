// Stub for check-disk-space in renderer process
// This module should only be used in the main process
// All disk space checks should go through IPC

export default function checkDiskSpace() {
  throw new Error('check-disk-space should not be used in renderer process. Use IPC instead.');
}
