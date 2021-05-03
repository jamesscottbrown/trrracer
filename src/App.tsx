/* eslint no-console: off */

import React, { useState } from 'react';

import fs from 'fs';
import path from 'path';
import { ipcRenderer } from 'electron';

import Project from './components/Project';

import './App.global.css';

export default function App() {
  const [folderPath, setPath] = useState<string>('');
  const [projectData, setProjectData] = useState('');

  ipcRenderer.on('projectPath', (_event, folderName) => {
    console.log('Received project path:', folderName);

    setPath(folderName);

    fs.readFile(path.join(folderName, 'trrrace.json'), 'utf8', (err, data) => {
      if (err) {
        console.log(`Error reading file from disk: ${err}`);
      } else {
        // parse JSON string to JSON object
        setProjectData(JSON.parse(data));
        console.log(data);
      }
    });
  });

  const saveJSON = (newData) => {
    fs.writeFile(
      path.join(folderPath, 'trrrace.json'),
      JSON.stringify(newData),
      (err) => {
        if (err) {
          console.log(`Error writing file to disk: ${err}`);
        } else {
          // parse JSON string to JSON object
          setProjectData(newData);
          console.log(newData);
        }
      }
    );
  };

  if (!projectData) {
    return <p>Loading...</p>;
  }

  return (
    <Project
      projectData={projectData}
      folderPath={folderPath}
      saveJSON={saveJSON}
    />
  );
}
