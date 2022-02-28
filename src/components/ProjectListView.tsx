import path from 'path';
import React, { useState, useEffect } from 'react';
import {
  Button,
  ButtonGroup,
  Divider
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash, FaPlus, FaFillDrip } from 'react-icons/fa';

import { useProjectState } from './ProjectContext';

import {
  EntryType,
  EntryTypeWithIndex,
  ProjectViewProps,
} from './types';

import Entry from './Entry';

import ReadonlyEntry from './ReadonlyEntry';


const { ipcRenderer } = require('electron');

export const openFile = (fileName: string, folderPath: string) => {
  console.log('Open file:', path.join(folderPath, fileName));
  ipcRenderer.send('open-file', path.join(folderPath, fileName));
 
};

const ProjectListView = (ProjectPropValues: ProjectViewProps) => {
  
  const { projectData, folderPath, reversedOrder, setViewType, setSelectedArtifactIndex, setSelectedArtifactEntry, timeFilter, setTimeFilter} = ProjectPropValues;

  const [{ filterTags }, dispatch] = useProjectState();

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

  // TODO: add files to json file and save

  // const saveFiles = (fileList: FileObj[]) => {
  //   dispatch({ type: 'ADD_FILES', fileList });
  // };

  // const addEntry = () => {
  //   dispatch({ type: 'ADD_ENTRY' });
  // };

  const updateEntryField = (
    entryIndex: number,
    fieldName: string,
    newValue: any
  ) => {
    dispatch({ type: 'UPDATE_ENTRY_FIELD', entryIndex, fieldName, newValue });
  };


  const filteredEntries = projectData.entries
    .filter((entryData: EntryType) => {
      return filterTags.every((requiredTag: string) =>
        entryData.tags.includes(requiredTag)
      );
    })
    .map((e, index) => ({ ...e, index }));
  filteredEntries.sort(
    (a, b) =>
      (reversedOrder ? -1 : +1) *
      (Number(new Date(a.date)) - Number(new Date(b.date)))
  );

  let fAct = timeFilter != null ? filteredEntries.filter(f => new Date(f.date) >= timeFilter[0] && new Date(f.date) <= timeFilter[1]) : filteredEntries;

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
    <div style={{ padding: '10px'}}>
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

      {fAct.map((entryData: EntryTypeWithIndex, i:number) => (
        <>
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
        </>
      ))}

      </div>
    );

};
export default ProjectListView;
