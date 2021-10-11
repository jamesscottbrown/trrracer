import React, { useState } from 'react';
const {google} = require('googleapis');
import *  as googleCred from '../../assets/google_cred_desktop_app.json';
import { useProjectState } from './ProjectContext';
import { readFile } from '../fileUtil';


const GoogFileInit = (props: { fileType: string, text:string, entryIndex: number })=> {

  const [, dispatch] = useProjectState();
  const [showFileCreate, setShowFileCreate] = useState(false);
  const {fileType, text, entryIndex} = props;


  let fileName = "new google doc";

  function handleChange(event){
    fileName = event.target.value;
  }
  
  const saveGoogleFile = () => {

    console.log('save files NAME', fileName);
    
   createGoogleFile(fileName);
   setShowFileCreate(false);
    
  };

  async function testGoog(){
    const oAuth2Client = new google.auth.OAuth2(googleCred.installed.client_id, googleCred.installed.client_secret, googleCred.installed.redirect_uris[0])
    const token = await readFile('token.json')
    oAuth2Client.setCredentials(JSON.parse(token))
    console.log('init client');
    console.log('auth Instance', google)
    console.log('tokemn', oAuth2Client.credentials)
    let drive = google.drive({version: 'v3', auth: oAuth2Client});

    drive.files.list({
      q:"parents in '0AFyqaJXF-KkGUk9PVA' and trashed = false", 
      fields:"nextPageToken, files(id, name)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    }).then((folder)=> console.log('folder',folder))

    
  }

  async function createGoogleFile(name : string){
  
    const oAuth2Client = new google.auth.OAuth2(googleCred.installed.client_id, googleCred.installed.client_secret, googleCred.installed.redirect_uris[0])
    const token = await readFile('token.json')
    oAuth2Client.setCredentials(JSON.parse(token))
    
    let drive = google.drive({version: 'v3', auth: oAuth2Client});
  
    var parentId = '1-tPBWWUaf7CzNYRyVOqfZvmYg3I4r9Zg';//some parentId of a folder under which to create the new folder
    var fileMetadata = {
      'name' : name,
      'mimeType' : `application/vnd.google-apps.${fileType}`,
      'parents': [parentId],
   
    };
    drive.files.create({
      resource: fileMetadata,
      supportsAllDrives: true,
    }).then(function(response) {
      switch(response.status){
        case 200:
          var file = response.result;
          console.log('Created File data google', response, response.data.id);

          

          dispatch({ type: 'CREATE_GOOGLE_IN_ENTRY', fileType: fileType, name: name, fileId: response.data.id, entryIndex })

          break;
        default:
          console.log('Error creating the folder, '+response);
          break;
        }
    });
  }

  return(

    <div>
     {showFileCreate ? (
        <>
          
          <button color="primary" onClick={() => {
            testGoog();
            setShowFileCreate(false)}} type="button">
            Cancel
          </button>
       
          <form>
            <label>
                <input onChange={handleChange} type="text" />
            </label>
            </form>
          {/* <input type="text" onChange={handleChange}/> */}
          <button color="primary" onClick={()=> saveGoogleFile()} type="button">
          Create
          </button>
        </>
      ) : (
        <button color="primary" onClick={()=> {
          testGoog();
          setShowFileCreate(true)}} type="button">
          {text}
        </button>
        
      )}
     
    </div>

  )


}

export default GoogFileInit;

