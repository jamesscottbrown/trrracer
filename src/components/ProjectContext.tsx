import * as fs from 'fs';
import { copyFileSync } from 'fs';
const {google} = require('googleapis');
import *  as googleCred from '../../assets/google_cred_desktop_app.json';

import React, { createContext, useContext, useReducer } from 'react';
import path from 'path';

import { EntryType, File, FileObj, TagType } from './types';
import getEmptyProject from '../emptyProject';
import { readFile } from '../fileUtil';

// import * as collo from '/Volumes/GoogleDrive/Shared drives/trrrace/Derya Artifact Trrracer/entry_collocations.json'


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

  console.log('NEW NEW proj while whrtie', newProj);
  
  return saveJSON(newProj, state);
  

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
            console.log('already herr');

            let newFile = { title: `${file.name}`, fileType: nameCheck[nameCheck.length - 1], context: "null" };
      
            newFiles = [...newFiles, newFile];

          }else{
            console.log("COPY OVER THAT GOOGLE FILE")
            copyGoogle(file, newFiles).then(fileArray => {
              newFiles = [...fileArray]
            });
          }

        }else{

          console.log('About to copy:', folderPath, file.path);

      
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
                console.log('Trying new name:', newName);
      
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

  console.log('projectData in get google ids', projectData.entries);
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

              console.log("FILES", fi);
              let newProjEntries = projectData.entries.map(( e: EntryType )=>{
               
                e.files = e.files.map(f => {
                 
                  let nameCheck = f.title.split('.');
                  
                  if(nameCheck[nameCheck.length - 1] === 'gdoc'){

                    // console.log('nameCheck in google doc', f.title, fi.data.files);

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

              console.log('NEW NEW proj while whrtie', newProj);
              
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
                    
                      // console.log('response', response, state)
                      // let newFiles = state.projectData.entries[entryIndex].files;
                      let newFile = { title: `${file.name}`, fileType: nameF[nameF.length - 1], context: "null", fileId: response.data.id }
        
                      fileList = [...fileList, newFile];
                
                      // const entries = state.projectData.entries.map((d: EntryType, i: number) =>
                      //   entryIndex === i ? { ...d, files: newFiles } : d
                      // );
                
                      // const newProjectData = { ...state.projectData, entries };
                      // console.log('new project', newProjectData);
                      // return saveJSON(newProjectData, state);
                      
                    }
                  );
            
            });

            return fileList;
}

const readProjectFile = (folderPath: string, fileName: string) => {
  const filePath = path.join(folderPath, fileName);
  const fileContents = fs.readFileSync(filePath, { encoding: 'utf-8' });
  return JSON.parse(fileContents);
};

// const appStateReducer = (state, action) => {
//   //console.log("WATCH THIS HERE",'state', state, 'action', action);
  
//   switch (action.type) {
//    case 'SET_DATA': {

//       // getGoogleIds(action.projectData, state);
//       //addMetaDescrip(action.projectData, state);

//       const baseDir = action.folderName;

//       let topics = [];
//       try {
//         topics = readProjectFile(baseDir, 'lda_run.json');
//       } catch (e) {
//         console.log(e);
//       }

//       let newEntries;
//       try {
//         const collo = readProjectFile(baseDir, 'entry_collocations.json');
//         const tfidf = readProjectFile(baseDir, 'keywords.json');


//         console.log('TFIDF', tfidf);
//         newEntries = action.projectData.entries.map((e, i) => {
//             e.collo = collo[i];
//             if(i < tfidf['entry_keywords'].length){
//               e.tfidf = tfidf['entry_keywords'][i]
//             }else{
//               e.tfidf = null;
//             }
//             return e;
//           });         
//       } catch (e) {
//         newEntries = action.projectData.entries;
//         console.log(e);
//       }


//       let newConcepts = [];
//       try {
//         const conCord = readProjectFile(baseDir, 'concept_concord_by_entry.json');

//         newConcepts = action.projectData.concepts.map((e, i) => {
//           // e.concordance = conCord.filter(c => c.concept === e.name)[0];

//           e.concordance = conCord.concept_matches.filter(f=> {
//             return f.matches.filter(t=> t.name === e.name).length > 0;
//           });
          
//           return e;
//         });
//       } catch (e) {
//         console.log(e);
//       }

//       const newProjectData = {
//         ...action.projectData,
//         concepts: newConcepts,
//         entries: newEntries,
//         topics,
//       };

//       console.log('newProject data', newProjectData);

//       return {
//         folderPath: action.folderName,
//         projectData: newProjectData,
//         filterTags: [],
//         searchConcept: null
//       };
//     }

//     case 'CREATE_CONCEPT':{
      
//       const newConcepts  = [
//         ...state.projectData.concepts,
//         { name: action.title, actions: [ {action: 'created', when: new Date().toISOString() }] },
//       ];

//       const newProjectData = {
//         ...state.projectData,
//         concepts: newConcepts
//       };

//       return saveJSON(newProjectData, state);

//     }

//     case 'DELETE_CONCEPT':{
    
//        const newConcepts  = state.projectData.concepts.map(m => {
        
//            if(m.name === action.title.name){
          
//              m.actions = [...m.actions, { action:'deleted', when: new Date().toISOString() }]
//            }
//            return m;
//          });

//        const newProjectData = {
//          ...state.projectData,
//          concepts: newConcepts
//        };
 
//        return saveJSON(newProjectData, state);
 
//     }

//     case 'MERGE_CONCEPT':{
       
//        const newConcepts  = state.projectData.concepts.map(m => {
        
//         if(m.name === action.fromName){

//           m.actions = [...m.actions, { action:'merged', with: action.mergeName, when: new Date().toISOString() }]
//         }
//         return m;
//       });
      
//        const newProjectData = {
//         ...state.projectData,
//         concepts: newConcepts
//       };

//       return saveJSON(newProjectData, state);

      
//     }

//     case 'CREATE_EDGE':{
  
//       const newEdges  = [
//         ...state.projectData.edges,
//         { to: action.to, from: action.from, description: action.description, key: action.key, actions: [ {action: 'created', when: new Date().toISOString() }] },
//       ];

//       const newProjectData = {
//         ...state.projectData,
//         edges: newEdges,
//       };

//       return saveJSON(newProjectData, state);

//     }

//     case 'DELETE_EDGE':{
    
//       const newEdges  = state.projectData.edges.map(m => {
//           console.log('MMM', m.key, action.key)
//           if(m.key === action.key){
         
//             m.actions = [...m.actions, { action:'deleted', when: new Date().toISOString() }]
//           }
//           return m;
//         });

       
       
//       const newProjectData = {
//         ...state.projectData,
//         edges: newEdges,
//       };

//       return saveJSON(newProjectData, state);

//     }

//     case 'UPDATE_TITLE': {
//       const newProjectData = {
//         ...state.projectData,
//         title: action.title,
//       };

//       return saveJSON(newProjectData);
//     }

//     case 'ADD_TAG_TO_ENTRY': {
//       const { newTag, entryIndex } = action;

//       const existingTags = state.projectData.tags.map((k) => k.title);

//       const newColor = pickTagColor(state.projectData.tags);

//       let newTags;
//       if (!existingTags.includes(newTag.text)) {
//         newTags = [
//           ...state.projectData.tags,
//           // { title: newTag.text, color: 'black', date: new Date().toISOString() },
//           { title: newTag.text, color: newColor, date: new Date().toISOString() },
//         ];
//       } else {
//         newTags = state.projectData.tags;
//       }

//       const newEntries = state.projectData.entries.map(
//         (d: EntryType, i: number) =>
//           entryIndex === i ? { ...d, tags: [...d.tags, newTag.text] } : d
//       );

//       const newProjectData = {
//         ...state.projectData,
//         tags: newTags,
//         entries: newEntries,
//       };

//       return saveJSON(newProjectData, state);
//     }


//     case 'CREATE_GOOGLE_IN_ENTRY': {
//       const { name, fileType, fileId, entryIndex } = action;

//       let extension = fileType === 'document' ? 'gdoc' : 'gsheet';

//       console.log("this is firing in GDOC NAMEEEEE", name, fileType, fileId, entryIndex);

//       let newFiles = state.projectData.entries[entryIndex].files;

//       let newFile = {title: `${name}.${extension}`, fileType: extension, fileId: fileId}
        
//       //newFiles = [...newFiles, { title: `${name}.${extension}`, fileType: extension, fileId: fileId }];
//       newFiles = [...newFiles, newFile];

//       const entries = state.projectData.entries.map((d: EntryType, i: number) =>
//         entryIndex === i ? { ...d, files: newFiles } : d
//       );

//       const newProjectData = { ...state.projectData, entries };

//       console.log('ENTRIES', entries)

//       return saveJSON(newProjectData, state);
//     }

//     case 'ADD_URL': {
//       let newFiles = state.projectData.entries[action.entryIndex].files;
//       newFiles = [
//         ...newFiles,
//         { title: action.title, url: action.url, fileType: 'url' },
//       ];

//       const entries = state.projectData.entries.map((d: EntryType, i: number) =>
//         action.entryIndex === i ? { ...d, files: newFiles } : d
//       );

//       const newProjectData = { ...state.projectData, entries };
//       return saveJSON(newProjectData);
//     }

//     case 'ADD_FILES': {
//       const { fileList } = action;

//      console.log('ADD_FILES is this firing??', fileList)

//     //  if(fileList){

//     //       let copiedFiles: File[] = [];

//     //       for (const file of fileList) {
//     //         console.log('file', file.path)
//     //         try {
//     //           const destination = path.join(state.folderPath, file.name);
//     //           copyFileSync(file.path, destination);
//     //           console.log(`${file.path} was copied to ${destination}`);
//     //           copiedFiles = [...copiedFiles, { title: file.name, format: 'null', id: "" }];
//     //         } catch (e) {
//     //           console.log('Error', e.stack);
//     //           console.log('Error', e.name);
//     //           console.log('Error', e.message);

//     //           console.log('The file could not be copied');
//     //         }
//     //       }

//     //       const newProjectData = {
//     //         ...state.projectData,
//     //         entries: [
//     //           ...state.projectData.entries,
//     //           {
//     //             title: 'New entry',
//     //             description: '',
//     //             files: copiedFiles,
//     //             date: new Date().toISOString(),
//     //             tags: [],
//     //           },
//     //         ],
//     //       };

//     //       return saveJSON(newProjectData, state);
//     //     }
//       const copiedFiles = copyFiles(fileList, state.folderPath);

//       const newEntry: EntryType = {
//         title: 'New entry',
//         description: '',
//         files: copiedFiles,
//         date: new Date().toISOString(),
//         tags: [],
//         urls: [],
//       };
//       const newProjectData = {
//         ...state.projectData,
//         entries: [...state.projectData.entries, newEntry],
//       };


//      }
   
//     case 'DELETE_FILE': {
//       const destination = path.join(state.folderPath, action.fileName);

//       const unattachFile = window.confirm(
//         `Really un-attach file ${action.fileName}?`
//       );

//       if (!unattachFile) {
//         return state;
//       }

//       let otherUses = false;
//       for (let i = 0; i < state.projectData.entries.length; i += 1) {
//         const entry = state.projectData.entries[i];

//         const fileNames = entry.files.map((f: File) => f.title);
//         console.log({ entry, fileNames, i, ind: action.entryIndex });
//         if (i !== action.entryIndex && fileNames.includes(action.fileName)) {
//           otherUses = true;
//           break;
//         }
//       }

//       if (!otherUses) {
//         const deleteFile = window.confirm(
//           `File ${action.fileName} is not attached to any other entries - delete from project directory?`
//         );

//         if (deleteFile) {
//           fs.unlinkSync(destination);
//         }
//       }

//       if (!otherUses) {
//         const deleteFile = window.confirm(
//           `File ${action.fileName} is not attached to any other entries - delete from project directory?`
//         );

//         if (deleteFile) {
//           fs.unlinkSync(destination);
//         }
//       }
      
//       const entries = state.projectData.entries.map((d: EntryType, i: number) =>
//         action.entryIndex === i
//           ? { ...d, files: d.files.filter((f) => f.title !== action.fileName) }
//           : d
//       );

//       const newProjectData = { ...state.projectData, entries };
//       return saveJSON(newProjectData, state);
//     }

//     case 'ADD_ENTRY': {
//       const newEntry: EntryType = {
//         title: 'New entry',
//         description: '',
//         files: [],
//         date: new Date().toISOString(),
//         tags: [],
//         urls: [],
//       };

//       const newProjectData = {
//         ...state.projectData,
//         entries: [...state.projectData.entries, newEntry],
//       };

//       return saveJSON(newProjectData);
//     }
//     case 'DELETE_ENTRY': {
//       const confirmed = window.confirm(
//         'Are you sure that you want to delete this entry? This will not delete attached files.'
//       );
//       if (!confirmed) {
//         return state;
//       }

//       const newProjectData = {
//         ...state.projectData,
//         entries: state.projectData.entries.filter(
//           (e, i: number) => i !== action.entryIndex
//         ),
//       };

//       return saveJSON(newProjectData, state);
//     }

//     case 'ADD_URL': {
//       console.log('LOG URL');

//       let newFiles = state.projectData.entries[action.entryIndex].files;
        
//       newFiles = [...newFiles, { title: action.url, fileType:"url"}];

//       const entries = state.projectData.entries.map((d: EntryType, i: number) =>
//       action.entryIndex === i ? { ...d, files: newFiles } : d
//       );

//       const newProjectData = { ...state.projectData, entries };

//       return saveJSON(newProjectData, state);


//     }

//     case 'UPDATE_ENTRY_FIELD': {
//       const entries = state.projectData.entries.map((d: EntryType, i: number) =>
//         action.entryIndex === i
//           ? { ...d, [action.fieldName]: action.newValue }
//           : d
//       );

//       const newProjectData = { ...state.projectData, entries };

//       return saveJSON(newProjectData, state);
//     }

//     case 'FILE_META': {

//       console.log('is this reaching??')

//       const entries = state.projectData.entries.map((d: EntryType, i: number) => {
   
//         if(action.entryIndex === i){
//           d.files.map((f, j)=> {
//             if(j === action.indexFile){
//               f.context = action.metaForm;
//             }
//             return f;
//           })
//         }
//         return d;
//       });

     
//       const newProjectData = { ...state.projectData, entries };

//       return saveJSON(newProjectData, state);

//     }

//     case 'UPDATE_TAG_COLOR': {
//       const tags = state.projectData.tags.map((tag: TagType, i: number) =>
//         i === action.tagIndex ? { ...tag, color: action.color } : tag
//       );

//       const newProjectData = { ...state.projectData, tags };

//       return saveJSON(newProjectData, state);
//     }
//     case 'UPDATE_TAG_NAME': {
//       const tags = state.projectData.tags.map((tag: TagType, i: number) =>
//         i === action.tagIndex ? { ...tag, title: action.title } : tag
//       );

//       const oldTitle = state.projectData.tags[action.tagIndex].title;

//       const entries = state.projectData.entries.map((entry: EntryType) => ({
//         ...entry,
//         tags: entry.tags.map((t) => (t === oldTitle ? action.title : t)),
//       }));

//       const newProjectData = { ...state.projectData, tags, entries };

//       return saveJSON(newProjectData, state);
//     }

//     case 'DELETE_TAG': {
//       const tags = state.projectData.tags.filter(
//         (tag: TagType) => tag.title !== action.title
//       );

//       const entries = state.projectData.entries.map((e: EntryType) => ({
//         ...e,
//         tags: e.tags.filter((t) => t !== action.title),
//       }));

//       const newProjectData = { ...state.projectData, tags, entries };

//       return saveJSON(newProjectData, state);
//     }

//     case 'UPDATE_FILTER_TAGS': {
//       return { ...state, filterTags: action.filterTags };
//     }

//     case 'UPDATE_SEARCH_CONCEPT': {
//       console.log('UPDATING', action)
//       return {...state, searchConcept : action.searchConcept };
//     }

//     default: {
//       console.log("Can't handle:", action);
//       return state;
//     }
//   }
// };


const appStateReducer = (state, action) => {
  const saveJSON = (newProjectData: any) => {
    fs.writeFileSync(
      path.join(state.folderPath, 'trrrace.json'),
      JSON.stringify(newProjectData, null, 4),
      (err) => {
        if (err) {
          console.log(`Error writing file to disk: ${err}`);
        } else {
          // parse JSON string to JSON object
          console.log(newProjectData);
        }
      }
    );

    return { ...state, projectData: newProjectData };
  };

  console.log('ACTION:', action);
  switch (action.type) {
    case 'SET_DATA': {
      return {
        folderPath: action.folderName,
        projectData: action.projectData,
        filterTags: [],
      };
    }

    case 'UPDATE_TITLE': {
      const newProjectData = {
        ...state.projectData,
        title: action.title,
      };

      return saveJSON(newProjectData);
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
          // { title: newTag.text, color: newColor },
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
//   case 'ADD_FILES_TO_ENTRY': {
//       const { fileList, entryIndex } = action;

// //       let newFiles = state.projectData.entries[entryIndex].files;
// //       for (const file of fileList) {
// //         console.log('file in fileList', file);
// //         try {
// //           const destination = path.join(state.folderPath, file.name);
// //           let nameCheck = file.name.split(".");
        
// //           if(nameCheck[nameCheck.length - 1] === 'gdoc'){
// //             let test = state.projectData.entries.flatMap(m=> m.files.map(fil => fil.title));

// //             console.log('google file!', file.name, test.indexOf(file.name), test)

// //             if(test.indexOf(file.name) === -1){
// //                 copyGoogle(file, entryIndex, state, "null");
// //             }else{
// //               console.log('already herr');
// //               let newFiles = state.projectData.entries[entryIndex].files;

// //               let newFile = { title: `${file.name}`, fileType: nameCheck[nameCheck.length - 1], context: "null" };
        
// //               newFiles = [...newFiles, newFile];
        
// //               const entries = state.projectData.entries.map((d: EntryType, i: number) =>
// //                 entryIndex === i ? { ...d, files: newFiles } : d
// //               );
        
// //               const newProjectData = { ...state.projectData, entries };
// //               console.log('new project same doc', newProjectData);
// //               return saveJSON(newProjectData, state);
// //             }
           

// //           }else{
// // //NEED TO INTEGRATE THIS MORE
// //           let saveFile = true;
// //           let destination = path.join(state.folderPath, file.name);
// //           let newName = file.name;

// //           if (fs.existsSync(destination)) {
// //             saveFile = window.confirm(
// //               `A file with name ${newName} has already been imported. Do you want to import this file anyway, with a modified name?`
// //             );

// //             let i = 1;
// //             do {
// //               const parts = file.name.split('.');
// //               const base = parts.slice(0, -1).join('');
// //               const extension = parts.slice(-1)[0];
// //               newName = `${base} (${i}).${extension}`;

// //               destination = path.join(state.folderPath, newName);
            

// //               i += 1;
// //             } while (fs.existsSync(destination));
// //           }

// //           if (saveFile) {
          
// //             copyFileSync(file.path, destination);
// //             console.log(`${file.path} was copied to ${destination}`);
// //             if(nameCheck[nameCheck.length - 1] === 'txt'){

// //               let test = fs.readFileSync(destination,{ encoding: 'utf8' });

// //               newFiles = [...newFiles, { title: newName, fileType: nameCheck[nameCheck.length - 1], context: "null" }];
// //             }else{

// //               newFiles = [...newFiles, { title: newName, fileType: nameCheck[nameCheck.length - 1], context: "null" }];
// //             }
// //           }
// //         }
// //         } catch (e) {
// //           console.log('Error', e.stack);
// //           console.log('Error', e.name);
// //           console.log('Error', e.message);

// //           console.log('The file could not be copied');
// //         }
// //       }

//       const currentFiles = state.projectData.entries[entryIndex].files;
//       const newFiles = [
//         ...currentFiles,
//         ...copyFiles(fileList, state.folderPath),
//       ];
//       const entries = state.projectData.entries.map((d: EntryType, i: number) =>
//         entryIndex === i ? { ...d, files: newFiles } : d
//       );

//       const newProjectData = { ...state.projectData, entries };

//       return saveJSON(newProjectData, state);
//     }

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

    case 'ADD_FILES': {
      const { fileList } = action;

      console.log('ADD_FILES:', fileList);

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
        console.log({ entry, fileNames, i, ind: action.entryIndex });
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
      return { ...state, filterTags: action.filterTags };
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
