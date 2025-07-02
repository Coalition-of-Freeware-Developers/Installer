// Stub for fs in renderer process
// This module should only be used in the main process
// All file system operations should go through IPC

export const existsSync = (path?: string) => {
  console.error('fs.existsSync was called in renderer process with path:', path);
  console.error('Stack trace:', new Error().stack);
  // Return false instead of throwing to prevent app crashes during development
  return false;
};

export const readFileSync = (path?: string) => {
  console.error('fs.readFileSync was called in renderer process with path:', path);
  console.error('Stack trace:', new Error().stack);
  throw new Error('fs should not be used in renderer process. Use IPC instead.');
};

export const writeFileSync = (path?: string) => {
  console.error('fs.writeFileSync was called in renderer process with path:', path);
  console.error('Stack trace:', new Error().stack);
  throw new Error('fs should not be used in renderer process. Use IPC instead.');
};

export const mkdirSync = (path?: string) => {
  console.error('fs.mkdirSync was called in renderer process with path:', path);
  console.error('Stack trace:', new Error().stack);
  throw new Error('fs should not be used in renderer process. Use IPC instead.');
};

export const rmSync = (path?: string) => {
  console.error('fs.rmSync was called in renderer process with path:', path);
  console.error('Stack trace:', new Error().stack);
  throw new Error('fs should not be used in renderer process. Use IPC instead.');
};

export const readlinkSync = (path?: string) => {
  console.error('fs.readlinkSync was called in renderer process with path:', path);
  console.error('Stack trace:', new Error().stack);
  throw new Error('fs should not be used in renderer process. Use IPC instead.');
};

export const readdirSync = (path?: string) => {
  console.error('fs.readdirSync was called in renderer process with path:', path);
  console.error('Stack trace:', new Error().stack);
  throw new Error('fs should not be used in renderer process. Use IPC instead.');
};

export const promises = {
  readdir: () => Promise.reject(new Error('fs should not be used in renderer process. Use IPC instead.')),
  readlink: () => Promise.reject(new Error('fs should not be used in renderer process. Use IPC instead.')),
  rm: () => Promise.reject(new Error('fs should not be used in renderer process. Use IPC instead.')),
};

export default {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  readlinkSync,
  readdirSync,
  promises,
};
