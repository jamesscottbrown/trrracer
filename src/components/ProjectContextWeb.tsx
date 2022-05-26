import React, { createContext, useContext, useReducer } from 'react';
import { FileObj, ProjectState } from './types';
import { getAppStateReducer } from './ProjectContextCommon';


export const ProjectContext = createContext<DispatchType>();

type DispatchType = [ProjectState, (msg: any) => ProjectState];

export function useProjectState() {
  return useContext<DispatchType>(ProjectContext);
}

// write functions do nothing in web version

export function addMetaDescrip(projectData, state) {
  return null;
}

const copyFiles = (fileList: FileObj[], folderPath: string) => {
  return null;
};

// ???
export async function getGoogleIds(projectData, state) {
  return null;
}

async function copyGoogle(file: any, fileList: any) {
  return null;
}


const saveJSON = (newProjectData: any, state) => {
  return { ...state, projectData: newProjectData };
};

const saveJSONRT = (RTData: any, dir: string, state) => {
  return { ...state, researchThreads: RTData };
};

const deleteFileAction = (fileName, entryIndex, state) => {
  return state;
};

const deleteFile = (destination: string) => null;

// Read functions
export const readProjectFile = async (
  folderPath: string,
  fileName: string,
  fileType: any
) => {
  const response = await fetch(`${folderPath}/${fileName}`);

  if (!fileType) {
    return response.json();
  }
  return response.text();
};



const appStateReducer = getAppStateReducer(
  copyFiles,
  readProjectFile,
  saveJSON,
  saveJSONRT,
  deleteFileAction
);



const initialState: ProjectState = {
  projectData: null,
  // projectData: getEmptyProject('null'),
  folderPath: null,
  filterTags: [],
  filterType: null,
};


export function ProjectStateProvider({ children }) {
  const reducer = useReducer(appStateReducer, initialState);

  return (
    <ProjectContext.Provider value={reducer}>
      {children}
    </ProjectContext.Provider>
  );
}

