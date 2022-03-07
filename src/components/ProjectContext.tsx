import * as fs from 'fs';
import { copyFileSync } from 'fs';
const {google} = require('googleapis');
import *  as googleCred from '../../assets/google_cred_desktop_app.json';
import { v4 as uuidv4 } from 'uuid';

import React, { createContext, useContext, useReducer } from 'react';
import path from 'path';

import { EntryType, File, FileObj, TagType } from './types';
import getEmptyProject from '../emptyProject';
import { readFile } from '../fileUtil';
import DataDisplayer from '../CallFlask';

export const ProjectContext = createContext();

export function useProjectState() {
  return useContext(ProjectContext);
}

export function addMetaDescrip(projectData, state){

  let newProjEntries = projectData.entries.map(( e: EntryType )=>{
    e.files = e.files.map(f => {
      if(!f.context){
        f.context = "null";
      }
      return f;
    });
    return e;
  });

 

  let newProj = {...projectData, 'entries': newProjEntries}


  
  return null//saveJSON(newProj);
  

//});

}
const pickTagColor = (tags: TagType[]) => {
  const allColors = [
    '#B80000',
    '#DB3E00',
    '#FCCB00',
    '#008B02',
    '#006B76',
    '#1273DE',
    '#004DCF',
    '#5300EB',
    '#EB9694',
    '#FAD0C3',
    '#FEF3BD',
    '#C1E1C5',
    '#BEDADC',
    '#C4DEF6',
    '#BED3F3',
    '#D4C4FB',
  ];
  const usedColors = tags.map((k) => k.color);
  const unusedColors = allColors.filter((c) => !usedColors.includes(c));
  const availableColors = unusedColors.length > 0 ? unusedColors : allColors;

  return availableColors[Math.floor(Math.random() * availableColors.length)];
};

const copyFiles = (fileList: FileObj[], folderPath: string) => {
  let newFiles: File[] = [];
  for (const file of fileList) {

    const sourceIsInProjectDir = file.path.startsWith(folderPath);
    let destination = path.join(folderPath, file.name);
    /**
     * is it google??
     */
    let nameCheck = file.name.split(".");
        
    if(nameCheck[nameCheck.length - 1] === 'gdoc'){
        
          if (fs.existsSync(destination) && !sourceIsInProjectDir){
          

            let newFile = { title: `${file.name}`, fileType: nameCheck[nameCheck.length - 1], context: "null" };
      
            newFiles = [...newFiles, newFile];

          }else{
         
            copyGoogle(file, newFiles).then(fileArray => {
              newFiles = [...fileArray]
            });
          }

        }else{

         

      
          try {
            let saveFile = true;
            
            let newName = file.name;
      
            if (fs.existsSync(destination) && !sourceIsInProjectDir) {
              saveFile = window.confirm(
                `A file with name ${newName} has already been imported. Do you want to import this file anyway, with a modified name?`
              );
      
              let i = 1;
              do {
                const parts = file.name.split('.');
                const base = parts.slice(0, -1).join('');
                const extension = parts.slice(-1)[0];
                newName = `${base} (${i}).${extension}`;
      
                destination = path.join(folderPath, newName);
           
      
                i += 1;
              } while (fs.existsSync(destination) && !sourceIsInProjectDir);
            }
      
            if (saveFile) {
              if (!sourceIsInProjectDir) {
                copyFileSync(file.path, destination);
              }
              console.log(`${file.path} was copied to ${destination}`);
              newFiles = [...newFiles, { title: newName, fileType: nameCheck[nameCheck.length - 1], context: "null" }];
            }
          } catch (e) {
            console.log('Error', e.stack);
            console.log('Error', e.name);
            console.log('Error', e.message);
      
            console.log('The file could not be copied');
          }
        }

    }


  return newFiles;
};

export async function getGoogleIds(projectData, state){


  const oAuth2Client = new google.auth.OAuth2(googleCred.installed.client_id, googleCred.installed.client_secret, googleCred.installed.redirect_uris[0])
            const token = fs.readFileSync('token.json', {encoding: 'utf-8'})
            oAuth2Client.setCredentials(JSON.parse(token))
           
            let drive = google.drive({version: 'v3', auth: oAuth2Client});

            drive.files.list({
              q:`"1-tPBWWUaf7CzNYRyVOqfZvmYg3I4r9Zg" in parents and trashed = false`, 
              fields:"nextPageToken, files(id, name)",
              supportsAllDrives: true,
              includeItemsFromAllDrives: true,

            }).then((fi)=> {

           
              let newProjEntries = projectData.entries.map(( e: EntryType )=>{
               
                e.files = e.files.map(f => {
                 
                  let nameCheck = f.title.split('.');
                  
                  if(nameCheck[nameCheck.length - 1] === 'gdoc'){

                  

                    let id = fi.data.files.filter(m=> {
                      return `${m.name}.gdoc` === f.title});
                  

                    if(id.length != 0){
                      f.fileType = 'gdoc';
                      f.fileId = id[0].id;
                    }
                  }

                  return f;

                });

                return e;

              });

             

              let newProj = {...projectData, 'entries': newProjEntries}
              return saveJSON(newProj, state);

            });
}

