import React, { useEffect, useState } from 'react';
import SimpleBar from 'simplebar-react';
import { Logo } from 'renderer/components/Logo';
import { SettingsSection } from 'renderer/components/SettingsSection';
import { DebugSection } from 'renderer/components/DebugSection';
import { InstallerUpdate } from 'renderer/components/InstallerUpdate';
import { WindowButtons } from 'renderer/components/WindowActionButtons';
import { Addon } from 'renderer/utils/InstallerConfiguration';
import { ErrorModal } from '../ErrorModal';
import { NavBar, NavBarPublisher } from 'renderer/components/App/NavBar';
import { Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom';
import { useAppSelector } from 'renderer/redux/store';
import settings from 'renderer/rendererSettings';
import './index.css';
import { ModalContainer } from '../Modal';
import { PublisherSection } from 'renderer/components/PublisherSection';
import * as packageInfo from '../../../../package.json';
import { InstallManager } from 'renderer/utils/InstallManager';
import { AutoDetection } from 'renderer/utils/AutoDetection';

const window = globalThis.window as { electronAPI?: { checkForInstallerUpdate?: () => void } };

const App = () => {
  const history = useHistory();
  const location = useLocation();

  const configuration = useAppSelector((state) => state.configuration);

  const [addons] = useState<Addon[]>(
    configuration.publishers.reduce((arr, curr) => {
      arr.push(...curr.addons);
      return arr;
    }, []),
  );

  useEffect(() => {
    let isMounted = true;
    let cleanupUnlisten: (() => void) | undefined;

    const initializeApp = async (): Promise<void> => {
      // Run X-Plane auto-detection on startup
      console.log('[App] Running X-Plane auto-detection on startup');
      try {
        const shouldSkip = await AutoDetection.shouldSkipDetection();
        if (!shouldSkip) {
          const detection = await AutoDetection.detectXPlaneOnStartup();
          if (detection.detected && detection.path) {
            console.log(`[App] Auto-detected X-Plane 12 via ${detection.method}: ${detection.path}`);
          }
        }
      } catch (error) {
        console.warn('[App] X-Plane auto-detection failed:', error);
      }

      for (const addon of addons) {
        if (!isMounted) return;
        await InstallManager.refreshAddonInstallState(addon);

        // Skip update checking for CDN addons as it's not implemented
        const hasCDNTracks = addon.tracks.some((track) => track.releaseModel.type === 'CDN');
        if (!hasCDNTracks) {
          if (!isMounted) return;
          await InstallManager.checkForUpdates(addon);
        }
      }

      if (!isMounted) return;
      const lastShownSection = await settings.get('cache.main.lastShownSection');
      if (lastShownSection && isMounted) {
        history.push(lastShownSection as string);
      }

      // Let's listen for a route change and set the last shown section to the incoming route pathname
      cleanupUnlisten = history.listen((location) => {
        settings.set('cache.main.lastShownSection', location.pathname);
      });
    };

    void initializeApp();

    return () => {
      isMounted = false;
      cleanupUnlisten?.();
    };
  }, [addons, history]);

  useEffect(() => {
    const updateCheck = globalThis.setInterval(
      () => {
        window.electronAPI?.checkForInstallerUpdate?.();

        for (const addon of addons) {
          // Skip update checking for CDN addons as it's not implemented
          const hasCDNTracks = addon.tracks.some((track) => track.releaseModel.type === 'CDN');
          if (!hasCDNTracks) {
            void InstallManager.checkForUpdates(addon);
          }
        }
      },
      5 * 60 * 1000,
    );

    return () => globalThis.clearInterval(updateCheck);
  }, [addons]);

  const [configUrlValue, setConfigUrlValue] = useState<string>('');

  useEffect(() => {
    settings.get('mainSettings.configDownloadUrl').then((url) => {
      setConfigUrlValue((url as string) || '');
    });
  }, []);

  const isDevelopmentConfigURL = () => {
    const productionURL = packageInfo.configUrls.production;
    // Protection against accidental screenshots of confidential config urls
    // Limited to flybywire config url to prevent 3rd party urls to be hidden
    let showDevURL = 'n/a';
    if (
      configUrlValue &&
      typeof configUrlValue === 'string' &&
      packageInfo.configUrls.confidentialBaseUrl &&
      !configUrlValue.includes(packageInfo.configUrls.confidentialBaseUrl)
    ) {
      showDevURL = configUrlValue;
    }
    return (
      configUrlValue &&
      configUrlValue !== productionURL && (
        <div className="my-auto ml-32 flex gap-x-4 text-2xl text-gray-400">
          <pre className="text-utility-amber">Developer Configuration Used: </pre>
          <pre className="text-quasi-white">{showDevURL}</pre>
        </div>
      )
    );
  };

  return (
    <>
      <ErrorModal />

      <ModalContainer />

      <SimpleBar>
        <div className="flex h-screen w-full flex-col">
          <div className="flex h-full flex-col overflow-hidden">
            <div className="draggable absolute z-50 flex h-12 w-full flex-row items-center bg-black pl-4">
              <div className="flex h-full flex-1 flex-row items-stretch overflow-hidden">
                <Logo />

                {import.meta.env.DEV && (
                  <div className="my-auto ml-32 flex gap-x-4 text-2xl text-gray-400">
                    <pre>{packageInfo.version}</pre>
                    <pre className="text-gray-500">|</pre>
                    <pre className="text-utility-amber">Development mode</pre>
                    <pre className="text-gray-500">|</pre>
                    <pre className="text-quasi-white">{location.pathname}</pre>
                  </div>
                )}
                {isDevelopmentConfigURL()}
              </div>

              <div className="not-draggable flex h-full flex-row">
                <InstallerUpdate />
                <WindowButtons />
              </div>
            </div>

            <div className="flex h-full flex-row justify-start pt-10">
              <div className="z-40 h-full">
                <NavBar>
                  {configuration.publishers.map((publisher) => (
                    <NavBarPublisher
                      key={publisher.key}
                      to={`/addon-section/${publisher.name}`}
                      publisher={publisher}
                    />
                  ))}
                </NavBar>
              </div>

              <div className="m-0 flex w-full bg-gradient">
                <Switch>
                  <Route exact path="/">
                    <Redirect to={`/addon-section/${configuration.publishers[0].name}`} />
                  </Route>
                  <Route path="/addon-section/:publisherName">
                    <PublisherSection />
                  </Route>
                  <Route exact path="/debug">
                    <DebugSection />
                  </Route>
                  <Route path="/settings">
                    <SettingsSection />
                  </Route>
                  <Route path="*">
                    <Redirect to={'/'} />
                  </Route>
                </Switch>
              </div>
            </div>
          </div>
        </div>
      </SimpleBar>
    </>
  );
};

export default App;
