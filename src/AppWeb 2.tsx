/* eslint no-console: off */
/// /

// This is the entrypoint for the React app displayed in the Web App. It *is not* able to use node and electron APIs.

import React, { useState } from 'react';
import { ChakraProvider } from '@chakra-ui/react';

import Project from './components/Project';

import './App.global.css';

import { useProjectState } from './components/ProjectContext';

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

const migrateTrrraceFormat = (projectData: any) => {
  // - add url array if not already present
  // - convert tags list on entry from object to string

  return {
    ...projectData,
    entries: projectData.entries.map((e: any) => ({
      ...e,
      files: e.urls
        ? [
            ...e.files,
            ...e.urls.map((u: any) => ({
              title: u.title,
              url: u.url,
              fileType: 'url',
            })),
          ]
        : [...e.files],
      tags: e.tags.map((t: any) => (typeof t === 'string' ? t : t.text)),
    })),
  };
};

export default function App() {
  const [folderPath, setPath] = useState<string>('');
  const [{ projectData }, dispatch] = useProjectState();

  if (!folderPath){
    setPath('http://localhost:8081'); // TODO: make not a constant
  }

  if (folderPath && !projectData) {
    fetch(`${folderPath}/trrrace.json`)
      .then((res) => res.json()) // ?
      .then((data) =>
        dispatch({
          type: 'SET_DATA',
          dispatch,
          folderName: folderPath,
          projectData: migrateTrrraceFormat(data),
        })
      );
  }

  if (!projectData) {
    return (
      <ChakraProvider>
        <p>Loading...</p>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider>
      <Project folderPath={folderPath} />
    </ChakraProvider> 
  );
}
