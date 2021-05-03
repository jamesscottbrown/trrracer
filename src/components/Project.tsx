/* eslint no-console: off */

import React from 'react';

import path from 'path';
import { copyFileSync } from 'fs';
import FileUpload from './FileUpload';
import { Entry } from './Entry';

const { ipcRenderer } = require('electron');

const Project = ({ projectData, folderPath, saveJSON }) => {
  console.log(projectData);

  // TODO: add files to json file and save
  console.log('projectData:', projectData);

  const saveFiles = (fileList) => {
    console.log(fileList);

    let copiedFiles = [];

    for (const file of fileList) {
      try {
        const destination = path.join(folderPath, file.name);
        copyFileSync(file.path, destination);
        console.log(`${file.path} was copied to ${destination}`);
        copiedFiles = [...copiedFiles, { title: file.name }];
      } catch (e) {
        console.log('Error', e.stack);
        console.log('Error', e.name);
        console.log('Error', e.message);

        console.log('The file could not be copied');
      }
    }

    saveJSON({
      ...projectData,
      entries: [
        ...projectData.entries,
        { title: 'New entry', files: copiedFiles },
      ],
    });
  };

  const addEntry = () => {
    saveJSON({
      ...projectData,
      entries: [...projectData.entries, { title: 'New entry', files: [] }],
    });
  };

  const updateEntryField = (entryIndex, fieldName, newValue) => {
    const entries = projectData.entries.map((d, i) =>
      entryIndex === i ? { ...d, [fieldName]: newValue } : d
    );
    saveJSON({ ...projectData, entries: entries });
  };

  const openFile = (fileName) => {
    console.log('Open file:', path.join(folderPath, fileName));
    ipcRenderer.send('open-file', path.join(folderPath, fileName));
  };

  return (
    <div>
      <h1>{projectData.title}</h1>

      <h2>Tags</h2>
      <ul>
        {projectData.tags.map((tag) => (
          <li>{tag.title}</li>
        ))}
      </ul>

      <h2>Entries</h2>
      {projectData.entries.map((entryData, i) => (
        <Entry
          entryData={entryData}
          entryIndex={i}
          openFile={openFile}
          updateEntryField={updateEntryField}
          folderPath={folderPath}
        />
      ))}

      <button onClick={addEntry}>Add entry</button>

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

export default Project;
