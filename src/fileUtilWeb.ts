export const openFile = (fileName: string, folderPath: string) => {
  // In electron app, this opens file in desktop app; in web version we open in new tab instead
  window.open(`${folderPath}/${fileName}`, '_blank');
};

export const readFile = (fileName: string) =>
  new Promise((resolve, reject) => {
    fetch(fileName).then((res) => resolve(res));
  });

//   writeFile,

export const writeFile = (fileName: string, content: any) => {
  console.log('Error: tried to call writeFile from read-only view');
};

export const readFileSync = async (filePath: string) => {
  const response = await fetch(filePath);
  return response;
};


export function joinPath(...args: string[]) {
  return [...args].join('/');
}
