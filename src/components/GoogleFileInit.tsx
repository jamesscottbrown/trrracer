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

  const {entryIndex} = props;
  
  const saveGoogleFile = () => {
    console.log('save fiels', entryIndex);
    
    //createGoogleFile(entryIndex, 'testing-file-make');
   createGoogleFile(entryIndex, 'testing-files');
    
  };

  async function createGoogleFile(entryIndex: number, name : string){

    const oAuth2Client = new google.auth.OAuth2(googleCred.installed.client_id, googleCred.installed.client_secret, googleCred.installed.redirect_uris[0])
    const token = await readFile('token.json')
    oAuth2Client.setCredentials(JSON.parse(token))
    console.log('init client');
    console.log('auth Instance', oAuth2Client)
    let drive = google.drive({version: 'v3', auth: oAuth2Client});
  
    var parentId = '159mYuPKRRR15EI9m-yWXsGFLt8evWcHP';//some parentId of a folder under which to create the new folder
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
          dispatch({ type: 'CREATE_GDOC_IN_ENTRY', entryIndex })

          break;
        default:
          console.log('Error creating the folder, '+response);
          break;
        }
    });
  }

  return(
    <>
      <button onClick={()=> saveGoogleFile()} type="button">
      Create New Google Doc
      </button>
    </>

  )


}

export default GoogFileInit;

