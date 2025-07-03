// Import polyfills FIRST before any other imports
import './polyfills';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from 'renderer/components/App';
import { Configuration, InstallerConfiguration } from 'renderer/utils/InstallerConfiguration';
import { Directories } from 'renderer/utils/Directories';
import { MemoryRouter } from 'react-router-dom';
import { store } from 'renderer/redux/store';
import { setConfiguration } from './redux/features/configuration';
import { GitVersions } from 'renderer/utils/AddonData';
import { addReleases } from 'renderer/redux/features/releaseNotes';
import { ModalProvider } from 'renderer/components/Modal';

import 'simplebar-react/dist/simplebar.min.css';
import './index.scss';
import { Button, ButtonType } from 'renderer/components/Button';

const console = globalThis.console;
const window = globalThis.window as typeof globalThis & { electronAPI?: unknown; electronStore?: unknown };
const document = globalThis.document;

console.log('Renderer script is starting...');
console.log('electronAPI available:', typeof window.electronAPI !== 'undefined');
console.log('electronStore available:', typeof window.electronStore !== 'undefined');
console.log('React available:', typeof React !== 'undefined');
console.log('createRoot available:', typeof createRoot !== 'undefined');
console.log('Document ready state:', document.readyState);
console.log('Root element exists:', !!document.getElementById('root'));

// Add error handler for unhandled errors
window.addEventListener('error', (event) => {
  console.error('Unhandled error in renderer:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection in renderer:', event.reason);
});

// Obtain configuration and use it
InstallerConfiguration.obtain()
  .then((config: Configuration) => {
    store.dispatch(setConfiguration({ configuration: config }));

    for (const publisher of config.publishers) {
      for (const addon of publisher.addons) {
        if (addon.repoOwner && addon.repoName) {
          GitVersions.getReleases(addon.repoOwner, addon.repoName, false, 0, 5)
            .then((res) => {
              const content = res.map((release) => ({
                name: release.name,
                publishedAt: release.publishedAt.getTime(),
                htmlUrl: release.htmlUrl,
                body: release.body,
              }));

              if (content.length) {
                store.dispatch(addReleases({ key: addon.key, releases: content }));
              } else {
                store.dispatch(addReleases({ key: addon.key, releases: [] }));
              }
            })
            .catch((error) => {
              console.error('Error fetching releases for addon:', addon.key, error);
              store.dispatch(addReleases({ key: addon.key, releases: [] }));
            });
        } else {
          store.dispatch(addReleases({ key: addon.key, releases: [] }));
        }
      }
    }

    console.log('Using this configuration:', config);

    // Clean up temp directories asynchronously - don't block the UI
    Directories.removeAllTemp().catch((error) => {
      console.error('Failed to clean up temp directories:', error);
    });

    const rootElement = document.getElementById('root');
    if (rootElement) {
      const root = createRoot(rootElement);
      root.render(
        <Provider store={store}>
          <MemoryRouter>
            <ModalProvider>
              <App />
            </ModalProvider>
          </MemoryRouter>
        </Provider>,
      );
    }
  })
  .catch((error: Error) => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      const root = createRoot(rootElement);
      root.render(
        <div className="error-container">
          <span className="error-title">Something went very wrong.</span>
          <span className="error-description">
            We could not configure your installer. Please seek support on the Discord #support channel or on GitHub and
            provide a screenshot of the following information:
          </span>
          <pre className="error-stack">{error.stack}</pre>

          <Button
            type={ButtonType.Neutral}
            onClick={() => {
              const api = window.electronAPI as { closeWindow?: () => void } | undefined;
              api?.closeWindow?.();
            }}
          >
            Close the installer
          </Button>
        </div>,
      );
    }
  });
