import { Addon, ExternalApplicationDefinition, Publisher } from 'renderer/utils/InstallerConfiguration';
import net from 'renderer/stubs/net';
import { Resolver } from 'renderer/utils/Resolver';

export class ExternalApps {
  static forAddon(addon: Addon, publisher: Publisher): ExternalApplicationDefinition[] {
    return (
      addon.disallowedRunningExternalApps?.map((reference) => {
        const def = Resolver.findDefinition(reference, publisher);

        if (def.kind !== 'externalApp') {
          throw new Error(`definition (key=${def.key}) has kind=${def.kind}, expected kind=externalApp`);
        }

        return def;
      }) ?? []
    );
  }

  static async determineStateWithWS(app: ExternalApplicationDefinition): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        if (!app.url) {
          console.error('WebSocket external app has no URL:', app);
          resolve(false);
          return;
        }

        const wbs = new WebSocket(app.url);

        wbs.addEventListener('open', () => {
          wbs.close();
          resolve(true);
        });

        wbs.addEventListener('error', (error) => {
          console.error('WebSocket connection error:', error);
          resolve(false);
        });

        // Add a timeout to prevent hanging
        setTimeout(() => {
          if (wbs.readyState === WebSocket.CONNECTING) {
            wbs.close();
            resolve(false);
          }
        }, 5000);
      } catch (error) {
        console.error('Error while establishing WS external app state:', error);
        resolve(false);
      }
    });
  }

  static async determineStateWithHttp(app: ExternalApplicationDefinition): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        if (!app.url) {
          console.error('HTTP external app has no URL:', app);
          resolve(false);
          return;
        }

        // Add a timeout to the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        fetch(app.url, { signal: controller.signal })
          .then((resp) => {
            clearTimeout(timeoutId);
            resolve(resp.status === 200);
          })
          .catch((error) => {
            clearTimeout(timeoutId);
            console.error('HTTP connection error:', error);
            resolve(false);
          });
      } catch (error) {
        console.error('Error while establishing HTTP external app state:', error);
        resolve(false);
      }
    });
  }

  static async determineStateWithTcp(app: ExternalApplicationDefinition): Promise<boolean> {
    try {
      // Validate that we have a port
      if (!app.port || typeof app.port !== 'number') {
        console.error('TCP external app has no valid port:', app);
        return false;
      }

      // Use IPC-based TCP connection check
      const result = await net.connect(app.port);
      return result;
    } catch (error) {
      console.error('Error while establishing TCP external app state:', error);
      // Return false instead of throwing to prevent unhandled promise rejection
      return false;
    }
  }

  static async kill(app: ExternalApplicationDefinition): Promise<void> {
    if (!app.killUrl) {
      throw new Error('Cannot kill external app if it has no killUrl value');
    }

    return fetch(app.killUrl, { method: app.killMethod ?? 'POST' }).then();
  }
}
