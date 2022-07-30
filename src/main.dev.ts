/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import path from 'path';
import { app, Menu, BrowserWindow, ipcMain, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

import ProjectLoader from './ProjectLoader';
import { authenticate } from './authenticateGoogle';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
// const [mainWindow, setMainWindow] = useState<any>(null)

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const openProjectWindow = async (projectPath: string) => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
    },
  });
  // setMainWindow(new BrowserWindow({
  //   show: false,
  //   width: 1024,
  //   height: 728,
  //   icon: getAssetPath('icon.png'),
  //   webPreferences: {
  //     nodeIntegration: true,
  //   },
  // }))

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('did this work?');

    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();

      console.log('NEED TO ADD THIS BACK IN');
      authenticate();
    }

    mainWindow.webContents.send('projectPath', projectPath);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    // setMainWindow(null);
  });

  // Open urls in the user's browser
  const handleRedirect = (e: any, url: string) => {
    if (url !== e.sender.getURL()) {
      e.preventDefault();
      shell.openExternal(url);
    }
  };
  mainWindow.webContents.on('will-navigate', handleRedirect);

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

interface MenuEntry {
  label: string;
  click: () => void;
}

interface MenuDivider {
  type: 'separator';
}

async function createSplashWindow() {
  console.log('create splash window');
  const splashWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
  });

  splashWindow.loadURL(`file://${__dirname}/index.html`);

  const fileManager = new ProjectLoader(splashWindow, openProjectWindow);

  // set open recent submenu
  const submenuOfOpenRecent: (MenuEntry | MenuDivider)[] = [];
  const paths = fileManager.readHistory();
  let allPaths = await paths;

  if (!allPaths) {
    allPaths = { paths: [] };
  }

  allPaths.paths.map((recentPath: string) => {
    submenuOfOpenRecent.push(
      {
        label: recentPath,
        click() {
          fileManager.openRecentProject(recentPath);
        },
      },
      { type: 'separator' }
    );
    return null;
  });

  // Declare all menu
  const menuList = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project...',
          click() {
            fileManager.newProjectPicker();
          },
        },
        {
          label: 'Open Project...',
          click() {
            fileManager.openProjectPicker();
          },
        },
        {
          label: 'Open recent...',
          submenu: submenuOfOpenRecent,
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        {
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          selector: 'redo:',
        },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          selector: 'selectAll:',
        },
      ],
    },
  ];

  // set the menu to desktop app
  const menuDesign = Menu.buildFromTemplate(menuList);
  Menu.setApplicationMenu(menuDesign);

  // Update page UI
  splashWindow.webContents.on('did-finish-load', () => {
    if (!splashWindow) {
      throw new Error('"splashWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      splashWindow.minimize();
    } else {
      splashWindow.show();
      splashWindow.focus();
    }

    splashWindow.webContents.send('noProjectSelected', allPaths.paths);
  });

  ipcMain.on('newProject', () => {
    fileManager.newProjectPicker();
  });

  ipcMain.on('openProject', (_e, pathToOpen: string) => {
    if (pathToOpen) {
      fileManager.openRecentProject(pathToOpen);
    } else {
      fileManager.openProjectPicker();
    }
  });
}

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(createSplashWindow).catch(console.log);

app.on('activate', () => {
  console.log('activated!!!!', mainWindow);
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  // if (mainWindow === null) createSplashWindow().catch(console.log);
});

ipcMain.on('open-file', (_event, fileName) => {
  console.log('Open File:', fileName);
  shell.openPath(fileName);
});
