import { Configuration } from './utils/InstallerConfiguration';

export const defaultConfiguration: Configuration = {
  version: 1,
  publishers: [
    {
      name: 'FlyByWire Simulations',
      key: 'flybywiresim',
      logoUrl: 'https://flybywirecdn.com/installer/media-assets/publisher-icons/flybywiresim/0.svg',
      defs: [
        {
          kind: 'addonCategory',
          key: 'aircraft',
          title: 'Aircraft',
        },
        {
          kind: 'addonCategory',
          key: 'scenery',
          title: 'Scenery',
        },

        {
          kind: 'externalApp',
          key: 'xp12',
          prettyName: 'X-Plane 12',
          detectionType: 'tcp',
          port: 49000,
        },
      ],
      addons: [
        {
          key: 'A330',
          name: 'A330',
          repoOwner: 'AeroGenesis',
          repoName: 'aircraft',
          category: '@aircraft',
          aircraftName: 'A330-300',
          titleImageUrl: 'https://flybywirecdn.com/installer/media-assets/addon-titles/fbw-a32nx/dark.svg',
          titleImageUrlSelected: 'https://flybywirecdn.com/installer/media-assets/addon-titles/fbw-a32nx/light.svg',
          enabled: true,
          // TODO: Change this
          backgroundImageUrls: ['https://flybywirecdn.com/installer/media-assets/addon-headers/fbw-a32nx/1.png'],
          shortDescription: 'Airbus A330 Series',
          description:
            'The A330 (new engine option) is one of many upgrades introduced by Airbus to help maintain ' +
            'its A330 product line’s position as the world’s most advanced and fuel-efficient twin-aisle ' +
            'aircraft family. The baseline A330 jetliner has a choice of two new-generation engines ' +
            '(the PurePower PW1100G-JM from Pratt and Whitney and the LEAP-1A from CFM International) ' +
            'and features large, fuel-saving wingtip devices known as Sharklets.',
          techSpecs: [
            {
              name: 'Engines',
              value: 'CFM LEAP 1A-26',
            },
            {
              name: 'APU',
              value: 'APS3200',
            },
          ],
          targetDirectory: 'flybywire-aircraft-a320-neo',
          alternativeNames: ['A32NX', 'a32nx'],
          tracks: [
            {
              name: 'Stable',
              key: 'a32nx-stable',
              url: 'https://flybywirecdn.com/addons/a32nx/stable',
              alternativeUrls: [
                'external/a32nx/stable',
                // move bunnycdn users to cloudflare
                'https://cdn.flybywiresim.com/addons/a32nx/stable',
              ],
              description:
                'Stable is our variant that has the least bugs and best performance. ' +
                'This version will not always be up to date but we guarantee its compatibility ' +
                'with each major patch from X-Plane 12.',
              isExperimental: false,
              releaseModel: {
                type: 'CDN',
              },
            },
            {
              name: 'Development',
              key: 'a32nx-dev',
              url: 'https://flybywirecdn.com/addons/a32nx/master',
              alternativeUrls: [
                // move old experimental users over to dev
                'https://cdn.flybywiresim.com/addons/a32nx/cfbw-cap',
                'https://cdn.flybywiresim.com/addons/a32nx/cfbw',
                'external/a32nx/master',
                // move bunnycdn users to cloudflare
                'https://cdn.flybywiresim.com/addons/a32nx/master',
                // move exp users to dev
                'https://flybywirecdn.com/addons/a32nx/experimental',
                'external/a32nx/experimental',
                'https://cdn.flybywiresim.com/addons/a32nx/experimental',
                'https://github.com/flybywiresim/a32nx/releases/download/assets/experimental/',
              ],
              description:
                'Development will have the latest features that will end up in the next stable. ' +
                "Although every change is QA-tested, bugs are a little more likely. It updates whenever something is added to the 'master' " +
                'branch on Github. Please visit our discord for support.',
              isExperimental: false,
              releaseModel: {
                type: 'CDN',
              },
            },
          ],
          dependencies: [],
          incompatibleAddons: [
            // title: the exact title as it appears in the manifest.json
            // creator: the exact creator as it appears in the manifest.json
            // packageVersion syntax follows: https://www.npmjs.com/package/semver
            // description: a short description of why the addon is incompatible
          ],
          myInstallPage: {
            links: [
              {
                url: 'https://docs.flybywiresim.com/',
                title: 'Documentation',
              },
            ],
            directories: [
              {
                location: {
                  in: 'packageCache',
                  path: 'work',
                },
                title: 'Work Folder',
              },
            ],
          },
          disallowedRunningExternalApps: ['@/xp12'],
        },
        {
          name: 'A380X',
          key: 'A380X',
          repoOwner: 'flybywiresim',
          repoName: 'aircraft',
          category: '@aircraft',
          aircraftName: 'A380-842',
          titleImageUrl: 'https://flybywirecdn.com/installer/media-assets/addon-titles/fbw-a380x/dark.svg',
          titleImageUrlSelected: 'https://flybywirecdn.com/installer/media-assets/addon-titles/fbw-a380x/light.svg',
          enabled: true,
          backgroundImageUrls: ['https://flybywirecdn.com/installer/media-assets/addon-headers/fbw-a380x/a380x.png'],
          shortDescription: 'Airbus A380-800',
          description: '',
          techSpecs: [
            {
              name: 'Engines',
              value: 'RR Trent 972B-84',
            },
            {
              name: 'APU',
              value: 'PW980',
            },
          ],
          targetDirectory: 'flybywire-aircraft-a380-842',
          alternativeNames: ['A380X', 'a380x'],
          tracks: [
            {
              name: 'Stable (4K)',
              key: 'a380x-stable-4k',
              url: 'https://flybywirecdn.com/addons/a380x/stable-4k',
              alternativeUrls: [],
              description:
                'Includes our 4K downscaled cabin, cockpit and exterior textures. Choose this option for reduced ' +
                'stutters, better performance, with HIGH or lower texture resolution. Especially, if you intend to use the ' +
                'following:\n\n' +
                '* Use frame generation \n\n' +
                '* Virtual Reality (VR) \n\n' +
                '* DX12 beta \n\n' +
                '* or are otherwise limited by your graphics card VRAM amount. ' +
                '[System Requirements](https://docs.flybywiresim.com/aircraft/install/installation/#estimated-system-requirements-for-a380x)',
              isExperimental: false,
              releaseModel: {
                type: 'CDN',
              },
            },
            {
              name: 'Stable (8K)',
              key: 'a380x-stable-8k',
              url: 'https://flybywirecdn.com/addons/a380x/stable-8k',
              alternativeUrls: [],
              description:
                'Includes our 8K full resolution cabin, cockpit and exterior textures. This is the full fidelity ' +
                'experience and our recommendation if your system is powerful enough to support it. Realistic and in high ' +
                'detail.\n\n' +
                '* DX11 recommended \n\n' +
                '* HIGH or lower texture resolution setting recommended \n\n',
              isExperimental: false,
              releaseModel: {
                type: 'CDN',
              },
            },
            {
              name: 'Development (4K)',
              key: 'a380x-dev-4k',
              url: 'https://flybywirecdn.com/addons/a380x/master-4k',
              alternativeUrls: [],
              description:
                'Development will have the latest features that will end up in the next stable. ' +
                'Although every change is QA-tested, bugs are a little more likely. It updates whenever something is added to ' +
                "the 'master' branch on Github. Please visit our discord for support. \n\n" +
                'Includes our 4K downscaled cabin, cockpit and exterior textures. Choose this option for reduced ' +
                'stutters, better performance, with HIGH or lower texture resolution. Especially, if you intend to use the ' +
                'following:\n\n' +
                '* Use frame generation \n\n' +
                '* Virtual Reality (VR) \n\n' +
                '* DX12 beta \n\n' +
                '* or are otherwise limited by your graphics card VRAM amount. ',
              isExperimental: false,
              releaseModel: {
                type: 'CDN',
              },
            },
            {
              name: 'Development (8K)',
              key: 'a380x-dev-8k',
              url: 'https://flybywirecdn.com/addons/a380x/master-8k',
              alternativeUrls: [],
              description:
                'Development will have the latest features that will end up in the next stable. ' +
                'Although every change is QA-tested, bugs are a little more likely. It updates whenever something is added to ' +
                "the 'master' branch on Github. Please visit our discord for support. \n\n" +
                '* DX11 recommended \n\n' +
                '* HIGH or lower texture resolution setting recommended \n\n',
              isExperimental: false,
              releaseModel: {
                type: 'CDN',
              },
            },
          ],
          incompatibleAddons: [
            // title: the exact title as it appears in the manifest.json
            // creator: the exact creator as it appears in the manifest.json
            // packageVersion syntax follows: https://www.npmjs.com/package/semver
            // description: a short description of why the addon is incompatible
          ],
          disallowedRunningExternalApps: ['@/xp12'],
        },
        {
          name: 'KFBW',
          key: 'KFBW',
          category: '@scenery',
          aircraftName: 'FBW Headquarters',
          enabled: true,
          overrideAddonWhileHidden: 'A380X',
          backgroundImageUrls: ['https://flybywirecdn.com/installer/media-assets/addon-headers/fbw-kfbw/0.png'],
          titleImageUrl: 'https://flybywirecdn.com/installer/media-assets/addon-titles/fbw-kfbw/dark.svg',
          titleImageUrlSelected: 'https://flybywirecdn.com/installer/media-assets/addon-titles/fbw-kfbw/light.svg',
          shortDescription: 'FlyByWire Headquarters',
          description:
            'Welcome to KFBW! \n\n' +
            'This is a showcase of the A380 project. Spawn at KFBW or fly there! The nearest airport is KTNP (Twenty-Nine Palms, California, USA). ' +
            'There is an ILS without waypoints to Runway 10. Freq: 108.9 CRS: 100  \n' +
            'The airport is designed to be used by our developers for flight testing of the A380 and also designed to match the real-world A380 testing airport in Hamburg, Germany (EDHI).  \n' +
            'The location allows for quick test flights to LAX, which is also serviced by the A380.  \n' +
            'Use the developer or drone camera to explore! \n\n' +
            'Happy holidays and enjoy! -FBW Team',
          targetDirectory: 'flybywire-airport-kfbw-flybywire-field',
          tracks: [
            {
              name: 'Release',
              key: 'kfbw-release',
              url: 'https://flybywirecdn.com/addons/kfbw/release/',
              alternativeUrls: [
                // move Bunny CDN users to Cloudflare
                'https://cdn.flybywiresim.com/addons/kfbw/release/',
              ],
              isExperimental: false,
              releaseModel: {
                type: 'CDN',
              },
              description:
                'FlyByWire Headquarters is transformed into a winter wonderland - complete with a plethora of festive decorations in addition to the standard progress showcase.',
            },
          ],
        },
      ],
      buttons: [
        {
          text: 'Documentation',
          action: 'openBrowser',
          url: 'https://docs.flybywiresim.com/',
        },
        {
          text: 'Website',
          action: 'openBrowser',
          url: 'https://flybywiresim.com/',
        },
        {
          text: 'Discord',
          action: 'openBrowser',
          url: 'https://discord.gg/flybywire',
        },
        {
          text: 'Twitter',
          action: 'openBrowser',
          url: 'https://twitter.com/FlyByWireSim',
          inline: true,
        },
      ],
    },
    {
      name: 'Salty Simulations',
      key: 'salty',
      logoUrl: 'https://flybywirecdn.com/installer/media-assets/publisher-icons/salty/0.svg',
      defs: [
        {
          kind: 'addonCategory',
          key: 'aircraft',
          title: 'Aircraft',
        },
      ],
      addons: [
        {
          key: '74S',
          name: '74S',
          repoOwner: 'saltysimulations',
          repoName: 'salty-747',
          category: '@aircraft',
          aircraftName: 'B747-8I',
          titleImageUrl: 'https://flybywirecdn.com/installer/media-assets/addon-titles/salty-74S/dark.svg',
          titleImageUrlSelected: 'https://flybywirecdn.com/installer/media-assets/addon-titles/salty-74S/light.svg',
          enabled: true,
          backgroundImageUrls: [
            'https://raw.githubusercontent.com/saltysimulations/branding/main/png/salty_banner.png',
          ],
          shortDescription: 'Boeing 747-8I',
          description:
            'The Boeing 747-8 is the largest variant of the 747. ' +
            'It features a thicker and wider wing, allowing it to hold more fuel, as well as raked wingtips. ' +
            'The aircraft, powered by the more efficient General Electric GEnx engines, ' +
            'can carry 467 passengers in a typical three-class configuration, and has a range of 7,730 nautical miles.',
          techSpecs: [
            {
              name: 'Engines',
              value: 'GEnx-2B',
            },
          ],
          targetDirectory: 'salty-747',
          tracks: [
            {
              name: 'Stable',
              key: '74S-stable',
              url: 'https://github.com/saltysimulations/salty-747/releases/download/vinstaller-stable/',
              description:
                'Stable is our variant that has the least bugs and best performance. ' +
                'This version will not always be up to date but we guarantee its compatibility ' +
                'with each major patch from X-Plane 12.',
              isExperimental: false,
              releaseModel: {
                type: 'githubRelease',
              },
            },
            {
              name: 'Development',
              key: '74S-dev',
              url: 'https://github.com/saltysimulations/salty-747/releases/download/vinstaller/',
              description:
                'The development version has all the latest features that will end up in the next stable. ' +
                'You may encounter bugs more frequently.',
              isExperimental: false,
              releaseModel: {
                type: 'githubBranch',
                branch: 'master',
              },
            },
          ],
        },
      ],
      buttons: [
        {
          text: 'Discord',
          action: 'openBrowser',
          url: 'https://discord.gg/S4PJDwk',
        },
        {
          text: 'Twitter',
          action: 'openBrowser',
          url: 'https://twitter.com/Salty_Sim',
          inline: true,
        },
      ],
    },
  ],
};
