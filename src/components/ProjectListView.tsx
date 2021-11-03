import path from 'path';
import React, { useState, useEffect } from 'react';
import {
  Button,
  ButtonGroup,
  Checkbox,
  Divider,
  Heading,
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash, FaPlus } from 'react-icons/fa';

import { useProjectState } from './ProjectContext';
import { EntryType, FileObj, ProjectViewProps } from './types';
import Entry from './Entry';
import FileUpload from './FileUpload';
import TagList from './TagList';
import ReadonlyEntry from './ReadonlyEntry';

const { ipcRenderer } = require('electron');

const ProjectListView = (ProjectPropValues: ProjectViewProps) => {
  const { projectData, folderPath } = ProjectPropValues;

  const [{ filterTags }, dispatch] = useProjectState();
  const [editable, setEditable] = useState<boolean[]>(
    Array.from(Array(projectData.entries.length), (_, x) => false)
  );
  const [reversedOrder, setReversedOrder] = useState<boolean>(false);

  useEffect(() => {
    if (editable.length === projectData.entries.length - 1) {
      // one more entry was added
      setEditable([...editable, true]);
    } else if (editable.length !== projectData.entries.length) {
      setEditable(
        Array.from(Array(projectData.entries.length), (_, x) => false)
      );
    }
  }, [projectData]);

  console.log(projectData);

  // TODO: add files to json file and save
  console.log('projectData:', projectData);

  const saveFiles = (fileList: FileObj[]) => {
    dispatch({ type: 'ADD_FILES', fileList });
  };

  const addEntry = () => {
    dispatch({ type: 'ADD_ENTRY' });
  };

  const updateEntryField = (
    entryIndex: number,
    fieldName: string,
    newValue: any
  ) => {
    dispatch({ type: 'UPDATE_ENTRY_FIELD', entryIndex, fieldName, newValue });
  };

  const openFile = (fileName: string) => {
    console.log('Open file:', path.join(folderPath, fileName));
    ipcRenderer.send('open-file', path.join(folderPath, fileName));
  };

  const filteredEntries = projectData.entries.filter((entryData: EntryType) => {
    return filterTags.every((requiredTag: string) =>
      entryData.tags.includes(requiredTag)
    );
  });
  filteredEntries.sort(
    (a, b) =>
      (reversedOrder ? -1 : +1) *
      (Number(new Date(a.date)) - Number(new Date(b.date)))
  );

  const makeAllEditable = () => {
    setEditable(Array.from(Array(projectData.entries.length), (_, x) => true));
  };

  const makeAllNonEditable = () => {
    setEditable(Array.from(Array(projectData.entries.length), (_, x) => false));
  };

  const setEditableStatus = (index: number, isEditable: boolean) => {
    setEditable((oldEditable) =>
      oldEditable.map((d, i) => (i === index ? isEditable : d))
    );
  };

  return (
    <div style={{ padding: '10px' }}>
      <TagList tags={projectData.tags} />

      <Heading as="h2">Entries</Heading>

      <Checkbox
        checked={reversedOrder}
        onChange={(e) => setReversedOrder(e.target.checked)}
      >
        Reverse chronological order
      </Checkbox>
      <br />

      <ButtonGroup style={{ display: 'inline' }}>
        {!editable.every((t) => t) && (
          <Button onClick={makeAllEditable} type="button">
            <FaEye />
            Show edit controls for all entries
          </Button>
        )}
        {!editable.every((t) => !t) && (
          <Button onClick={makeAllNonEditable} type="button">
            <FaEyeSlash /> Hide edit controls for all entries
          </Button>
        )}
      </ButtonGroup>

      <br />

      {filteredEntries.map((entryData: EntryType, i: number) => (
        <>
          {editable[i] ? (
            <Entry
              /* eslint-disable-next-line react/no-array-index-key */
              key={i}
              entryData={entryData}
              entryIndex={i}
              openFile={openFile}
              updateEntryField={updateEntryField}
              allTags={projectData.tags}
              makeNonEditable={() => setEditableStatus(i, false)}
            />
          ) : (
            <ReadonlyEntry
              /* eslint-disable-next-line react/no-array-index-key */
              key={i}
              entryData={entryData}
              openFile={openFile}
              makeEditable={() => setEditableStatus(i, true)}
            />
          )}

          <Divider marginTop="1em" marginBottom="1em" />
        </>
      ))}

      <Button onClick={addEntry} type="button">
        <FaPlus /> Add entry
      </Button>

      <FileUpload
        saveFiles={saveFiles}
        containerStyle={{}}
        msg={
          <>
            Drag and drop some files here, or <b>click to select files</b>,
            create a new entry.
          </>
        }
      />
    </div>
  );
};
export default ProjectListView;
