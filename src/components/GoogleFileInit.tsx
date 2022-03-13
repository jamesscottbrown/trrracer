import React, { useState } from 'react';
import {
  Button,
  ButtonGroup,
  Editable,
  EditableInput,
  EditablePreview,
} from '@chakra-ui/react';
import { useProjectState } from './ProjectContext';

const GoogFileInit = (props: {
  fileType: string;
  text: string;
  entryIndex: number;
}) => {
  const { fileType, text, entryIndex } = props;

  const [state, dispatch] = useProjectState();
  const [showFileCreate, setShowFileCreate] = useState(false);
  const [googleFileName, setGoogleFileName] = useState(' "I need a name" ');

  const sendToFlask = async () => {
    setShowFileCreate(false);

    const response = await fetch(
      `http://127.0.0.1:5000/create_google_file/${googleFileName}/${fileType}/${entryIndex}/${state.projectData.title}`
    );

    const newData = await response.json();

    dispatch({ type: 'CREATED_GOOGLE_IN_ENTRY', newProjectData: newData });
  };

  console.log('STATE', state);

  return (
    <div>
      {showFileCreate ? (
        <>
          <Editable
            defaultValue={googleFileName}
            startWithEditView
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
                onClick={() => sendToFlask()}
                type="button"
              >
                Create
              </Button>
              <Button
                color="red.400"
                onClick={() => {
                  setShowFileCreate(false);
                }}
                type="button"
              >
                Cancel
              </Button>
            </ButtonGroup>
          </Editable>
        </>
      ) : (
        <Button
          m="3px"
          onClick={() => {
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
