import { defineConfig } from 'electron-vite';
import path from 'path';
import ViteYaml from '@modyfi/vite-plugin-yaml';
// import renderer from 'vite-plugin-electron-renderer'; // Temporarily commented out due to __dirname conflict
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// Use process.cwd() instead of __dirname to avoid conflicts
const rootDir = process.cwd();

const baseOptions = {
  resolve: {
    alias: {
      // TODO not need this (vite)
      simplebar: path.resolve(rootDir, './node_modules/simplebar-react/'),
      common: path.resolve(rootDir, './src/common/'),
      renderer: path.resolve(rootDir, './src/renderer/'),
      main: path.resolve(rootDir, './src/main/'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler', // Use the modern Sass API
        silenceDeprecations: ['legacy-js-api'],
        quietDeps: true, // Suppress deprecation warnings from dependencies
      },
      sass: {
        api: 'modern-compiler', // Use the modern Sass API
        silenceDeprecations: ['legacy-js-api'],
        quietDeps: true, // Suppress deprecation warnings from dependencies
      },
    },
  },
};

export default defineConfig({
  main: {
    ...baseOptions,
    build: {
      rollupOptions: {
        external: ['electron-store', 'electron-updater'],
      },
    },
  },
  preload: {
    ...baseOptions,
    build: {
      rollupOptions: {
        input: path.resolve(rootDir, 'src/main/preload.ts'),
      },
    },
  },
  renderer: {
    ...baseOptions,
    define: {
      global: 'globalThis',
      'process.env': 'process.env',
      __dirname: 'undefined',
      __filename: 'undefined',
    },
    plugins: [
      ViteYaml(),
      nodePolyfills({
        include: ['process', 'buffer'],
        globals: {
          process: true,
          Buffer: true,
        },
      }),
      // renderer(), // Temporarily commented out due to __dirname conflict
    ],
    resolve: {
      alias: {
        ...baseOptions.resolve.alias,
        // Alias Node.js modules to stubs for renderer process
        fs: path.resolve(rootDir, './src/renderer/stubs/fs.ts'),
        path: path.resolve(rootDir, './src/renderer/stubs/path.ts'),
        net: path.resolve(rootDir, './src/renderer/stubs/net.ts'),
        'check-disk-space': path.resolve(rootDir, './src/renderer/stubs/check-disk-space.ts'),
        electron: path.resolve(rootDir, './src/renderer/stubs/electron.ts'),
      },
    },
    build: {
      rollupOptions: {
        external: [],
        output: {
          globals: {
            process: 'process',
            Buffer: 'Buffer',
          },
        },
      },
    },
  },
});
