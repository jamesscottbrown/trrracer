import { v4 as uuidv4 } from 'uuid';
import React, { createContext, useContext, useReducer } from 'react';
import { EntryType, File, FileObj, ProjectState } from './types';

// import useGoogle from '../AuthenticateGoogleWeb';
import { getAppStateReducer } from './ProjectContextCommon';

const isElectron = process.env.NODE_ENV === 'development';

console.log('isElectron', isElectron);

let path: any;
let fs: any;
let googleCred: any;
let google: any;

if (isElectron) {
  console.log('IS THIS REACHING', path);
  path = require('path');
  fs = require('fs');
  // googleCred = require('../../assets/google_cred_desktop_app.json');
  // google = require('googleapis').google;
}

export const ProjectContext = createContext<DispatchType>();

type DispatchType = [ProjectState, (msg: any) => ProjectState];

export function useProjectState() {
  return useContext<DispatchType>(ProjectContext);
}

const copyFiles = (fileList: FileObj[], folderPath: string) => {
  let newFiles: File[] = [];
  if (isElectron) {
    for (const file of fileList) {

      console.log('FILE', file);
      const sourceIsInProjectDir = file.path && file.path.startsWith(folderPath);
      let destination = `${folderPath}/${file.name}`;//path.join(folderPath, file.name);
      /**
       * is it google??
       */
      const nameCheck = file.name.split('.');

      if (nameCheck[nameCheck.length - 1] === 'gdoc') {
        if (fs.existsSync(destination) && !sourceIsInProjectDir) {
          const newFile = {
            title: `${file.name}`,
            fileType: nameCheck[nameCheck.length - 1],
            context: 'null',
            artifactType: file.artifactType,
            artifact_uid: uuidv4(),
          };

          newFiles = [...newFiles, newFile];
        } else {
          copyGoogle(file, newFiles).then((fileArray) => {
            newFiles = [...fileArray];
          });
        }
      } else {
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
              fs.copyFileSync(file.path, destination);
            }

            newFiles = [
              ...newFiles,
              {
                title: newName,
                fileType: nameCheck[nameCheck.length - 1],
                context: 'null',
                artifactType: file.artifactType,
              },
            ];
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
  } else {
    return null;
  }
};

async function copyGoogle(file: any, fileList: any) {
  if (isElectron) {
    const oAuth2Client = new google.auth.OAuth2(
      googleCred.installed.client_id,
      googleCred.installed.client_secret,
      googleCred.installed.redirect_uris[0]
    );
    const token = fs.readFileSync('token.json', { encoding: 'utf-8' });
    oAuth2Client.setCredentials(JSON.parse(token));

    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    const nameF = file.name.split('.');

    drive.files
      .list({
        q: `name="${nameF[0]}" and trashed = false`,
        fields: 'nextPageToken, files(id, name)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      })
      .then((fi) => {
        const copyRequest = {
          // Modified
          name: nameF,
          parents: ['1-tPBWWUaf7CzNYRyVOqfZvmYg3I4r9Zg'],
        };

        drive.files.copy(
          {
            // Modified
            fileId: fi.data.files[0].id,
            requestBody: copyRequest, // or resource: copyRequest
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
          },
          function (err, response) {
            if (err) {
              console.log(err);
              // res.send("error");
              return;
            }
            // let newFiles = state.projectData.entries[entryIndex].files;
            const newFile = {
              title: `${file.name}`,
              fileType: nameF[nameF.length - 1],
              context: 'null',
              fileId: response.data.id,
              artifact_uid: uuidv4(),
            };

            fileList = [...fileList, newFile];
          }
        );
      });

    return fileList;
  } else {
    return null;
  }
}

export const readProjectFile = async (
  folderPath: string,
  fileName: string,
  fileType: any
) => {
  if (isElectron) {
    const filePath = path.join(folderPath, fileName);
    const fileContents = fs.readFileSync(filePath, { encoding: 'utf-8' });
    if (!fileType) {
      return JSON.parse(fileContents);
    }
  } else {
    const response = await fetch(`${folderPath}${fileName}`);

    if (!fileType) {
      return response.json();
    }
    return response.text();
  }
};

const saveJSON = (newProjectData: any, state) => {
  if (isElectron) {
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
  }

  return { ...state, projectData: newProjectData };
};

const saveJSONRT = (RTData: any, dir: string, state) => {
  if (isElectron) {
    fs.writeFileSync(
      path.join(dir, 'research_threads.json'),
      JSON.stringify(RTData, null, 4),
      (err) => {
        if (err) {
          console.log(`Error writing file to disk: ${err}`);
        } else {
          // parse JSON string to JSON object
        }
      }
    );
  }
  return { ...state, researchThreads: RTData };
};

const saveJSONGoogDoc = (GDData: any, dir: string, state) => {
  if (isElectron) {
    fs.writeFileSync(
      path.join(dir, 'goog_doc_data.json'),
      JSON.stringify(GDData, null, 4),
      (err) => {
        if (err) {
          console.log(`Error writing file to disk: ${err}`);
        } else {
          // parse JSON string to JSON object
        }
      }
    );
  }
  return { ...state, googDocData: GDData };
};

const deleteFileAction = (fileName, entryIndex, state) => {
  if (isElectron) {
    const destination = path.join(state.folderPath, fileName);

    const unattachFile = window.confirm(`Really un-attach file ${fileName}?`);

    if (!unattachFile) {
      return state;
    }

    let otherUses = false;
    for (let i = 0; i < state.projectData.entries.length; i += 1) {
      const entry = state.projectData.entries[i];

      const fileNames = entry.files.map((f: File) => f.title);

      if (i !== entryIndex && fileNames.includes(fileName)) {
        otherUses = true;
        break;
      }
    }

    if (!otherUses) {
      const deleteFile = window.confirm(
        `File ${fileName} is not attached to any other entries - delete from project directory?`
      );

      if (deleteFile) {
        fs.unlinkSync(destination);
      }
    }

    const entries = state.projectData.entries.map((d: EntryType, i: number) =>
      entryIndex === i
        ? {
            ...d,
            files: d.files.filter((f) => f.title !== fileName),
          }
        : d
    );

    const newProjectData = { ...state.projectData, entries };
    return saveJSON(newProjectData, state);
  } else {
    return null;
  }
};

const appStateReducer = getAppStateReducer(
  copyFiles,
  readProjectFile,
  saveJSON,
  saveJSONRT,
  saveJSONGoogDoc,
  deleteFileAction,
  !isElectron
);

const initialState: ProjectState = {
  projectData: null,
  folderPath: null,
  filterTags: [],
  filterType: null,
  filterDates: null,
  filterQuery: null,
  filterRT: null,
  threadTypeFilterArray: null,
  researchThreads: null,
  artifactTypes: null,
  query: null,
  isReadOnly: false,
};

export function ProjectStateProvider({ children }) {
  const reducer = useReducer(appStateReducer, initialState);

  return (
    <ProjectContext.Provider value={reducer}>
      {children}
    </ProjectContext.Provider>
  );
}
