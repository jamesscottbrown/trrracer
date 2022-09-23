const ipcRenderer = require('electron').ipcRenderer;
let path = require('path');
let fs = require('fs-extra');

//THESE STAY THE SAME
function decode(input: any) {
  if (!input) return '';
  const decodedBase64 = atob(input.replace(/-/g, '+').replace(/_/g, '/'));
  const escaped = escape(decodedBase64);
  return decodeURIComponent(escaped);
}

function decodeAttachment(input: any) {
  if (!input) return '';

  return atob(encodeURI(input.replace(/-/g, '+').replace(/_/g, '/')));
}

//THESE ARE COMBINED WEB AND ELECTRON
export const openFile = (fileName: string, folderPath: string) => {
  // In electron app, this opens file in desktop app; in web version we open in new tab instead
 
    console.log('Open file:', path.join(folderPath, fileName));
    ipcRenderer.send('open-file', path.join(folderPath, fileName));
 
};

export const readFile = (fileName: string) => {
  // In electron app, this opens file in desktop app; in web version we open in new tab instead
 
    return new Promise((resolve, reject) => {
      fs.readFile(fileName, (err, content) => {
        if (err) return reject(err);

        resolve(content);
      });
    });

};

//   writeFile,
export const writeFile = (fileName: string, content: any) => {
 
    return new Promise((resolve, reject) => {
      console.log('write file');
      fs.writeFile(fileName, content, (err) => {
        if (err) return reject(err);

        resolve(content);
      });
    });
 
};

export const readFileSync = async (filePath: string) => {
    return fs.readFileSync(filePath, { encoding: 'utf-8' });
};

export function joinPath(...args: string[]) {
    return path.join(...args);
}

export const stateUpdateWrapperUseJSON = (
  oldState: any,
  newState: any,
  updateFunction: (value: React.SetStateAction<any>) => void
) => {
  if (JSON.stringify(oldState) !== JSON.stringify(newState)) {
    updateFunction(newState);
  }
};