async function copyGoogle(file:any, fileList:any){

  const oAuth2Client = new google.auth.OAuth2(googleCred.installed.client_id, googleCred.installed.client_secret, googleCred.installed.redirect_uris[0])
            const token = fs.readFileSync('token.json', {encoding: 'utf-8'})
            oAuth2Client.setCredentials(JSON.parse(token));
           
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
                      // let newFiles = state.projectData.entries[entryIndex].files;
                      let newFile = { title: `${file.name}`, fileType: nameF[nameF.length - 1], context: "null", fileId: response.data.id }
        
                      fileList = [...fileList, newFile]; 
                    }
                  );
            
            });

            return fileList;
}

export const readProjectFile = (folderPath: string, fileName: string, fileType:any) => {

  const filePath = path.join(folderPath, fileName);
  const fileContents = fs.readFileSync(filePath, { encoding: 'utf-8' });
  if(!fileType){
    return JSON.parse(fileContents);
  }else{
    console.log('this is a text file', fileContents)
  }
  
};
        


const appStateReducer = (state, action) => {

  /**
   *  function for set data that checks to see if the file exists and if not, creates one. 
   * research_threads = readProjectFile(baseDir, 'research_threads.json');
   */

  const checkRtFile = (dir:any) => {

    try{
      return readProjectFile(dir, 'research_threads.json', null);
    }catch (e){
      let rtOb = {
        title: action.projectData.title,
        research_threads: []
      }

      saveJSONRT(rtOb);
      return rtOb;
    }

  }

  const saveJSON = (newProjectData: any) => {
    fs.writeFileSync(
      path.join(state.folderPath, 'trrrace.json'),
      JSON.stringify(newProjectData, null, 4),
      (err) => {
        if (err) {
          console.log(`Error writing file to disk: ${err}`);
        } else {
          // parse JSON string to JSON object
 
        }
      }
    );
    return { ...state, ProjectData: newProjectData };
  }

  const saveJSONRT = (RTData: any) => {
    fs.writeFileSync(
      path.join(state.folderPath, 'research_threads.json'),
      JSON.stringify(RTData, null, 4),
      (err) => {
        if (err) {
          console.log(`Error writing file to disk: ${err}`);
        } else {
          // parse JSON string to JSON object
  
        }
      }
    );

  return { ...state, researchThreads: RTData };
  };


  switch (action.type) {
  
    case 'SET_DATA': {

      const baseDir = action.folderName;
    
      let newEntries;
      let roleData;
      let google_data;
      let txtData;
      
      try {
        const google_em = readProjectFile(baseDir, 'goog_em.json', null);
    
        google_data = readProjectFile(baseDir, 'goog_data.json', null);

        const text_data = readProjectFile(baseDir, 'text_data.json', null);
        txtData = text_data;

        const comment_data = readProjectFile(baseDir, 'goog_comms.json', null);
        
        roleData = readProjectFile(baseDir, 'roles.json', null);       

        newEntries = action.projectData.entries.map((e, i) => {
            e.key_txt = text_data["text-data"].filter(td => td['entry-index'] === i)
           
            let testArray = e.files.filter(f=> f.fileType === 'gdoc');
            if(testArray.length > 0){
              e.files = e.files.map(ef => {
                if(ef.fileType === "gdoc"){
                  ef.emphasized = google_em[ef.fileId];
                  ef.comments = comment_data[ef.fileId];
                }
                return ef
              })
            }
            return e;

          });         
      } catch (e) {
        newEntries = action.projectData.entries;
        
        return e;
      }
     
      let research_threads = checkRtFile(baseDir);
      
      const newProjectData = {
        ...action.projectData,
        entries: newEntries,
        roles: roleData,
      };

      return {
        folderPath: action.folderName,
        projectData: newProjectData,
        googleData: google_data,
        txtData: txtData,
        researchThreads: research_threads,
        selectedThread: 0,
        filterTags: [],
        filterTypes: []
      }
    }

    case 'UPDATE_TITLE': {
      const newProjectData = {
        ...state.projectData,
        title: action.title,
      };

      return saveJSON(newProjectData);
    }
    case 'ADD_TAG_TO_THREAD':{
      const { tag, threadIndex } = action;
     
      let newRT = {...state.researchThreads}
      console.log('NEW RT',newRT)
      newRT.research_threads[threadIndex].associated_tags.push(tag);
      
      return saveJSONRT(newRT);
    }

    case 'ADD_ACTIVITY_TO_THREAD':{
      const {activity, rationale, activityIndex, threadIndex} = action;
      
      let newRT = state.researchThreads;
      
      let newA =  {
        type: "activity",
        dob: activity.date, 
        activity_index: activityIndex, 
        title: activity.title,
        rationale: rationale
      }
      newRT.research_threads[threadIndex].evidence.push(newA)

      return saveJSONRT(newRT);
    } 

    case 'ADD_ARTIFACT_TO_THREAD': {
      const {activity, rationale, artifactIndex, threadIndex} = action;
      let newRT = state.researchThreads;
      console.log('activity files', activity.files, artifactIndex);
      let newA =  {
        type: "artifact",
        dob: activity.date, 
        activity_index: activity.index, 
        artifactIndex: artifactIndex,
        activityTitle: activity.title,
        artifactTitle: activity.files[artifactIndex].title,
        rationale: rationale
      }
      newRT.research_threads[threadIndex].evidence.push(newA);
     
      return saveJSONRT(newRT);

    }

    case "ADD_FRAGMENT_TO_THREAD":{
      const {activity, rationale, artifactIndex, threadIndex, fragment, fragmentType} = action;
      let newRT = state.researchThreads;
      let newA =  {
        type: "fragment",
        dob: activity.date, 
        activity_index: activity.index, 
        artifactIndex: artifactIndex,
        activityTitle: activity.title,
        artifactTitle: activity.files[artifactIndex].title,
        rationale: rationale,
        anchors:[{anchor_type: fragmentType, frag_type: fragment}]
      }
      newRT.research_threads[threadIndex].evidence.push(newA);
      return saveJSONRT(newRT);;
    }

    case 'ADD_TAG_TO_ENTRY': {
      const { newTag, entryIndex } = action;

      const existingTags = state.projectData.tags.map((k) => k.title);

      const newColor = pickTagColor(state.projectData.tags);

      let newTags;
      if (!existingTags.includes(newTag.text)) {
        newTags = [
          ...state.projectData.tags,
          { title: newTag.text, color: newColor, date: new Date().toISOString() },
        ];
      } else {
        newTags = state.projectData.tags;
        // projectData
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

      return saveJSON(newProjectData);
    }

    case 'ADD_FILES_TO_ENTRY': {
      const { fileList, entryIndex } = action;
      const currentFiles = state.projectData.entries[entryIndex].files;
      const newFiles = [
        ...currentFiles,
        ...copyFiles(fileList, state.folderPath),
      ];
      const entries = state.projectData.entries.map((d: EntryType, i: number) =>
        entryIndex === i ? { ...d, files: newFiles } : d
      );

      const newProjectData = { ...state.projectData, entries };

      return saveJSON(newProjectData);
    }

    case 'CREATED_GOOGLE_IN_ENTRY': {
         
      return action.newProjectData
    }

    case 'HIGHLIGHT_TAG': {
     
      return {...state, highlightedTag: action.highlightedTag }
    }

    case 'HIGHLIGHT_TYPE': {
     
      return {...state, highlightedType: action.highlightedType }
    }

    case 'SELECTED_ARTIFACT': {
      console.log('testing in dispatch', action.selectedArtifactEntry, action.selectedArtifactIndex)
      return {...state, selectedArtifactEntry: action.selectedArtifactEntry, selectedArtifactIndex: action.selectedArtifactIndex}
    }

    case 'SELECTED_THREAD':{
      return {...state, selectedThread: action.selectedThread }
    }

    case 'DELETE_EVIDENCE_FROM_THREAD':{
      return {...state, researchThreads: action.researchThreads}
    }

    case 'ADD_URL': {
      let newFiles = state.projectData.entries[action.entryIndex].files;
      newFiles = [
        ...newFiles,
        { title: action.title, url: action.url, fileType: 'url' },
      ];

      const entries = state.projectData.entries.map((d: EntryType, i: number) =>
        action.entryIndex === i ? { ...d, files: newFiles } : d
      );

      const newProjectData = { ...state.projectData, entries };
      return saveJSON(newProjectData);
    }

    case 'CREATE_THREAD':{

      let randomColor = Math.floor(Math.random()*16777215).toString(16);

      let threadOb = {
        title: action.threadName, 
        actions:[
          {action: "created", when: new Date()}
        ],
        rt_id: uuidv4(),
        description: action.threadDescription,
        associated_tags: [],
        color:`#${randomColor}`,
        evidence:[]
      }
      let newRT = state.researchThreads;
      newRT.research_threads.push(threadOb);
     
      return saveJSONRT(newRT);
    }

    case 'ADD_FILES': {
      const { fileList } = action;

      const copiedFiles = copyFiles(fileList, state.folderPath);

      const newEntry: EntryType = {
        title: 'New entry',
        description: '',
        files: copiedFiles,
        date: new Date().toISOString(),
        tags: [],
        urls: [],
      };
      const newProjectData = {
        ...state.projectData,
        entries: [...state.projectData.entries, newEntry],
      };

      return saveJSON(newProjectData);
    }

    case 'DELETE_FILE': {
      const destination = path.join(state.folderPath, action.fileName);

      const unattachFile = window.confirm(
        `Really un-attach file ${action.fileName}?`
      );

      if (!unattachFile) {
        return state;
      }

      let otherUses = false;
      for (let i = 0; i < state.projectData.entries.length; i += 1) {
        const entry = state.projectData.entries[i];

        const fileNames = entry.files.map((f: File) => f.title);

        if (i !== action.entryIndex && fileNames.includes(action.fileName)) {
          otherUses = true;
          break;
        }
      }

      if (!otherUses) {
        const deleteFile = window.confirm(
          `File ${action.fileName} is not attached to any other entries - delete from project directory?`
        );

        if (deleteFile) {
          fs.unlinkSync(destination);
        }
      }

      const entries = state.projectData.entries.map((d: EntryType, i: number) =>
        action.entryIndex === i
          ? { ...d, files: d.files.filter((f) => f.title !== action.fileName) }
          : d
      );

      const newProjectData = { ...state.projectData, entries };
      return saveJSON(newProjectData);
    }

    case 'ADD_ENTRY': {
      const newEntry: EntryType = {
        title: 'New entry',
        description: '',
        files: [],
        date: new Date().toISOString(),
        tags: [],
        urls: [],
      };

      const newProjectData = {
        ...state.projectData,
        entries: [...state.projectData.entries, newEntry],
      };

      return saveJSON(newProjectData);
    }
    case 'DELETE_ENTRY': {
      const confirmed = window.confirm(
        'Are you sure that you want to delete this entry? This will not delete attached files.'
      );
      if (!confirmed) {
        return state;
      }

      const newProjectData = {
        ...state.projectData,
        entries: state.projectData.entries.filter(
          (e, i: number) => i !== action.entryIndex
        ),
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

    case 'UPDATE_TAG_COLOR': {
      const tags = state.projectData.tags.map((tag: TagType, i: number) =>
        i === action.tagIndex ? { ...tag, color: action.color } : tag
      );

      const newProjectData = { ...state.projectData, tags };

      return saveJSON(newProjectData);
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

      return saveJSON(newProjectData);
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

      return saveJSON(newProjectData);
    }

    case 'UPDATE_FILTER_TAGS': {
      console.log('tags', action.filterTags);
      return { ...state, filterTags: action.filterTags };
    }

    case 'UPDATE_FILTER_TYPES': {
      console.log('types', action.filterTypes);
      return { ...state, filterTypes: action.filterTypes };
    }

    case 'CREATE_CONCEPT':{
      
      const newConcepts  = [
        ...state.projectData.concepts,
        { name: action.title, actions: [ {action: 'created', when: new Date().toISOString() }] },
      ];

      const newProjectData = {
        ...state.projectData,
        concepts: newConcepts
      };

      return saveJSON(newProjectData);

    }

    case 'DELETE_CONCEPT':{
    
       const newConcepts  = state.projectData.concepts.map(m => {
        
           if(m.name === action.title.name){
          
             m.actions = [...m.actions, { action:'deleted', when: new Date().toISOString() }]
           }
           return m;
         });

       const newProjectData = {
         ...state.projectData,
         concepts: newConcepts
       };
 
       return saveJSON(newProjectData);
 
    }

    case 'MERGE_CONCEPT':{
       
       const newConcepts  = state.projectData.concepts.map(m => {
        
        if(m.name === action.fromName){

          m.actions = [...m.actions, { action:'merged', with: action.mergeName, when: new Date().toISOString() }]
        }
        return m;
      });
      
       const newProjectData = {
        ...state.projectData,
        concepts: newConcepts
      };

      return saveJSON(newProjectData);

      
    }

    default: {
      console.log("Can't handle:", action);
      return state;
    }
  }
};

const initialState = {
  projectData: null,
  //projectData: getEmptyProject('null'),
  folderPath: null,
  filterTags: [],
  filterTypes: []
};

export function ProjectStateProvider({ children }) {

  const reducer = useReducer(appStateReducer, initialState);

  return (
    <ProjectContext.Provider value={reducer}>
      {children}
    </ProjectContext.Provider>
  );
}
