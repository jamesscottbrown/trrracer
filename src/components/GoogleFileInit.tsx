import React, { useState } from 'react';
const {google} = require('googleapis');
import *  as googleCred from '../../assets/google_cred_desktop_app.json';
import { useProjectState } from './ProjectContext';
import { readFile } from '../fileUtil';
import { Button } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';

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
    console.log('fileType', fileType);
    const oAuth2Client = new google.auth.OAuth2(googleCred.installed.client_id, googleCred.installed.client_secret, googleCred.installed.redirect_uris[0])
    const token = await readFile('token.json')
    oAuth2Client.setCredentials(JSON.parse(token))
    console.log('init client');
    console.log('auth Instance', oAuth2Client)
    let drive = google.drive({version: 'v3', auth: oAuth2Client});
    console.log('name in name', name);
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
          console.log('Created File data', response, response.data.id);

          

          dispatch({ type: 'CREATE_GOOGLE_IN_ENTRY', fileType: fileType, name: name, entryIndex })

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
          
          <Button color="primary" onClick={() => {
            testGoog();
            setShowFileCreate(false)}} type="button">
            Cancel
          </Button>
          <TextField onChange={handleChange}></TextField>
          {/* <input type="text" onChange={handleChange}/> */}
          <Button color="primary" onClick={()=> saveGoogleFile()} type="button">
          Create
          </Button>
        </>
      ) : (
        <Button color="primary" onClick={()=> {
          testGoog();
          setShowFileCreate(true)}} type="button">
          {text}
        </Button>
        
      )}
     
    </div>

  )


}

export default GoogFileInit;

