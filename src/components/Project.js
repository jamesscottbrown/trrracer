import React, { useState } from 'react';

import path from 'path';
import { copyFileSync } from 'fs';

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

        saveJSON({ ...projectData, files: [...projectData.files, { name: file.name }] });

      } catch (e) {
        console.log('Error', e.stack);
        console.log('Error', e.name);
        console.log('Error', e.message);

        console.log('The file could not be copied');
      }
    }
  };

  return <div>

    <h1>{projectData.title}</h1>

    <h2>Tags</h2>
    <ul>
      {projectData.tags.map(tag => <li>{tag.title}</li>)}
    </ul>

    <h2>Files</h2>
    <ul>
      {projectData.files.map(file => <li>{file.name}</li>)}
    </ul>

    <FileUpload
      saveFiles={saveFiles}
      containerStyle={{}}
    />
  </div>;
};

export default Project;
