import * as fs from 'fs';
import { copyFileSync } from 'fs';

import React, { createContext, useContext, useReducer } from 'react';
import path from 'path';

import { EntryType, File } from './types';
import getEmptyProject from '../emptyProject';

import GoogleLoader from '../googleAPI';

export const ProjectContext = createContext();

export function useProjectState() {
  return useContext(ProjectContext);
}

const appStateReducer = (state, action) => {
  console.log('state', state, 'action', action);
  const saveJSON = (newProjectData: any) => {
    fs.writeFileSync(
      path.join(state.folderPath, 'trrrace.json'),
      JSON.stringify(newProjectData, null, 4),
      (err) => {
        if (err) {
          console.log(`Error writing file to disk: ${err}`);
        } else {
          // parse JSON string to JSON object
         // console.log('new Project data',newProjectData);
        }
      }
    );

    return { ...state, projectData: newProjectData };
  };

 // console.log('ACTION:', action);
  switch (action.type) {
    case 'SET_DATA': {
      return { folderPath: action.folderName, projectData: action.projectData };
    }

    case 'ADD_TAG_TO_ENTRY': {
      const { newTag, entryIndex } = action;

      const existingTags = state.projectData.tags.map((k) => k.title);

      let newTags;
      if (!existingTags.includes(newTag.text)) {
        newTags = [
          ...state.projectData.tags,
          { title: newTag.text, color: 'black' },
        ];
      } else {
        newTags = state.projectData.tags;
      }

      const newEntries = state.projectData.entries.map(
        (d: EntryType, i: number) =>
          entryIndex === i ? { ...d, tags: [...d.tags, newTag] } : d
      );

      const newProjectData = {
        ...state.projectData,
        tags: newTags,
        entries: newEntries,
      };

      return saveJSON(newProjectData);
    }

    case 'ADD_FILES_TO_ENTRY': {
      const { fileList, entryIndex } = action;

      let newFiles = state.projectData.entries[entryIndex].files;
      for (const file of fileList) {
        // console.log('FILE?', file.path)
        try {
          const destination = path.join(state.folderPath, file.name);
          let nameCheck = file.name.split(".");
        
          if(nameCheck[nameCheck.length - 1] === 'gdoc'){
           
            let goog =  new GoogleLoader(file, destination);
            goog.initClient();

          }else{
            ///node.js method is used to synchronously copy a file from the source path to destination path.
            copyFileSync(file.path, destination);
            console.log(`${file.path} was copied to ${destination}`);
            newFiles = [...newFiles, { title: file.name }];
          }
         
        } catch (e) {
          console.log('Error', e.stack);
          console.log('Error', e.name);
          console.log('Error', e.message);

          console.log('The file could not be copied');
        }
      }

      const entries = state.projectData.entries.map((d: EntryType, i: number) =>
        entryIndex === i ? { ...d, files: newFiles } : d
      );

      const newProjectData = { ...state.projectData, entries };

      return saveJSON(newProjectData);
    }

    case 'CREATE_GDOC_IN_ENTRY': {
      const { name, entryIndex } = action;

      console.log("this is firing in GDOC NAMEEEEE", name);

      let newFiles = state.projectData.entries[entryIndex].files;
        
      newFiles = [...newFiles, { title: `${name}.gdoc` }];

      const entries = state.projectData.entries.map((d: EntryType, i: number) =>
        entryIndex === i ? { ...d, files: newFiles } : d
      );

      const newProjectData = { ...state.projectData, entries };

      return saveJSON(newProjectData);
    }

    case 'ADD_FILES': {
      const { fileList } = action;

     console.log('ADD_FILES is this firing??', fileList)

     if(fileList){

          let copiedFiles: File[] = [];

          for (const file of fileList) {
            console.log('file', file.path)
            try {
              const destination = path.join(state.folderPath, file.name);
              copyFileSync(file.path, destination);
              console.log(`${file.path} was copied to ${destination}`);
              copiedFiles = [...copiedFiles, { title: file.name, format: 'null' }];
            } catch (e) {
              console.log('Error', e.stack);
              console.log('Error', e.name);
              console.log('Error', e.message);

              console.log('The file could not be copied');
            }
          }

          const newProjectData = {
            ...state.projectData,
            entries: [
              ...state.projectData.entries,
              {
                title: 'New entry',
                description: '',
                files: copiedFiles,
                date: new Date().toISOString(),
                tags: [],
              },
            ],
          };

          return saveJSON(newProjectData);
        }


     }
   



    case 'ADD_ENTRY': {
      const newProjectData = {
        ...state.projectData,
        entries: [
          ...state.projectData.entries,
          {
            title: 'New entry',
            description: '',
            files: [],
            date: new Date().toISOString(),
            tags: [],
          },
        ],
      };

      return saveJSON(newProjectData);
    }

    case 'UPDATE_ENTRY_FIELD': {
      const entries = state.projectData.entries.map((d: EntryType, i: number) =>
        action.entryIndex === i
          ? { ...d, [action.fieldName]: action.newValue }
          : d
      );

      const newProjectData = { ...state.projectData, entries };

      return saveJSON(newProjectData);
    }

    default: {
      console.log("Can't handle:", action);
      return state;
    }
  }
};

const initialState = {
  projectData: getEmptyProject('null'),
  folderPath: null,
};

export function ProjectStateProvider({ children }) {
  const reducer = useReducer(appStateReducer, initialState);

  return (
    <ProjectContext.Provider value={reducer}>
      {children}
    </ProjectContext.Provider>
  );
}
