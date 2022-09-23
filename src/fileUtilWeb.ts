
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

    const name = fileName.endsWith('.gdoc') ? fileName.slice(0, -5) : fileName;
    window.open(`${folderPath}${name}`, '_blank');
  
};

export const readFile = (fileName: string) => {
  // In electron app, this opens file in desktop app; in web version we open in new tab instead

    return new Promise((resolve, reject) => {
      fetch(fileName).then((res) => resolve(res));
    });
  
};

//   writeFile,
export const writeFile = (fileName: string, content: any) => {

    console.error('Error: tried to call writeFile from read-only view');
  
};

export const readFileSync = async (filePath: string) => {

    const response = await fetch(filePath);
    return response;
  
};

export function joinPath(...args: string[]) {
  
    return [...args].join('');
  
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