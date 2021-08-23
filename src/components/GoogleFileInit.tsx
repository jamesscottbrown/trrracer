import React, { useEffect, useState } from 'react';
const {google} = require('googleapis');
import { EventEmitter } from 'events';
import fs from 'fs';
const readline = require('readline');
import *  as googleCred from '../../assets/google_cred_desktop_app.json';
import { useProjectState } from './ProjectContext';
import { readFile } from '../fileUtil';
import { workerData } from 'worker_threads';




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
    console.log('auth Instance', google)
    console.log('tokemn', oAuth2Client.credentials)
    let drive = google.drive({version: 'v3', auth: oAuth2Client});

    drive.files.list({
      q:"parents in '0AFyqaJXF-KkGUk9PVA' and trashed = false", 
      fields:"nextPageToken, files(id, name)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    }).then((folder)=> console.log('folder',folder))

    // let url = `https://www.googleapis.com/drive/v3/about`
    // var xmlHttp = new XMLHttpRequest();
    // xmlHttp.onreadystatechange = function() { 
    //     if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
    //       console.log('this worked', xmlHttp.responseText)
    //     }else{
    //       console.log('error')
    //     }
    //         //callback(xmlHttp.responseText);
    // }
    // xmlHttp.open("GET", url, true); // true for asynchronous 
    // xmlHttp.setRequestHeader('Authorization', 'Bearer ' + oAuth2Client.credentials.access_token);
    // xmlHttp.send(null);

            // const boundary='foo_bar_baz'
        // const delimiter = "\r\n--" + boundary + "\r\n";
        // const close_delim = "\r\n--" + boundary + "--";
        // var fileName='note-otti';
        // var fileData='hi otti';
        // var contentType='text/plain'
        // var metadata = {
        //   'name': fileName,
        //   'mimeType': contentType
        // };

        // var multipartRequestBody =
        //   delimiter +
        //   'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        //   JSON.stringify(metadata) +
        //   delimiter +
        //   'Content-Type: ' + contentType + '\r\n\r\n' +
        //   fileData+'\r\n'+
        //   close_delim;

        //   console.log('multi request body',multipartRequestBody);
        //   console.log('gapi client', window.gapi.client);
        //   var request = window.gapi.client.request({
        //     'path': 'https://www.googleapis.com/upload/drive/v3/files',
        //     'method': 'POST',
        //     'params': {'uploadType': 'multipart'},
        //     'headers': {
        //       'Content-Type': 'multipart/related; boundary=' + boundary + ''
        //     },
        //     'body': multipartRequestBody});
        // console.log('request', request)
        // request.execute(function(file) {
        //   console.log(file)
        // });
   // xmlHttp.send(null);

    
    //   var request = google.request({
    //     'path': 'https://www.googleapis.com/upload/drive/v3/files',
    //     'method': 'Files:list',
    //     'params': {'includeItemsFromAllDrives': 'true'},
    //  });
  
    // request.execute(function(file) {
    //   console.log('file from request testGoog',file)
    // });
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
    var parentId = '1-tPBWWUaf7CzNYRyVOqfZvmYg3I4r9Zg';//some parentId of a folder under which to create the new folder
    var fileMetadata = {
      'name' : name,
      'mimeType' : 'application/vnd.google-apps.document',
      'parents': [parentId],
   
    };
    drive.files.create({
      resource: fileMetadata,
      media: {
        mimeType: 'application/vnd.google-apps.document',
       // body: stream
    },
      supportsAllDrives: true,
    }).then(function(response) {
      switch(response.status){
        case 200:
          var file = response.result;
          console.log('Created File data', response, response.data.id);

          

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
        <button onClick={()=> {
          testGoog();
          setShowFileCreate(true)}} type="button">
        Create New Google Doc
        </button>
        
      )}
     
    </div>

  )


}

export default GoogFileInit;

