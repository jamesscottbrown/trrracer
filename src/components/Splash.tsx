import React from 'react';
import { BiLinkExternal } from 'react-icons/bi';

const { ipcRenderer } = require('electron');

interface SplashProps {
  recentPaths: string[];
}

const Splash = (props: SplashProps) => {
  const { recentPaths } = props;

  return (
    <>
      <h1>Welcome to Trracer!</h1>
      <p>Open a project or create a new project to get started.</p>

      {recentPaths.length === 0 ? (
        <p>No recently opened paths</p>
      ) : (
        <>
          <h2>Recently opened projects</h2>
          <ul>
            {recentPaths.map((p: string) => (
              <li key={p}>
                {p}{' '}
                <BiLinkExternal
                  onClick={() => ipcRenderer.send('openProject', p)}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      <button type="button" onClick={() => ipcRenderer.send('newProject')}>
        New project
      </button>
      <button type="button" onClick={() => ipcRenderer.send('openProject')}>
        Open project
      </button>
    </>
  );
};

export default Splash;
