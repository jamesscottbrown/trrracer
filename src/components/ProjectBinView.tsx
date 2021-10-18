import path from 'path';
import React, { useState, useEffect } from 'react';

import { useProjectState } from './ProjectContext';
import { EntryType, FileObj, ProjectViewProps } from './types';
import Entry from './Entry';
import FileUpload from './FileUpload';
import TagList from './TagList';
import TagFilter from './SetFilterTags';
import ReadonlyEntry from './ReadonlyEntry';


import ConceptNav from './Concepts';

const { ipcRenderer } = require('electron');

const ProjectBinView = (ProjectPropValues: ProjectViewProps) => {
  const { projectData, folderPath } = ProjectPropValues;

  console.log('projectdata in bin view', projectData);

  projectData.concepts.map(con => {
   
    projectData.entries.filter(en => {
      console.log('en', en, 'con', con);
    })
  });

  const [{ filterTags }, dispatch] = useProjectState();
  const [editable, setEditable] = useState<boolean[]>(
    Array.from(Array(projectData.entries.length), (_, x) => false)
  );

  useEffect(() => {
    setEditable(Array.from(Array(projectData.entries.length)));
  }, [projectData]);

  // TODO: add files to json file and save

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
    console.log('after ipcRenderer');
  };

  const filteredEntries = projectData.entries.filter((entryData: EntryType) => {
    return filterTags.every((requiredTag: string) =>
      entryData.tags.includes(requiredTag)
    );
  });

  const makeAllEditable = () => {
    setEditable(Array.from(Array(projectData.entries.length), (_, x) => true));
  };

  const makeAllNonEditable = () => {
    setEditable(Array.from(Array(projectData.entries.length), (_, x) => false));
  };

  const makeEditable = (index: number) => {
    setEditable((oldEditable) =>
      oldEditable.map((d, i) => (i === index ? true : d))
    );
  };

  return (
    <div>
      <ConceptNav concepts={projectData.concepts}/>

      <TagList tags={projectData.tags} />

      <h2>Activities</h2>

      <div>
        {!editable.every((t) => t) && (
          <button color="primary" onClick={makeAllEditable} type="button">
            Show all edit controls
          </button>
        )}
        {!editable.every((t) => !t) && (
          <button color="primary" onClick={makeAllNonEditable} type="button">
            Hide all edit controls
          </button>
        )}
      </div>

      <br />

      <TagFilter />

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
            />
          ) : (
            <ReadonlyEntry
              /* eslint-disable-next-line react/no-array-index-key */
              key={i}
              entryData={entryData}
              openFile={openFile}
              makeEditable={() => makeEditable(i)}
            />
          )}

          <hr />
        </>
      ))}

      <button color="primary" onClick={addEntry} type="button">
        Add entry
      </button>

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

export default ProjectBinView;
