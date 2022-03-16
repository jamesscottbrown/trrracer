import path from 'path';
import React, { useState, useEffect } from 'react';
import { Button, ButtonGroup, Divider } from '@chakra-ui/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import { useProjectState } from './ProjectContext';

import { EntryTypeWithIndex, ProjectViewProps } from './types';

import Entry from './Entry';
import ReadonlyEntry from './ReadonlyEntry';

const { ipcRenderer } = require('electron');

export const openFile = (fileName: string, folderPath: string) => {
  console.log('Open file:', path.join(folderPath, fileName));
  ipcRenderer.send('open-file', path.join(folderPath, fileName));
};

const ProjectListView = (ProjectPropValues: ProjectViewProps) => {
  const {
    projectData,
    filteredActivites,
    setViewType,
    setSelectedArtifactIndex,
    setSelectedArtifactEntry,
    selectedEntryIndex, 
    setSelectedEntryIndex,
  } = ProjectPropValues;

  const [{hoverActivity}, dispatch] = useProjectState();

  const [editable, setEditable] = useState<boolean[]>(
    Array.from(Array(projectData.entries.length), (_, x) => false)
  );

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


  useEffect(() => {

    setEditable(
      Array.from(Array(projectData.entries.length), (_, x) => false)
    );
    setEditableStatus(selectedEntryIndex, true);
   
  }, [selectedEntryIndex]);


  useEffect(()=> {
    console.log('this is workingg', hoverActivity, filteredActivites)
  }, [hoverActivity]);

  const updateEntryField = (
    entryIndex: number,
    fieldName: string,
    newValue: any
  ) => {
    dispatch({ type: 'UPDATE_ENTRY_FIELD', entryIndex, fieldName, newValue });
  };

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
      <div
        style={{
          position: 'fixed',
          top: '170px',
          fontSize: 24,
          fontWeight: 700,
          textAlign: 'center',
        }}
      >{`${filteredActivites.length} Activities Shown`}</div>

      <ButtonGroup style={{ display: 'inline' }}>
        {!editable.every((t) => t) && (
          <Button onClick={makeAllEditable} type="button">
            <FaEye />
            Show edit controls for all activities
          </Button>
        )}
        {!editable.every((t) => !t) && (
          <Button onClick={makeAllNonEditable} type="button">
            <FaEyeSlash /> Hide edit controls for all activities
          </Button>
        )}
      </ButtonGroup>

      <br />

      {filteredActivites.map((entryData: EntryTypeWithIndex, i: number) => (
        <React.Fragment key={`fr-${entryData.title}-${entryData.index}-${i}`}>
          {editable[entryData.index] ? (
            <Entry
              /* eslint-disable-next-line react/no-array-index-key */
              key={`en-${entryData.title}-${entryData.index}-${i}`}
              entryData={entryData}
              entryIndex={entryData.index}
              openFile={openFile}
              updateEntryField={updateEntryField}
              allTags={projectData.tags}
              makeNonEditable={() => setEditableStatus(entryData.index, false)}
            />
          ) : (
            <ReadonlyEntry
              /* eslint-disable-next-line react/no-array-index-key */
              key={`ro-${entryData.title}-${entryData.index}-${i}`}
              entryData={entryData}
              openFile={openFile}
              setViewType={setViewType}
              setSelectedArtifactIndex={setSelectedArtifactIndex}
              setSelectedArtifactEntry={setSelectedArtifactEntry}
              makeEditable={() => setEditableStatus(entryData.index, true)}
            />
          )}

          <Divider marginTop="1em" marginBottom="1em" />
        </React.Fragment>
      ))}
    </div>
  );
};
export default ProjectListView;
