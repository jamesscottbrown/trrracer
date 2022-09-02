import React, { useState } from 'react';
import {
  Button,
  ButtonGroup,
  Editable,
  EditableInput,
  EditablePreview,
} from '@chakra-ui/react';

import { getDriveFiles, createGoogleFile } from '../googleUtil';
import { useProjectState } from './ProjectContext';

let googleCred: any;
const isElectron = process.env.NODE_ENV === 'development';

if (isElectron) {
  googleCred = require('../../assets/google_cred_desktop_app.json');
}

const GoogFileInit = (props: {
  fileType: string;
  text: string;
  entryIndex: number;
}) => {
  const { fileType, text, entryIndex } = props;

  const [{ folderPath, googData }, dispatch] = useProjectState();
  const [showFileCreate, setShowFileCreate] = useState(false);
  const [googleFileName, setGoogleFileName] = useState(' "I need a name" ');

  const saveGoogleFile = () => {
    createGoogleFile(
      folderPath,
      googleFileName,
      fileType,
      googleCred,
      entryIndex
    ).then((googl) => {
      dispatch({
        type: 'CREATE_GOOGLE_IN_ENTRY',
        fileType: googl?.fileType,
        name: googl?.name,
        fileId: googl?.fileId,
        entryIndex: googl?.entryIndex,
      });
    });
    setShowFileCreate(false);
  };

  return (
    <div>
      {showFileCreate ? (
        <>
          <Editable
            defaultValue={googleFileName}
            startWithEditView={true}
            onChange={(val) => setGoogleFileName(val)}
            w="420px"
            boxShadow="xs"
            p="4"
            rounded="md"
            bg="white"
          >
            <EditablePreview
              // display="inline"
              border="1px"
              borderColor="gray.200"
              boxShadow="sm"
              p="2"
            />
            <EditableInput display="inline" />
            <ButtonGroup display="inline">
              <Button
                color="primary"
                display="inline-block"
                onClick={() => {
                  saveGoogleFile();
                }}
                type="button"
              >
                Create
              </Button>
              <Button
                color="red.400"
                onClick={() => {
                  getDriveFiles(folderPath, googleCred, googData).then(
                    (googOb) => {
                      dispatch({
                        type: 'UPDATE_GOOG_DOC_DATA',
                        googDocData: googOb.goog_doc_data,
                      });
                      // dispatch({type: 'UPDATE_GOOG_IDS', googFileIds: googOb.goog_file_ids});
                    }
                  );
                  setShowFileCreate(false);
                }}
                type="button"
              >
                Cancel
              </Button>
            </ButtonGroup>
          </Editable>
          {/* <input type="text" onChange={handleChange}/> */}
        </>
      ) : (
        <Button
          style={{ marginTop: 5, marginBottom: 5 }}
          onClick={() => {
            // getDriveFiles(folderPath, googleCred).then((googOb) => {

            //   dispatch({type: 'UPDATE_GOOG_DOC_DATA', googDocData: googOb.goog_doc_data});
            //   dispatch({type: 'UPDATE_GOOG_IDS', googFileIds: googOb.goog_file_ids});
            // });
            setShowFileCreate(true);
          }}
          type="button"
        >
          {text}
        </Button>
      )}
    </div>
  );
};

export default GoogFileInit;
