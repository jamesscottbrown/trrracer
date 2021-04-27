import React, { useState } from 'react';

import path from 'path';
import { copyFileSync } from 'fs';
import EdiText from 'react-editext';

import FileUpload from './FileUpload';

const Project = ({ projectData, folderPath, saveJSON }) => {
  console.log(projectData);

  // TODO: add files to json file and save
  console.log('projectData:', projectData);

  const saveFiles = (fileList) => {
    console.log(fileList);

    for (const file of fileList) {
      try {
        const destination = path.join(folderPath, file.name);
        copyFileSync(file.path, destination);
        console.log(`${file.path} was copied to ${destination}`);
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
        { title: 'New entry', files: fileList.map((f) => ({ title: f.name })) },
      ],
    });
  };

  const addEntry = () => {
    saveJSON({
      ...projectData,
      entries: [...projectData.entries, { title: 'New entry', files: [] }],
    });
  };

  const renameEntry = (newName, index) => {
    const entries = projectData.entries.map((d, i) =>
      index === i ? { ...d, title: newName } : d
    );
    saveJSON({ ...projectData, entries: entries });
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
      {projectData.entries.map((entry, i) => (
        <>
          <h3>
            <EdiText
              type="text"
              value={entry.title}
              onSave={(val) => renameEntry(val, i)}
              editOnViewClick={true}
            />
          </h3>

          <ul>
            {entry.files.map((file) => (
              <li>{file.title}</li>
            ))}
          </ul>
        </>
      ))}

      <button onClick={addEntry}>Add entry</button>

      <FileUpload saveFiles={saveFiles} containerStyle={{}} />
    </div>
  );
};

export default Project;
