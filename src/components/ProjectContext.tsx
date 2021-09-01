import * as fs from 'fs';
import { copyFileSync } from 'fs';
const {google} = require('googleapis');
import *  as googleCred from '../../assets/google_cred_desktop_app.json';

import React, { createContext, useContext, useReducer } from 'react';
import path from 'path';
import { EntryType, File, TagType } from './types';
import getEmptyProject from '../emptyProject';
import { readFile } from '../fileUtil';

export const ProjectContext = createContext();

export function useProjectState() {
  return useContext(ProjectContext);
}

const saveJSON = (newProjectData: any, state: any) => {
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

async function copyGoogle(file:any, entryIndex:number, state:any){

  const oAuth2Client = new google.auth.OAuth2(googleCred.installed.client_id, googleCred.installed.client_secret, googleCred.installed.redirect_uris[0])
            const token = await readFile('token.json')
            oAuth2Client.setCredentials(JSON.parse(token))
           
            let drive = google.drive({version: 'v3', auth: oAuth2Client});
         
            let nameF = file.name.split('.');

            drive.files.list({
              q:`name="${nameF[0]}" and trashed = false`, 
              fields:"nextPageToken, files(id, name)",
              supportsAllDrives: true,
              includeItemsFromAllDrives: true,
            }).then((fi)=> {
              
                var copyRequest = {  // Modified
                    name: nameF,
                    parents: ['1-tPBWWUaf7CzNYRyVOqfZvmYg3I4r9Zg']
                  };
                  
                  drive.files.copy(
                    {  // Modified
                      fileId: fi.data.files[0].id,
                      requestBody: copyRequest, // or resource: copyRequest
                      supportsAllDrives: true,
                      includeItemsFromAllDrives: true,
                    },
                    function(err, response) {
                      if (err) {
                        console.log(err);
                        // res.send("error");
                        return;
                      }
                    
                      console.log('response', response, state)
                      let newFiles = state.projectData.entries[entryIndex].files;
        
                      newFiles = [...newFiles, { title: `${file.name}` }];
                
                      const entries = state.projectData.entries.map((d: EntryType, i: number) =>
                        entryIndex === i ? { ...d, files: newFiles } : d
                      );
                
                      const newProjectData = { ...state.projectData, entries };
                      console.log('new project', newProjectData);
                      return saveJSON(newProjectData);
                      
                    }
                  );
            
            });
}

const appStateReducer = (state, action) => {
  console.log('state', state, 'action', action);

 // console.log('ACTION:', action);
  switch (action.type) {
    case 'SET_DATA': {
      return {
        folderPath: action.folderName,
        projectData: action.projectData,
        filterTags: [],
      };
    }

    case 'CREATE_CONCEPT':{
    
     // const { title } = action;
      console.log('create concept test', action.title, state.projectData.concepts);

      const newConcepts  = [
        ...state.projectData.concepts,
        { name: action.title, actions: [ {action: 'created', when: new Date().toISOString() }] },
      ];

      const newProjectData = {
        ...state.projectData,
        concepts: newConcepts,
        // entries: newEntries,
      };

      return saveJSON(newProjectData, state);

    }

    case 'DELETE_CONCEPT':{
    
      
       console.log('DELETE concept test', action.title, state.projectData.concepts);
 
       const newConcepts  = state.projectData.concepts.map(m => {
         console.log("M NAME AND ACTION", m.name, action.title.name);
           if(m.name === action.title.name){
             console.log('made it')
             m.actions = [...m.actions, { action:'deleted', when: new Date().toISOString() }]
           }
           return m;
         });

         console.log('NEW NEW', newConcepts);
        
       const newProjectData = {
         ...state.projectData,
         concepts: newConcepts,
       };
 
       return saveJSON(newProjectData, state);
 
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
          entryIndex === i ? { ...d, tags: [...d.tags, newTag.text] } : d
      );

      const newProjectData = {
        ...state.projectData,
        tags: newTags,
        entries: newEntries,
      };

      return saveJSON(newProjectData, state);
    }

    case 'ADD_FILES_TO_ENTRY': {
      const { fileList, entryIndex } = action;

      let newFiles = state.projectData.entries[entryIndex].files;
      for (const file of fileList) {
        console.log('file in fileList', file);
        try {
          const destination = path.join(state.folderPath, file.name);
          let nameCheck = file.name.split(".");
        
          if(nameCheck[nameCheck.length - 1] === 'gdoc'){
            let test = state.projectData.entries.flatMap(m=> m.files.map(fil => fil.title));

            console.log('google file!', file.name, test.indexOf(file.name), test)

            if(test.indexOf(file.name) === -1){
                copyGoogle(file, entryIndex, state);
            }else{
              console.log('already hear');
              let newFiles = state.projectData.entries[entryIndex].files;
        
              newFiles = [...newFiles, { title: `${file.name}` }];
        
              const entries = state.projectData.entries.map((d: EntryType, i: number) =>
                entryIndex === i ? { ...d, files: newFiles } : d
              );
        
              const newProjectData = { ...state.projectData, entries };
              console.log('new project same doc', newProjectData);
              return saveJSON(newProjectData, state);
            }
           

          }else{
//NEED TO INTEGRATE THIS MORE
          let saveFile = true;
          let destination = path.join(state.folderPath, file.name);
          let newName = file.name;

          if (fs.existsSync(destination)) {
            saveFile = window.confirm(
              `A file with name ${newName} has already been imported. Do you want to import this file anyway, with a modified name?`
            );

            let i = 1;
            do {
              const parts = file.name.split('.');
              const base = parts.slice(0, -1).join('');
              const extension = parts.slice(-1)[0];
              newName = `${base} (${i}).${extension}`;

              destination = path.join(state.folderPath, newName);
            

              i += 1;
            } while (fs.existsSync(destination));
          }

          if (saveFile) {
            copyFileSync(file.path, destination);
            console.log(`${file.path} was copied to ${destination}`);
            newFiles = [...newFiles, { title: newName }];
          }

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

      return saveJSON(newProjectData, state);
    }

    case 'CREATE_GOOGLE_IN_ENTRY': {
      const { name, fileType, entryIndex } = action;

      let extension = fileType === 'document' ? 'gdoc' : 'gsheet';

      console.log("this is firing in GDOC NAMEEEEE", name);

      let newFiles = state.projectData.entries[entryIndex].files;
        
      newFiles = [...newFiles, { title: `${name}.${extension}` }];

      const entries = state.projectData.entries.map((d: EntryType, i: number) =>
        entryIndex === i ? { ...d, files: newFiles } : d
      );

      const newProjectData = { ...state.projectData, entries };

      return saveJSON(newProjectData, state);
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

          return saveJSON(newProjectData, state);
        }


     }
   



    case 'DELETE_FILE': {
      const destination = path.join(state.folderPath, action.fileName);

      const deleteFile = window.confirm(
        `Really delete file ${action.fileName}?`
      );

      if (!deleteFile) {
        return state;
      }

      fs.unlinkSync(destination);

      const entries = state.projectData.entries.map((d: EntryType, i: number) =>
        action.entryIndex === i
          ? { ...d, files: d.files.filter((f) => f.title !== action.fileName) }
          : d
      );

      const newProjectData = { ...state.projectData, entries };
      return saveJSON(newProjectData, state);
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

      return saveJSON(newProjectData, state);
    }

    case 'ADD_URL': {
      console.log('LOG URL');

      let newFiles = state.projectData.entries[action.entryIndex].files;
        
      newFiles = [...newFiles, { title: action.url }];

      const entries = state.projectData.entries.map((d: EntryType, i: number) =>
      action.entryIndex === i ? { ...d, files: newFiles } : d
      );

      const newProjectData = { ...state.projectData, entries };

      return saveJSON(newProjectData, state);


    }

    case 'UPDATE_ENTRY_FIELD': {
      const entries = state.projectData.entries.map((d: EntryType, i: number) =>
        action.entryIndex === i
          ? { ...d, [action.fieldName]: action.newValue }
          : d
      );

      const newProjectData = { ...state.projectData, entries };

      return saveJSON(newProjectData, state);
    }

    case 'UPDATE_TAG_COLOR': {
      const tags = state.projectData.tags.map((tag: TagType, i: number) =>
        i === action.tagIndex ? { ...tag, color: action.color } : tag
      );

      const newProjectData = { ...state.projectData, tags };

      return saveJSON(newProjectData, state);
    }
    case 'UPDATE_TAG_NAME': {
      const tags = state.projectData.tags.map((tag: TagType, i: number) =>
        i === action.tagIndex ? { ...tag, title: action.title } : tag
      );

      const oldTitle = state.projectData.tags[action.tagIndex].title;

      const entries = state.projectData.entries.map((entry: EntryType) => ({
        ...entry,
        tags: entry.tags.map((t) => (t === oldTitle ? action.title : t)),
      }));

      const newProjectData = { ...state.projectData, tags, entries };

      return saveJSON(newProjectData, state);
    }

    case 'DELETE_TAG': {
      const tags = state.projectData.tags.filter(
        (tag: TagType) => tag.title !== action.title
      );

      const entries = state.projectData.entries.map((e: EntryType) => ({
        ...e,
        tags: e.tags.filter((t) => t !== action.title),
      }));

      const newProjectData = { ...state.projectData, tags, entries };

      return saveJSON(newProjectData, state);
    }

    case 'UPDATE_FILTER_TAGS': {
      return { ...state, filterTags: action.filterTags };
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
  filterTags: [],
};

export function ProjectStateProvider({ children }) {
  const reducer = useReducer(appStateReducer, initialState);

  return (
    <ProjectContext.Provider value={reducer}>
      {children}
    </ProjectContext.Provider>
  );
}
