## General Principles

- Code must be written to be **readable, maintainable, and well-structured**.
- Follow the **DRY (Don't Repeat Yourself) principle** to avoid redundancy.
- Keep code **simple and concise** while ensuring clarity-**avoid over-engineering**
- Write code that is multi-platform to operator on **multi-platform devices including windows, mac, and linux**.
- This is an Electron application built with TypeScript. The focus is on separation of concerns between the main and renderer processes.

## Electron Development

- Use `ipcRenderer` and `ipcMain` for inter-process communication.
- Ensure that generated UI code aligns with the preferred framework (e.g., React with hooks).
- Use TypeScript for type safety throughout the project.
- Webpack is configured to bundle the main Electron process and includes a ts-loader for TypeScript files.
- Vite is used for faster development builds of the renderer process.
- Prioritize functional React components with hooks.
- Adhere to the established project structure and directory layout.

## Code Structure

- **Imports:** Place imports at the **top** in the following order:
  - **Standard library** (e.g.,  `import os`)
  - **Third-party libraries** (e.g.,  `import * as BootstrapIconsfrom 'react-bootstrap-icons' `)
  - **Local application modules** (e.g., `from my_module import my_function`)
    - **Sort imports alphabetically** within each group.
    - **Remove** unused libraries **in the import functions** to keep the code clean.
- **Functions:**
  - Include a **docstring** explainjing purpose, parameters, and return values.

## Application Purpose

- The Coalition of Freeware Developers Installer **application is an Electron application written in TypeScript**.
- The application utilizes **React and Vite** for its graphics and user interactions.
- The application is **packaged through Webpack** prior to release.
- This application is to **serve as a univeral installer for the members of the Coalition of Freeware Developers to publish and update their aircraft, scenery libraries, sceneries, and utilities by providing this application as an easy, fast, intuitive installer for the end user to install the content to their X-Plane 12 installation**.
