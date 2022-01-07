import * as fs from 'fs';
import { copyFileSync } from 'fs';

import React, { createContext, useContext, useReducer } from 'react';
import path from 'path';

import MarkdownIt from 'markdown-it';

import { EntryType, File, FileObj, TagType } from './types';
import getEmptyProject from '../emptyProject';

export const ProjectContext = createContext();

export function useProjectState() {
  return useContext(ProjectContext);
}

const getQuoteTags = (description: string) => {
  let tagsInEntry: string[] = [];

  const formatter = MarkdownIt({
    html: true,
    highlight(str: string, lang: string) {
      if (lang === 'trrrace') {
        const [header, ...rest] = str.split('\n');
        const tagsInBlock = header.split(',').map((t) => t.trim());
        tagsInEntry = [...tagsInEntry, ...tagsInBlock];
      }
    },
  });

  formatter.render(description);
  return tagsInEntry;
};

const addQuoteTags = (entry: EntryType) => {
  return {
    ...entry,
    quoteTags: getQuoteTags(entry.description),
  };
};

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
    console.log('About to copy:', folderPath, file.path);

    const sourceIsInProjectDir = file.path.startsWith(folderPath);

    try {
      let saveFile = true;
      let destination = path.join(folderPath, file.name);
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
        newFiles = [...newFiles, { title: newName }];
      }
    } catch (e) {
      console.log('Error', e.stack);
      console.log('Error', e.name);
      console.log('Error', e.message);

      console.log('The file could not be copied');
    }
  }
  return newFiles;
};

const appStateReducer = (state, action) => {
  const saveJSON = (newProjectData) => {
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
      const newProjectData = {
        ...action.projectData,
        entries: action.projectData.entries.map((e: EntryType) =>
          addQuoteTags(e)
        ),
      };

      return {
        folderPath: action.folderName,
        projectData: newProjectData,
        filterTags: [],
        filterDates: [null, null],
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
          { title: newTag.text, color: newColor },
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
        quoteTags: [],
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
          ? {
              ...d,
              [action.fieldName]: action.newValue,
              quoteTags: getQuoteTags(d.description),
            }
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

    case 'UPDATE_FILTER_DATES': {
      console.log(
        state.filterDates.map((d: string, i: number) =>
          i === action.field ? action.value : d
        )
      );

      return {
        ...state,
        filterDates: state.filterDates.map((d: string, i: number) =>
          i === action.field ? action.value : d
        ),
      };
    }

    default: {
      console.log("Can't handle:", action);
      return state;
    }
  }
};

const initialState = {
  projectData: getEmptyProject(),
  folderPath: null,
  filterTags: [],
  filterDates: [null, null],
};

export function ProjectStateProvider({ children }) {
  const reducer = useReducer(appStateReducer, initialState);

  return (
    <ProjectContext.Provider value={reducer}>
      {children}
    </ProjectContext.Provider>
  );
}
