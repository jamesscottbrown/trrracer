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

import fs from 'fs';
import path from 'path';
import { app, Menu, BrowserWindow, ipcMain, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';

import { ProjectLoader } from './ProjectLoader';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

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

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }

    mainWindow.webContents.send('projectPath', projectPath);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

async function createSplashWindow() {
  const splashWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
  });

  //  app_window.loadURL(`file://${__dirname}/no-project-open.html`);

  splashWindow.loadFile('../assets/no-project-open.html');

  const fileManager = new ProjectLoader(splashWindow, openProjectWindow);

  // set open recent submenu
  const submenuOfOpenRecent = [];
  const paths = fileManager.readHistory();
  const allPaths = await paths;
  if (allPaths !== undefined) {
    allPaths.paths.map((path) => {
      submenuOfOpenRecent.push(
        {
          label: path,
          click() {
            fileManager.openRecentProject(path);
          },
        },
        { type: 'separator' }
      );
    });
  }

  // Declare all menu
  const menu_list = [
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
  ];

  // set the menu to desktop app
  const menu_design = Menu.buildFromTemplate(menu_list);
  Menu.setApplicationMenu(menu_design);

  // recieve new file data and path throught main and renderer method
  ipcMain.on('newdata', (e, arg) => {
    fs.writeFile(arg.path, arg.file, (err) => {
      if (err) {
        throw err;
      }
      console.log('data saved');
    });
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
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

ipcMain.on('open-file', (event, fileName) => {
  console.log('Open File:', fileName);
  shell.openPath(fileName);
});
