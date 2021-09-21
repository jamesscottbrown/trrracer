/* eslint no-console: off */

import React, { useState } from 'react';

import fs from 'fs';
import path from 'path';
import { ipcRenderer } from 'electron';

import Project from './components/Project';
import Splash from './components/Splash';

import './App.global.css';

import { useProjectState } from './components/ProjectContext';


export default function App() {
  const [folderPath, setPath] = useState<string>('');

  const [{ projectData }, dispatch] = useProjectState();
  const [noProjectSelected, setNoProjectSelected] = useState<boolean>(false);
  const [recentPaths, setRecentPaths] = useState<string[]>([]);

  ipcRenderer.on('projectPath', (_event, folderName) => {
   // console.log('Received project path:', folderName);

    setPath(folderName);

    const filePath = path.join(folderName, 'trrrace.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.log(`Error reading file from disk: ${err}`);
      } else {
        // parse JSON string to JSON object
        dispatch({
          type: 'SET_DATA',
          folderName,
          projectData: JSON.parse(data),
        });
        //console.log(data);
      }
    });
  });

  ipcRenderer.on('noProjectSelected', (_event, newRecentPaths) => {
    setNoProjectSelected(true);
    setRecentPaths(newRecentPaths);
  });

  if (noProjectSelected) {
    return <Splash recentPaths={recentPaths} />;
  }

  if (!projectData) {
    return <p>Loading...</p>;
  }

  return  <Project projectData={projectData} folderPath={folderPath} />;
}
