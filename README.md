# X-Plane 12 Installer
Coalition of Freeware Developers project installer application for X-Plane 12.

This installer helps you install and manage addons for X-Plane 12, including aircraft, scenery, and other modifications.

## Features

- **Automatic X-Plane Detection**: Automatically detects X-Plane 12 installations, including Steam versions
- **Steam Integration**: Uses the `steam-locate` package to find Steam installations across all library folders
- **Addon Management**: Install and manage various X-Plane 12 addons
- **Multiple Installation Types**: Supports aircraft, scenery, plugins, and other addon types
- **Background Updates**: Automatic checking for addon updates

## Getting Started

On first launch, the installer will automatically attempt to detect your X-Plane 12 installation:

1. **Steam Detection**: Searches all Steam library folders for X-Plane 12
2. **Standard Detection**: Checks common installation paths
3. **Manual Selection**: Prompts for manual path selection if automatic detection fails

For more details on the Steam detection feature, see [Steam Detection Documentation](docs/STEAM_DETECTION.md).
