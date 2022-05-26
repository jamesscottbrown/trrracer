import { ipcRenderer } from 'electron';
import path from 'path';

const os = require('os');
const fs = require('fs-extra');

export const openFile = (fileName, folderPath) => {
  console.log('Open file:', path.join(folderPath, fileName));
  ipcRenderer.send('open-file', path.join(folderPath, fileName));
};

export const readFile = (fileName) =>
  new Promise((resolve, reject) => {
    fs.readFile(fileName, (err, content) => {
      if (err) return reject(err);

      resolve(content);
    });
  });

export const writeFile = (fileName, content) =>
  new Promise((resolve, reject) => {
    console.log('write file');
    fs.writeFile(fileName, content, (err) => {
      if (err) return reject(err);

      resolve();
    });
  });

export const readFileSync = (filePath: string) =>
  fs.readFileSync(filePath, { encoding: 'utf-8' });

export function joinPath(...args){
  return path.join(...args);
};

export const stateUpdateWrapperUseJSON = (oldState: any, newState: any, updateFunction: (value: React.SetStateAction<any>) => void) => {
    if (JSON.stringify(oldState) !== JSON.stringify(newState)) {
        updateFunction(newState);
    }
};
