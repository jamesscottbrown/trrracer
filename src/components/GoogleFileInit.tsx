import React, { useEffect, useState } from 'react';
const {google} = require('googleapis');
import { EventEmitter } from 'events';
import fs from 'fs';
const readline = require('readline');
import *  as googleCred from '../../assets/google_cred_desktop_app.json';
import { useProjectState } from './ProjectContext';
import { readFile } from '../fileUtil';


const GoogFileInit = (props: {entryIndex: number})=> {

  console.log('fiel created!');
  const [, dispatch] = useProjectState();

  const [showFileCreate, setShowFileCreate] = useState(false);

  const {entryIndex} = props;

  let fileName = "new google doc";

  function handleChange(event){
    fileName = event.target.value;
  }
  
  const saveGoogleFile = () => {

    console.log('save files NAME', fileName);
    
   createGoogleFile(entryIndex, fileName);
   setShowFileCreate(false);
    
  };

  async function testGoog(){
    const oAuth2Client = new google.auth.OAuth2(googleCred.installed.client_id, googleCred.installed.client_secret, googleCred.installed.redirect_uris[0])
    const token = await readFile('token.json')
    oAuth2Client.setCredentials(JSON.parse(token))
    console.log('init client');
    console.log('auth Instance', oAuth2Client)
    let drive = google.drive({version: 'v3', auth: oAuth2Client});
   
      var request = drive.request({
        'path': 'https://www.googleapis.com/upload/drive/v3/files',
        'method': 'Files:list',
        'params': {'includeItemsFromAllDrives': 'true'},
     });
  
    request.execute(function(file) {
      console.log('file from request',file)
    });
  // results = drive_service.files().list(, q="parents in '{folder_id}' and trashed = false", fields = "nextPageToken, files(id, name)").execute()
    
    
  }

  async function createGoogleFile(entryIndex: number, name : string){

    const oAuth2Client = new google.auth.OAuth2(googleCred.installed.client_id, googleCred.installed.client_secret, googleCred.installed.redirect_uris[0])
    const token = await readFile('token.json')
    oAuth2Client.setCredentials(JSON.parse(token))
    console.log('init client');
    console.log('auth Instance', oAuth2Client)
    let drive = google.drive({version: 'v3', auth: oAuth2Client});
    console.log('name in name', name);
    var parentId = '1ORoSWskcw9SCnBGpZd0oHxd08WL7iElE';//some parentId of a folder under which to create the new folder
    var fileMetadata = {
      'name' : name,
      'mimeType' : 'application/vnd.google-apps.document',
      'parents': [parentId]
    };
    drive.files.create({
      resource: fileMetadata,
    }).then(function(response) {
      switch(response.status){
        case 200:
          var file = response.result;
          console.log('Created Folder Id: ', response);
          dispatch({ type: 'CREATE_GDOC_IN_ENTRY', name: name, entryIndex })

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
          
          <button onClick={() => {
            testGoog();
            setShowFileCreate(false)}} type="button">
            Cancel
          </button>
          <input type="text" onChange={handleChange}/>
          <button onClick={()=> saveGoogleFile()} type="button">
          Create
          </button>
        </>
      ) : (
        <button onClick={()=> setShowFileCreate(true)} type="button">
        Create New Google Doc
        </button>
        
      )}
     
    </div>

  )


}

export default GoogFileInit;

