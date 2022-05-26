import {
  openFile,
  readFile,
  writeFile,
  // decode,
  // decodeAttachment,
  readFileSync,
  stateUpdateWrapperUseJSON
} from './fileUtilElectron';

// import {
//   openFile,
//   readFile,
//   writeFile,
//   readFileSync,
//   joinPath,
//   stateUpdateWrapperUseJSON
// } from './fileUtilWeb';


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


export {
  openFile,
  readFile,
  writeFile,
  decode,
  decodeAttachment,
  readFileSync,
  // joinPath,
  stateUpdateWrapperUseJSON
};
