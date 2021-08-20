# Architecture

This is an [Electron](https://www.electronjs.org/) app, written in [TypeScript](https://www.typescriptlang.org/) and using the [React](https://reactjs.org/) UI library.

The overall project structure and tool configurations are heavily based on the [Electron React Boilerplate](https://electron-react-boilerplate.js.org/) template.

## Electron

Electron apps use multiple processes:

- Main process - manages rendered windows, controls application lifecycle through `app` module, and exposes custom APIs for interacting with the operating system and provide native desktop functionality.

- Renderer process - one per window

There are mechanisms for inter-process communication:

- Messages can be sent Main process -> Renderer process [can use](https://www.electronjs.org/docs/api/web-contents#contentssendchannel-args) `webcontents.send()` (in the main process) and `ipcRenderer.on()` (in the renderer process)

- Messages can be sent Renderer process -> Main process [can use](https://www.electronjs.org/docs/api/ipc-main) `ipcRenderer.send()` (in the renderer process) and `ipcMain.on()` (in the main process)

- [webContents events](https://www.electronjs.org/docs/latest/api/web-contents#instance-events) triggered in the render process can be received in the main process using `webcontents.on()`

## Key files:

- `src/App.tsx` is the top-level file for the React app; it imports various React components defined in `src/components`
- `src/index.tsx` renders the App component using React's `render()` function
- `webpack.config.renderer.prod.babel` defines how babel should process `src/index.tsx` to build `src/dist/renderer.prod.js`
- `webpack.config.renderer.dev.babel` defines how babel should process `src/index.tsx` to build `src/dist/renderer.dev.js`
- `index.html` includes some JS that loads `src/dist/renderer.prod.js` or `src/dist/renderer.dev.js`, depending on whether or not the application is running in development mode

The `src/main.dev.ts` file defines the code that will run in the main process; it creates new `BrowserWindows`, and then loads `index.html` into them.
`webContents.send()` is used to tell the React application the path of the project directory that has been opened.
