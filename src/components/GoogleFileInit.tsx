import React, { useEffect, useState } from 'react';
import * as fs from 'fs';
const {google} = require('googleapis');
import *  as googleCred from '../../assets/google_cred_desktop_app.json';
import { useProjectState } from './ProjectContext';
import { readFile } from '../fileUtil';
import {
  Button,
  ButtonGroup,
  Editable,
  EditableInput,
  EditablePreview,
  Heading,
  ListItem,
  UnorderedList,
} from '@chakra-ui/react';
import DataDisplayer from './CallFlask';


const GoogFileInit = (props: { fileType: string, text:string, entryIndex: number })=> {

  const {fileType, text, entryIndex} = props;

  const [state, dispatch] = useProjectState();
  const [showFileCreate, setShowFileCreate] = useState(false);
  const [googleFileName, setGoogleFileName] = useState(' "I need a name" ');

  const sendToFlask = async() =>{

    const response = await fetch(`http://127.0.0.1:5000/create_google_file/${googleFileName}/document/${entryIndex}/${state.projectData.title}`);

    setShowFileCreate(false);

    let newData = await response.json();

    dispatch({ type: 'CREATED_GOOGLE_IN_ENTRY', newProjectData: newData })
    
    // let test = await response.text();
    // console.log(test);
  } 

  async function createGoogleFile(name : string){
  
    const oAuth2Client = new google.auth.OAuth2(googleCred.installed.client_id, googleCred.installed.client_secret, googleCred.installed.redirect_uris[0])
    // const token = await readFile('token.json')
    const token = fs.readFileSync('token.json', {encoding: 'utf-8'});
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

          // dispatch({ type: 'CREATE_GOOGLE_IN_ENTRY', fileType: fileType, name: name, fileId: response.data.id, entryIndex })

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
          
            <Editable
            defaultValue={googleFileName}
            startWithEditView={true}
            onChange={(val)=> setGoogleFileName(val)}
            w="420px"
            boxShadow="xs" p="4" rounded="md" bg="white"
            >
          <EditablePreview 
          // display="inline"
          border="1px"
          borderColor="gray.200"
          boxShadow="sm" p="2"
          />
          <EditableInput 
          display="inline"
          />
          <ButtonGroup display="inline">
          <Button color="primary" display="inline-block" onClick={()=> sendToFlask()} type="button">
            Create
          </Button>
          <Button color="red.400" onClick={() => {
            setShowFileCreate(false)}} type="button">
            Cancel
          </Button>
          </ButtonGroup>
          </Editable>
      
        </>
      ) : (
        <Button m="3px" onClick={()=> {
          setShowFileCreate(true)}} type="button">
          {text}
        </Button>

      )}
     
    </div>

  )


}

export default GoogFileInit;

