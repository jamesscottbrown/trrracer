const isElectron = process.env.NODE_ENV === 'development';
let ipcRenderer: any;
let path: any;
let fs: any;

if(isElectron){
  ipcRenderer = require('electron').ipcRenderer
  path = require('path');
  fs = require('fs-extra');
}

//THESE STAY THE SAME
function decode(input:any) {
  if (!input) return '';
  const decodedBase64 = atob(input.replace(/-/g, '+').replace(/_/g, '/'));
  const escaped = escape(decodedBase64);
  return decodeURIComponent(escaped);
}

function decodeAttachment(input:any) {
  if (!input) return '';

  return atob(encodeURI(input.replace(/-/g, '+').replace(/_/g, '/')));
}


//THESE ARE COMBINED WEB AND ELECTRON
export const openFile = (fileName: string, folderPath: string) => {
  // In electron app, this opens file in desktop app; in web version we open in new tab instead
  if(isElectron){
    console.log('Open file:', path.join(folderPath, fileName));
    ipcRenderer.send('open-file', path.join(folderPath, fileName));

  }else{
    window.open(`${folderPath}${fileName}`, '_blank');
  }
  
};

export const readFile = (fileName: string) => {
  // In electron app, this opens file in desktop app; in web version we open in new tab instead
  if(isElectron){

    return new Promise((resolve, reject) => {
      fs.readFile(fileName, (err, content) => {
        if (err) return reject(err);
  
        resolve(content);
      });
    });

  }else{

    return new Promise((resolve, reject) => {
      fetch(fileName).then((res) => resolve(res));
    });

  }
  
};
  

//   writeFile,
export const writeFile = (fileName: string, content: any) => {
  if(isElectron){

    return new Promise((resolve, reject) => {
      console.log('write file');
      fs.writeFile(fileName, content, (err) => {
        if (err) return reject(err);
  
        resolve(content);
      });
    });

  }else{

    console.log('Error: tried to call writeFile from read-only view');

  }
  
};

export const readFileSync = async (filePath: string) => {

  if(isElectron){

    return fs.readFileSync(filePath, { encoding: 'utf-8' });

  }else{
    const response = await fetch(filePath);
    return response;
  }
  
};


export function joinPath(...args: string[]) {
  if(isElectron){

    return path.join(...args);

  }else{
    return [...args].join('');
  }
}

export const stateUpdateWrapperUseJSON = (oldState: any, newState: any, updateFunction: (value: React.SetStateAction<any>) => void) => {
    if (JSON.stringify(oldState) !== JSON.stringify(newState)) {
      updateFunction(newState);
    }
};
