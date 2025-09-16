# X-Plane 12 Installer
Coalition of Freeware Developers project installer application for X-Plane 12.

This installer helps you install and manage addons for X-Plane 12, including aircraft, scenery, and other modifications.

## Features

- **Automatic X-Plane Detection**: Automatically detects X-Plane 12 installations, including Steam versions
- **Steam Integration**: Uses the `steam-locate` package to find Steam installations across all library folders
- **Addon Management**: Install and manage various X-Plane 12 addons
- **Multiple Installation Types**: Supports aircraft, scenery, plugins, and other addon types
- **Background Updates**: Automatic checking for addon updates

## How to contribute

The installer is built as an [Electron Application](https://www.electronjs.org/) for Windows
using [TypeScript](https://www.typescriptlang.org/), [React](https://reactjs.org/), and [WebPack](https://webpack.js.org/).

### Requirements

Please make sure you have:

- [git](https://git-scm.com/downloads)
- [NodeJS 20](https://nodejs.org/en/)

## Getting Started

First fork the Installer repository project and install the required dependencies

```shell script
npm install
```
or 

```shell script
npm i
```
Then run the development server using

```shell script
npm run dev
```

## On First Launch
On first launch, the installer will automatically attempt to detect your X-Plane 12 installation:

1. **Steam Detection**: Searches all Steam library folders for X-Plane 12
2. **Standard Detection**: Checks common installation paths
3. **Manual Selection**: Prompts for manual path selection if automatic detection fails

For more details on the Steam detection feature, see [Steam Detection Documentation](docs/STEAM_DETECTION.md).

---
<div align="center">
  <ul>
    <a align="left" style="text-align: center, font-style: bold">&ensp;&ensp;Copyright © 2025 Coalition of Freeware Developers&ensp;&ensp;</a>
    <a style="text-align: center, font-style: bold, padding: 12">&ensp;&ensp;&#10072;&ensp;&ensp;</a>
    <a align="center" style="text-align: center, font-style: bold">&ensp;&ensp;All Rights Reserved&ensp;&ensp;</a>
    <a style="text-align: center, font-style: bold, padding: 12">&ensp;&ensp;&#10072;&ensp;&ensp;</a>
    <a align="right" style="text-align: center, font-style: bold">&ensp;&ensp;Licensed under the GPL-3.0 license&ensp;&ensp;</a>
  </ul>
</div>
<p align="center">
<img src=https://github.com/user-attachments/assets/1d752157-ed53-4f5e-80f9-21c2fdcb2537 width=40%>
</p>

