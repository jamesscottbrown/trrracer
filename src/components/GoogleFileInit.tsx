import React, { useState } from 'react';
import {getDriveFiles, createGoogleFile} from '../googleUtil'
import { useProjectState } from './ProjectContext';
import {
  Button,
  ButtonGroup,
  Editable,
  EditableInput,
  EditablePreview
} from '@chakra-ui/react';

let googleCred: any;
const isElectron = process.env.NODE_ENV === 'development';

if(isElectron){
  googleCred = require('../../assets/google_cred_desktop_app.json');
}

const GoogFileInit = (props: { fileType: string, text:string, entryIndex: number })=> {

  const {fileType, text, entryIndex} = props;

  const [{folderPath}, dispatch] = useProjectState();
  const [showFileCreate, setShowFileCreate] = useState(false);
  const [googleFileName, setGoogleFileName] = useState(' "I need a name" ');
  
  const saveGoogleFile = () => {
    
    createGoogleFile(folderPath, googleFileName, fileType, googleCred, entryIndex).then((googl)=> {
      
      dispatch({ type: 'CREATE_GOOGLE_IN_ENTRY', fileType: googl?.fileType, name: googl?.name, fileId: googl?.fileId, entryIndex: googl?.entryIndex })
    });
    
    setShowFileCreate(false);
    
  };


  // async function createGoogleFile(name : string){
  
  //   const oAuth2Client = new google.auth.OAuth2(googleCred.installed.client_id, googleCred.installed.client_secret, googleCred.installed.redirect_uris[0])
    
  //   const token = await readFileSync('token.json');
  //   oAuth2Client.setCredentials(JSON.parse(token))
    
  //   let drive = google.drive({version: 'v3', auth: oAuth2Client});
  
  //   var parentId = googleFolderDict(folderPath);//some parentId of a folder under which to create the new folder
  //   var fileMetadata = {
  //     'name' : name,
  //     'mimeType' : `application/vnd.google-apps.${fileType}`,
  //     'parents': [parentId],
   
  //   };
  //   drive.files.create({
  //     resource: fileMetadata,
  //     supportsAllDrives: true,
  //   }).then(function(response) {
  //     switch(response.status){
  //       case 200:
  //         var file = response.result;
  //         console.log('Created File data google', response, response.data.id);

  //         dispatch({ type: 'CREATE_GOOGLE_IN_ENTRY', fileType: fileType, name: name, fileId: response.data.id, entryIndex })

  //         break;
  //       default:
  //         console.log('Error creating the folder, '+response);
  //         break;
  //       }
  //   });
  // }

  return(
    // <div>{'test'}</div>
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
          <Button 
          color="primary" 
          display="inline-block" 
          onClick={()=> {
            
            saveGoogleFile()}} 
            type="button">
            Create
          </Button>
          <Button color="red.400" 
          onClick={() => {
            getDriveFiles(folderPath, googleCred).then((googOb) => {
              console.log(googOb);
              dispatch({type: 'UPDATE_GOOG_DOC_DATA', googDocData: googOb.goog_doc_data});
              dispatch({type: 'UPDATE_GOOG_IDS', googFileIds: googOb.goog_file_ids});
            });
            setShowFileCreate(false);
          }} 
            type="button">
            Cancel
          </Button>
          </ButtonGroup>
          </Editable>
          {/* <input type="text" onChange={handleChange}/> */}
        </>
      ) : (
        <Button m="3px" 
        onClick={()=> {
          getDriveFiles(folderPath, googleCred).then((googOb) => {
            console.log(googOb);
            dispatch({type: 'UPDATE_GOOG_DOC_DATA', googDocData: googOb.goog_doc_data});
            dispatch({type: 'UPDATE_GOOG_IDS', googFileIds: googOb.goog_file_ids});
          });
          setShowFileCreate(true)}} 
          type="button">
          {text}
        </Button>
      )} 
      
    </div>
  )
}

export default GoogFileInit;