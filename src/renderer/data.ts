import { Configuration } from './utils/InstallerConfiguration';

export const defaultConfiguration: Configuration = {
  version: 1,
  publishers: [
    // AeroGenesis
    {
      name: 'Aero Genesis',
      key: 'aerogenesis',
      logoUrl: './assets/AeroGenesis-Logo.svg',
      defs: [
        {
          kind: 'addonCategory',
          key: 'aircraft',
          title: 'Aircraft',
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
          key: 'A318',
          name: 'A318',
          repoOwner: 'AeroGenesis',
          repoName: 'aircraft',
          category: '@aircraft',
          aircraftName: 'A318-231',
          titleText: 'A318',
          titleTextSelected: 'A318',
          enabled: true,
          // TODO: Change this
          backgroundImageUrls: ['./assets/a320ceo.png'],
          shortDescription: 'Airbus A320 Series',
          description:
            'The A320 (new engine option) is one of many upgrades introduced by Airbus to help maintain ' +
            'its A320 product line’s position as the world’s most advanced and fuel-efficient twin-aisle ' +
            'aircraft family. The baseline A320 jetliner has a choice of two new-generation engines ' +
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
          key: 'A319',
          name: 'A319',
          repoOwner: 'AeroGenesis',
          repoName: 'aircraft',
          category: '@aircraft',
          aircraftName: 'A319-231',
          titleText: 'A319',
          titleTextSelected: 'A319',
          enabled: true,
          // TODO: Change this
          backgroundImageUrls: ['./assets/a320ceo.png'],
          shortDescription: 'Airbus A320 Series',
          description:
            'The A320 (new engine option) is one of many upgrades introduced by Airbus to help maintain ' +
            'its A320 product line’s position as the world’s most advanced and fuel-efficient twin-aisle ' +
            'aircraft family. The baseline A320 jetliner has a choice of two new-generation engines ' +
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
          key: 'A320',
          name: 'A320',
          repoOwner: 'AeroGenesis',
          repoName: 'aircraft',
          category: '@aircraft',
          aircraftName: 'A320-232',
          titleText: 'A320',
          titleTextSelected: 'A320',
          enabled: true,
          // TODO: Change this
          backgroundImageUrls: ['./assets/a320ceo.png'],
          shortDescription: 'Airbus A320 Series',
          description:
            'The A320 (new engine option) is one of many upgrades introduced by Airbus to help maintain ' +
            'its A320 product line’s position as the world’s most advanced and fuel-efficient twin-aisle ' +
            'aircraft family. The baseline A320 jetliner has a choice of two new-generation engines ' +
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
          key: 'A321',
          name: 'A321',
          repoOwner: 'AeroGenesis',
          repoName: 'aircraft',
          category: '@aircraft',
          aircraftName: 'A321-231',
          titleText: 'A321',
          titleTextSelected: 'A321',
          enabled: true,
          // TODO: Change this
          backgroundImageUrls: ['./assets/a320ceo.png'],
          shortDescription: 'Airbus A320 Series',
          description:
            'The A320 (new engine option) is one of many upgrades introduced by Airbus to help maintain ' +
            'its A320 product line’s position as the world’s most advanced and fuel-efficient twin-aisle ' +
            'aircraft family. The baseline A320 jetliner has a choice of two new-generation engines ' +
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
          name: 'A332',
          key: 'A332',
          repoOwner: 'aerogenesis',
          repoName: 'aircraft',
          category: '@aircraft',
          aircraftName: 'A330-200',
          titleText: 'A332',
          titleTextSelected: 'A332',
          enabled: true,
          backgroundImageUrls: ['./assets/a330_background.png'],
          shortDescription: 'Airbus A330-200',
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
          targetDirectory: 'AeroGenesis-A330-300',
          alternativeNames: ['A33X', 'A330'],
          tracks: [
            {
              name: 'Stable (4K)',
              key: 'A330-stable-4k',
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
          name: 'A333',
          key: 'A333',
          repoOwner: 'aerogenesis',
          repoName: 'aircraft',
          category: '@aircraft',
          aircraftName: 'A330-300',
          titleText: 'A333',
          titleTextSelected: 'A333',
          enabled: true,
          backgroundImageUrls: ['./assets/a330_background.png'],
          shortDescription: 'Airbus A330-300',
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
          targetDirectory: 'AeroGenesis-A330-300',
          alternativeNames: ['A33X', 'A330'],
          tracks: [
            {
              name: 'Stable (4K)',
              key: 'A330-stable-4k',
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
    // Zero Dollar Payware
    {
      name: 'Zero Dollar Payware',
      key: 'zdp',
      logoUrl: './assets/zdp_small_shadow.png',
      defs: [
        {
          kind: 'addonCategory',
          key: 'scenery',
          title: 'Scenery',
        },
        {
          kind: 'addonCategory',
          key: 'sceneryLibrary',
          title: 'Library',
        },
        {
          kind: 'addonCategory',
          key: 'utility',
          title: 'Utility',
        },
      ],
      addons: [
        {
          key: 'ZDP-lib',
          name: 'ZDP-Library',
          repoOwner: 'zero-dollar-payware',
          repoName: 'zdp_lib',
          category: '@sceneryLibrary',
          aircraftName: 'ZDP-Library',
          titleText: 'ZDP-LIB',
          titleTextSelected: 'ZDP',
          enabled: true,
          backgroundImageUrls: ['./assets/zdp_library_background.png'],
          shortDescription: 'ZDP_LIBRARY',
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
        {
          name: 'KSDF',
          key: 'KSDF',
          category: '@scenery',
          aircraftName: 'Louisville Muhammad Ali International',
          enabled: true,
          backgroundImageUrls: ['./assets/ZDP_banner_KSDF.png'],
          titleText: 'KSDF',
          titleTextSelected: 'KSDF',
          shortDescription: 'Louisville Muhammad Ali International Airport',
          description:
            'Welcome to KSDF! \n\n' +
            'This is a showcase of the A380 project. Spawn at KSDF or fly there! The nearest airport is KTNP (Twenty-Nine Palms, California, USA). ' +
            'There is an ILS without waypoints to Runway 10. Freq: 108.9 CRS: 100  \n' +
            'The airport is designed to be used by our developers for flight testing of the A380 and also designed to match the real-world A380 testing airport in Hamburg, Germany (EDHI).  \n' +
            'The location allows for quick test flights to LAX, which is also serviced by the A380.  \n' +
            'Use the developer or drone camera to explore! \n\n' +
            'Happy holidays and enjoy! -FBW Team',
          targetDirectory: 'flybywire-airport-kfbw-flybywire-field',
          tracks: [
            {
              name: 'Release',
              key: 'ksdf-release',
              url: 'https://flybywirecdn.com/addons/ksdf/release/',
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
        {
          name: 'RKSI',
          key: 'RKSI',
          category: '@scenery',
          aircraftName: 'Seoul-Incheon International',
          enabled: true,
          backgroundImageUrls: ['./assets/ZDP_banner_RKSI.png'],
          titleText: 'RKSI',
          titleTextSelected: 'RKSI',
          shortDescription: 'Seoul-Incheon International Airport',
          description:
            'Welcome to RKSI! \n\n' +
            'This is a showcase of the A380 project. Spawn at RKSI or fly there! The nearest airport is KTNP (Twenty-Nine Palms, California, USA). ' +
            'There is an ILS without waypoints to Runway 10. Freq: 108.9 CRS: 100  \n' +
            'The airport is designed to be used by our developers for flight testing of the A380 and also designed to match the real-world A380 testing airport in Hamburg, Germany (EDHI).  \n' +
            'The location allows for quick test flights to LAX, which is also serviced by the A380.  \n' +
            'Use the developer or drone camera to explore! \n\n' +
            'Happy holidays and enjoy! -FBW Team',
          targetDirectory: 'flybywire-airport-kfbw-flybywire-field',
          tracks: [
            {
              name: 'Release',
              key: 'ksdf-release',
              url: 'https://flybywirecdn.com/addons/ksdf/release/',
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
        {
          name: 'YBCG',
          key: 'YBCG',
          category: '@scenery',
          aircraftName: 'Gold Coast International Airport',
          enabled: true,
          backgroundImageUrls: ['./assets/ZDP_banner_YBCG.png'],
          titleText: 'YBCG',
          titleTextSelected: 'YBCG',
          shortDescription: 'Gold Coast International Airport',
          description:
            'Welcome to YBCG! \n\n' +
            'This is a showcase of the A380 project. Spawn at YBCG or fly there! The nearest airport is KTNP (Twenty-Nine Palms, California, USA). ' +
            'There is an ILS without waypoints to Runway 10. Freq: 108.9 CRS: 100  \n' +
            'The airport is designed to be used by our developers for flight testing of the A380 and also designed to match the real-world A380 testing airport in Hamburg, Germany (EDHI).  \n' +
            'The location allows for quick test flights to LAX, which is also serviced by the A380.  \n' +
            'Use the developer or drone camera to explore! \n\n' +
            'Happy holidays and enjoy! -FBW Team',
          targetDirectory: 'flybywire-airport-kfbw-flybywire-field',
          tracks: [
            {
              name: 'Release',
              key: 'ksdf-release',
              url: 'https://flybywirecdn.com/addons/ksdf/release/',
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
        {
          name: 'KCLL',
          key: 'KCLL',
          category: '@scenery',
          aircraftName: 'Easterwood Field',
          enabled: true,
          backgroundImageUrls: ['./assets/ZDP_banner_KCLL.png'],
          titleText: 'KCLL',
          titleTextSelected: 'KCLL',
          shortDescription: 'Easterwood Field',
          description:
            'Welcome to YBCG! \n\n' +
            'This is a showcase of the A380 project. Spawn at YBCG or fly there! The nearest airport is KTNP (Twenty-Nine Palms, California, USA). ' +
            'There is an ILS without waypoints to Runway 10. Freq: 108.9 CRS: 100  \n' +
            'The airport is designed to be used by our developers for flight testing of the A380 and also designed to match the real-world A380 testing airport in Hamburg, Germany (EDHI).  \n' +
            'The location allows for quick test flights to LAX, which is also serviced by the A380.  \n' +
            'Use the developer or drone camera to explore! \n\n' +
            'Happy holidays and enjoy! -FBW Team',
          targetDirectory: 'flybywire-airport-kfbw-flybywire-field',
          tracks: [
            {
              name: 'Release',
              key: 'ksdf-release',
              url: 'https://flybywirecdn.com/addons/ksdf/release/',
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
        {
          name: 'MDPC',
          key: 'MDPC',
          category: '@scenery',
          aircraftName: 'Punta Cana International',
          enabled: true,
          backgroundImageUrls: ['./assets/ZDP_banner_MDPC.png'],
          titleText: 'MDPC',
          titleTextSelected: 'MDPC',
          shortDescription: 'Punta Cana International',
          description:
            'Welcome to YBCG! \n\n' +
            'This is a showcase of the A380 project. Spawn at YBCG or fly there! The nearest airport is KTNP (Twenty-Nine Palms, California, USA). ' +
            'There is an ILS without waypoints to Runway 10. Freq: 108.9 CRS: 100  \n' +
            'The airport is designed to be used by our developers for flight testing of the A380 and also designed to match the real-world A380 testing airport in Hamburg, Germany (EDHI).  \n' +
            'The location allows for quick test flights to LAX, which is also serviced by the A380.  \n' +
            'Use the developer or drone camera to explore! \n\n' +
            'Happy holidays and enjoy! -FBW Team',
          targetDirectory: 'flybywire-airport-kfbw-flybywire-field',
          tracks: [
            {
              name: 'Release',
              key: 'ksdf-release',
              url: 'https://flybywirecdn.com/addons/ksdf/release/',
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
        {
          name: 'PANC',
          key: 'PANC',
          category: '@scenery',
          aircraftName: 'Anchorage Ted Stevens International',
          enabled: true,
          backgroundImageUrls: ['./assets/ZDP_banner_PANC.png'],
          titleText: 'PANC',
          titleTextSelected: 'PANC',
          shortDescription: 'Anchorage Ted Stevens International',
          description:
            'Welcome to YBCG! \n\n' +
            'This is a showcase of the A380 project. Spawn at YBCG or fly there! The nearest airport is KTNP (Twenty-Nine Palms, California, USA). ' +
            'There is an ILS without waypoints to Runway 10. Freq: 108.9 CRS: 100  \n' +
            'The airport is designed to be used by our developers for flight testing of the A380 and also designed to match the real-world A380 testing airport in Hamburg, Germany (EDHI).  \n' +
            'The location allows for quick test flights to LAX, which is also serviced by the A380.  \n' +
            'Use the developer or drone camera to explore! \n\n' +
            'Happy holidays and enjoy! -FBW Team',
          targetDirectory: 'flybywire-airport-kfbw-flybywire-field',
          tracks: [
            {
              name: 'Release',
              key: 'ksdf-release',
              url: 'https://flybywirecdn.com/addons/ksdf/release/',
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
        {
          name: 'EGNR',
          key: 'EGNR',
          category: '@scenery',
          aircraftName: 'Hawarden Airport',
          enabled: true,
          backgroundImageUrls: ['./assets/ZDP_banner_EGNR.png'],
          titleText: 'EGNR',
          titleTextSelected: 'EGNR',
          shortDescription: 'Hawarden Airport',
          description:
            'Welcome to YBCG! \n\n' +
            'This is a showcase of the A380 project. Spawn at YBCG or fly there! The nearest airport is KTNP (Twenty-Nine Palms, California, USA). ' +
            'There is an ILS without waypoints to Runway 10. Freq: 108.9 CRS: 100  \n' +
            'The airport is designed to be used by our developers for flight testing of the A380 and also designed to match the real-world A380 testing airport in Hamburg, Germany (EDHI).  \n' +
            'The location allows for quick test flights to LAX, which is also serviced by the A380.  \n' +
            'Use the developer or drone camera to explore! \n\n' +
            'Happy holidays and enjoy! -FBW Team',
          targetDirectory: 'flybywire-airport-kfbw-flybywire-field',
          tracks: [
            {
              name: 'Release',
              key: 'ksdf-release',
              url: 'https://flybywirecdn.com/addons/ksdf/release/',
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
          text: 'Discord',
          action: 'openBrowser',
          url: 'https://discord.gg/DcH7XFH3j9',
        },
        {
          text: 'Twitter',
          action: 'openBrowser',
          url: 'https://x.com/zdpofficial',
          inline: true,
        },
      ],
    },
    // X-Coder
    {
      name: 'X-Coder',
      key: 'xcoder',
      logoUrl: './assets/',
      defs: [
        {
          kind: 'addonCategory',
          key: 'scenery',
          title: 'Scenery',
        },
        {
          kind: 'addonCategory',
          key: 'sceneryLibrary',
          title: 'Library',
        },
        {
          kind: 'addonCategory',
          key: 'utility',
          title: 'Utility',
        },
      ],
      addons: [
        {
          key: 'X-Coder Library',
          name: 'X-Coder Library',
          repoOwner: 'xcoder',
          repoName: 'xcoder-library',
          category: '@sceneryLibrary',
          aircraftName: 'Library',
          titleText: 'Library',
          titleTextSelected: 'Library',
          enabled: true,
          backgroundImageUrls: ['./assets/xcoder_library_background.png'],
          shortDescription: 'X-Coder Library for Scenery Addons',
          description:
            'The X-Coder library is a collection of assets used by various scenery addons. It is required for those addons to function properly.',
          techSpecs: [],
          targetDirectory: 'xcoder-library',
          tracks: [
            {
              name: 'Stable',
              key: 'xcoder-library-stable',
              url: '',
              isExperimental: false,
              releaseModel: {
                type: 'CDN',
              },
            },
          ],
        },
        {
          key: 'X-Coder Scenery',
          name: 'Living Scenery Technology',
          repoOwner: 'xcoder',
          repoName: 'xcoder-living-scenery',
          category: '@scenery',
          aircraftName: 'Living Scenery Technology',
          titleText: 'LST',
          titleTextSelected: 'LST',
          enabled: true,
          backgroundImageUrls: ['./assets/xcoder_scenery_background.png'],
          shortDescription:
            'The next generation of ambient ground traffic in X-Plane. Used by many of our sceneries, and free for other developers to use in theirs.',
          description:
            "Living Scenery Technology is a next generation plugin for the animation of scenery objects along a route and access to special features such as the particle system and FMOD in X-Plane 12. The inspiration for this project largely came from Marginal's wonderful GroundTraffic plugin. Living Scenery Technology features several improvements including a developer defined activation range for very large projects, fast performance, branching methodology for spawning, support for Mac (intel only) Windows and Linux, and most importantly, it is a global plugin implementing a one plugin, many sceneries design, which allows an infinite number of sceneries to use LST as opposed to only being able to have 30-40 instances of GroundTraffic. Lastly, Living Scenery Technology is freeware, for everyone, forever.",
          techSpecs: [],
          targetDirectory: 'xcoder-living-scenery',
          tracks: [
            {
              name: 'Stable',
              key: 'xcoder-living-scenery-stable',
              url: '',
              isExperimental: false,
              releaseModel: {
                type: 'CDN',
              },
            },
          ],
        },
        {
          key: 'X-Coder Scenery',
          name: 'KMGM',
          repoOwner: 'xcoder',
          repoName: 'xcoder-KMGM-scenery',
          category: '@scenery',
          aircraftName: 'Montgomery Regional Airport',
          titleText: 'KMGM',
          titleTextSelected: 'KMGM',
          enabled: true,
          backgroundImageUrls: ['./assets/xcoder_scenery_background.png'],
          shortDescription:
            'The next generation of ambient ground traffic in X-Plane. Used by many of our sceneries, and free for other developers to use in theirs.',
          description:
            "Living Scenery Technology is a next generation plugin for the animation of scenery objects along a route and access to special features such as the particle system and FMOD in X-Plane 12. The inspiration for this project largely came from Marginal's wonderful GroundTraffic plugin. Living Scenery Technology features several improvements including a developer defined activation range for very large projects, fast performance, branching methodology for spawning, support for Mac (intel only) Windows and Linux, and most importantly, it is a global plugin implementing a one plugin, many sceneries design, which allows an infinite number of sceneries to use LST as opposed to only being able to have 30-40 instances of GroundTraffic. Lastly, Living Scenery Technology is freeware, for everyone, forever.",
          techSpecs: [],
          targetDirectory: 'xcoder-KMGM-scenery',
          tracks: [
            {
              name: 'Stable',
              key: 'xcoder-KMGM-scenery-stable',
              url: '',
              isExperimental: false,
              releaseModel: {
                type: 'CDN',
              },
            },
          ],
        },
      ],
      buttons: [
        {
          text: 'Discord',
          action: 'openBrowser',
          url: 'https://discord.gg/tep5JV2aQk',
        },
        {
          text: 'Twitter',
          action: 'openBrowser',
          url: 'https://twitter.com/XCodrDesigns',
          inline: true,
        },
        {
          text: 'YouTube',
          action: 'openBrowser',
          url: 'https://www.youtube.com/channel/UCpPReAWS-Iy9o__gNZP5Dvw',
        },
        {
          text: 'Website',
          action: 'openBrowser',
          url: 'https://www.x-codrdesigns.com/',
          inline: true,
        },
      ],
    },
  ],
};
