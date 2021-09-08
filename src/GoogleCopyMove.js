const {google} = require('googleapis');
import *  as googleCred from '../assets/google_cred_desktop_app.json';
import { readFile } from './fileUtil';
import { useProjectState } from './components/ProjectContext';



export const copyMoveGoogle = async (file, callback) => {
   // const [, dispatch] = useProjectState();

    console.log('file in copy Move Google',file);
    const oAuth2Client = new google.auth.OAuth2(googleCred.installed.client_id, googleCred.installed.client_secret, googleCred.installed.redirect_uris[0])
    const token = await readFile('token.json')
    oAuth2Client.setCredentials(JSON.parse(token))
    console.log('init client');
    console.log('auth Instance', google)
    console.log('tokemn', oAuth2Client.credentials)
    let drive = google.drive({version: 'v3', auth: oAuth2Client});
    console.log(file.name)
    let nameF = file.name.split('.');
    drive.files.list({
      q:`name="${nameF[0]}" and trashed = false`, 
      fields:"nextPageToken, files(id, name)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    }).then((fi)=> {
        console.log('fi',fi)
        
        
        var copyRequest = {  // Modified
            name: nameF,
            parents: ['1-tPBWWUaf7CzNYRyVOqfZvmYg3I4r9Zg']
          };
          
          drive.files.copy(
            {  // Modified
              fileId: fi.data.files[0].id,
              requestBody: copyRequest, // or resource: copyRequest
              supportsAllDrives: true,
              includeItemsFromAllDrives: true,
            },
            function(err, response) {
              if (err) {
                console.log(err);
                // res.send("error");
                return;
              }
             
              console.log('response', response)
              dispatch({ type: 'CREATE_GOOGLE_IN_ENTRY', fileType: fileType, name: file.name, entryIndex })
            }
          );
    
    });
       

}