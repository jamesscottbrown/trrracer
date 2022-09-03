import { readFileSync } from './fileUtil';
// const {google} = require('googleapis');
const isElectron = process.env.NODE_ENV === 'development';
const { google } = isElectron ? require('googleapis') : {};
// const OAuth2Client = google ? google.auth.OAuth2 : null;

const { OAuth2Client } = google ? require('google-auth-library') : {};

// const {googleCred} = isElectron ? require('../assets/google_cred_desktop_app.json') : {};

export function googleFolderDict(folder) {
  if (folder?.includes('EvoBio')) {
    return '120QnZNEmJNF40VEEDnxq1F80Dy6esxGC';
  }
  if (folder?.includes('Derya')) {
    return '1-tPBWWUaf7CzNYRyVOqfZvmYg3I4r9Zg';
  }
  if (folder?.includes('Jen')) {
    return '1-SzcYM_4-ezaFaFguQTJ0sOCtW2gB0Rp';
  }
  if (folder?.includes('Ethics of Exit')) {
    return '1GOu9GPI3_mLk8zXc08CNYkG-WfapQkAj';
  }
  alert('google folder not found');
  return null;
}

export async function getDriveFiles(folderName, googleCred, loadedData) {
  // const oAuth2Client = new google.auth.OAuth2(googleCred.installed.client_id, googleCred.installed.client_secret, googleCred.installed.redirect_uris[0])
  // const oAuth2Client = new OAuth2Client(googleCred.installed.client_id, googleCred.installed.client_secret, googleCred.installed.redirect_uris[0])
  // ABOVE IS THE OLD _ THIS IS THROWING ERROR SO TRYING NEW

  const oAuth2Client = new OAuth2Client(
    googleCred.installed.client_id,
    googleCred.installed.client_secret,
    googleCred.installed.redirect_uris[0]
  );

  const token = await readFileSync('token.json');
  oAuth2Client.setCredentials(JSON.parse(token));

  const drive = google.drive({ version: 'v3', auth: oAuth2Client });
  const docs = google.docs({ version: 'v1', auth: oAuth2Client });
  const parentId = googleFolderDict(folderName);

  /**
     * HTTP REQUEST FOR BELOW COMMAND FOR GETTING DRIVE LIST
     *
     * GET https://www.googleapis.com/drive/v3/files?includeItemsFromAllDrives=true&pageSize=1000&q='120QnZNEmJNF40VEEDnxq1F80Dy6esxGC'%20in%20parents%20and%20trashed%20%3D%20false&supportsAllDrives=true&supportsTeamDrives=true&key=[YOUR_API_KEY] HTTP/1.1
        Authorization: Bearer [YOUR_ACCESS_TOKEN]
        Accept: application/json
     */

  console.log('LOADED DATA', loadedData);      

  const googData = (loadedData && Object.keys(loadedData).length > 1) ? loadedData : {};
  googData['revisionDate'] = new Date();
  const googFileIds = {};

  const fileList = await drive.files.list({
    q: `'${parentId}' in parents and trashed = false`,
    fields:"*",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    supportsTeamDrives: true,
    pageSize: 1000,
    
  });

  const filterList = fileList.data.files.filter((file, i)=> {
    let isNewer = new Date(file.modifiedTime) > new Date(loadedData.revisionDate);
    let isthere = Object.keys(loadedData).indexOf(file.id) === -1;
    return isNewer || isthere;
  });

  let filZ = await filterList.map(async (m) => {

    if (m.mimeType === 'application/vnd.google-apps.document') {
      let docStuff = await docs.documents.get({
        documentId: m.id,
      });

      googData[m.id] = docStuff.data;
    }
    googFileIds[m.name] = { googId: m.id };
  });

  return { goog_doc_data: await googData, goog_file_ids: googFileIds };
}

export async function createGoogleFile(
  folderPath,
  name,
  fileType,
  googleCred,
  entryIndex
) {
  const oAuth2Client = new google.auth.OAuth2(
    googleCred.installed.client_id,
    googleCred.installed.client_secret,
    googleCred.installed.redirect_uris[0]
  );

  const token = await readFileSync('token.json');
  oAuth2Client.setCredentials(JSON.parse(token));

  const drive = google.drive({ version: 'v3', auth: oAuth2Client });

  const parentId = googleFolderDict(folderPath); // some parentId of a folder under which to create the new folder
  const fileMetadata = {
    name,
    mimeType: `application/vnd.google-apps.${fileType}`,
    parents: [parentId],
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    supportsAllDrives: true,
  });

  switch (response.status) {
    case 200:
      const file = response.result;
      //   dispatch({ type: 'CREATE_GOOGLE_IN_ENTRY', fileType: fileType, name: name, fileId: response.data.id, entryIndex })
      return {
        fileType,
        name,
        fileId: response.data.id,
        entryIndex,
      };
    default:
      console.log(`Error creating the folder, ${response}`);
      break;
  }

  return null;
}
