/* eslint no-console: off */

import path from 'path';

import emptyProject from './emptyProject.json';

const os = require('os');
const fs = require('fs-extra');
const { app, dialog } = require('electron');

class ProjectLoader {
  constructor(splashWindow, openProject) {
    const { homedir, username } = os.userInfo();
    this.homedir = homedir;
    this.username = username;

    //
    console.log('User data path:', app.getPath('userData'));
    this.historyPath = path.join(
      app.getPath('userData'),
      'recentlyOpened.json'
    );

    this.app_window = splashWindow;
    this.open_project = openProject;
  }

  saveHistory(path) {
    fs.ensureFile(this.historyPath, (err) => {
      if (err) {
        throw err;
      }

      fs.readJson(this.historyPath, { throws: false }).then((hist) => {
        const otherPaths =
          hist == null ? [] : hist.paths.filter((p) => p !== path);
        fs.writeFile(
          this.historyPath,
          JSON.stringify({ ...hist, paths: [...otherPaths, path] })
        );
      });
    });
  }

  readHistory() {
    return fs
      .readJson(this.historyPath, { throws: false })
      .then((res) => res)
      .catch((err) => {
        console.log('Error loading lsit of recently opened files:', err);
      });
  }

  newProjectPicker() {
    dialog
      .showSaveDialog(this.app_window, {
        properties: ['openDirectory', 'createDirectory'],
      })
      .then((res) => {
        if (!res.canceled) {
          console.log('Res:', res);
          const folderName = res.filePath;
          const jsonPath = path.join(folderName, 'trrrace.json');

          fs.stat(jsonPath, (err) => {
            if (err == null) {
              // already exists
              dialog.showErrorBox(
                'Cannot create project',
                `A new project cannot be created at (${folderName}), as a file or directory already exists at this location.`
              );
            } else if (err.code === 'ENOENT') {
              // file does not exist

              // create directory
              fs.mkdirp(folderName, (mkdirErr) => {
                if (mkdirErr) {
                  dialog.showErrorBox(
                    'Cannot create project directory',
                    `Attempting to create the directory (${folderName}) failed with the error ${mkdirErr}.`
                  );
                }

                fs.writeFile(
                  path.join(folderName, 'trrrace.json'),
                  JSON.stringify(emptyProject),
                  (writeErr) => {
                    if (writeErr) {
                      dialog.showErrorBox(
                        `Error`,
                        `An error occurred creating the trrrace.json file: ${writeErr}`
                      );
                      return;
                    }

                    this.saveHistory(folderName);
                    this.open_project(folderName);
                  }
                );
              });
            } else {
              console.log(
                `Some other error encountered trying to open: ${jsonPath}: ${err.code}`
              );
            }
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  openProjectPicker() {
    dialog
      .showOpenDialog(this.app_window, { properties: ['openDirectory'] })
      .then((res) => {
        if (!res.canceled) {
          const folderName = res.filePaths[0];
          const jsonPath = path.join(folderName, 'trrrace.json');
          fs.stat(jsonPath, (err) => {
            if (err == null) {
              // file exists
              this.saveHistory(folderName);
              this.open_project(folderName);
            } else if (err.code === 'ENOENT') {
              // file does not exist
              dialog.showErrorBox(
                'Not a Trrracer project',
                `The selected directory (${folderName}) is not a valid Trracer project - it does not contain a trrrace.json file`
              );
            } else {
              console.log(
                `Some other error encountered trying to open: ${jsonPath}: ${err.code}`
              );
            }
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  openRecentProject(path) {
    console.log('Opening recent:', path);
    this.open_project(path);
  }
}

export { ProjectLoader };
