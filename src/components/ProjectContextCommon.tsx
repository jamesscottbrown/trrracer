import { v4 as uuidv4 } from 'uuid';
import { sendToFlask } from '../flaskHelper';

import { EntryType, TagType } from './types';

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

export const getAppStateReducer = (copyFiles, readProjectFile, saveJSON, saveJSONRT, deleteFileAction) => {
  return (state: any, action: any) => {
    /**
     *  function for set data that checks to see if the file exists and if not, creates one.
     * research_threads = readProjectFile(baseDir, 'research_threads.json');
     */

    const checkRtFile = (dir: any) => {
      const filePath = dir[dir.length - 1] != '/' ? `${dir}/` : dir;

      try {
        return readProjectFile(dir, 'research_threads.json', null);
      } catch (e) {
        const rtOb = {
          title: action.projectData.title,
          research_threads: [],
        };

        saveJSONRT(rtOb, filePath, state);
        return rtOb;
      }
    };



    switch (action.type) {
      case 'SET_DATA': {
        const baseDir = action.folderName;

        let roleData;
        let google_data: any;
        let txt_data: any;
        let artifact_types: any;
        let google_em: any;
        let google_comms: any;

        let newEntries = [...action.projectData.entries];

        try {
          google_em = readProjectFile(baseDir, 'goog_em.json', null);
          console.log('yes to google em file');
        } catch (e: any) {
          console.error('could not load google em file');
          google_em = null;
        }

        try {
          google_data = readProjectFile(baseDir, 'goog_data.json', null);
          console.log('yes to goog data file');
        } catch (e: any) {
          console.error('could not load google data file');
        }

        try {
          google_comms = readProjectFile(baseDir, 'goog_comms.json', null);
          console.log('yes to goog comments');
        } catch (e) {
          google_comms = null;
          console.log('could not load goog comments');
        }

        try {
          txt_data = readProjectFile(baseDir, 'text_data.json', null);
          console.log('yes to txtData');
        } catch (e) {
          txt_data = null;
          console.error('could not load text data');
        }

        try {
          roleData = readProjectFile(baseDir, 'roles.json', null);
          console.log('yes to role data');
        } catch (e) {
          console.error('could not load role data');
        }

        try {
          artifact_types = readProjectFile(baseDir, 'artifactTypes.json', null);
          console.log('yes to artifact types data');
        } catch (e) {
          artifact_types = null;
          console.error('could not load artifact types');
        }

        try {
          newEntries = action.projectData.entries.map((e, i) => {
            e.index = i;
            e.key_txt = txt_data
              ? txt_data['text-data'].filter((td) => td['entry-index'] === i)
              : [];

            e.files = e.files.map((ef) => {
              if (ef.fileType === 'gdoc') {
                // ef.artifactType = 'notes'
                ef.emphasized = google_em ? google_em[ef.fileId] : [];
                ef.comments = google_comms ? google_comms[ef.fileId] : [];
              }
              // else if(ef.fileType === 'pdf'){
              //   ef.artifactType = 'related work';
              // }
              // else if(ef.title.includes('.png')){
              //   ef.artifactType = 'sketch';
              // }

              // else if(ef.title.includes('https:/')){
              //   ef.artifactType = 'link';
              // }
              // else if(ef.fileType === 'txt'){
              //   ef.artifactType = 'transcript';
              // }
              // else if(ef.fileType === 'eml'){
              //   ef.artifactType = 'correspondence'
              // }
              // else if(ef.fileType === 'csv' || ef.fileType === 'phy' || ef.fileType === 'htm'){
              //   ef.artifactType = 'data'
              // }else if(ef.fileType === 'gif' || ef.fileType === 'jpg'){
              //   ef.artifactType = 'tool artifact'
              // }
              // else if(ef.title.includes('Screen ')){
              //   ef.artifactType = 'tool artifact';
              // }
              ef.artifactType = ef.artifactType ? ef.artifactType : '';
              return ef;
            });
            // }

            return e;
          });
        } catch (e) {
          newEntries = action.projectData.entries;

          return e;
        }
        console.log('base dir in set data', baseDir);
        const research_threads = checkRtFile(baseDir);

        const newProjectData = {
          ...action.projectData,
          entries: newEntries,
          roles: roleData,
          eventArray: action.projectData.eventArray
            ? action.projectData.eventArray
            : [],
        };

        return {
          folderPath: action.folderName,
          projectData: newProjectData,
          googleData: google_data,
          txtData: txt_data,
          researchThreads: research_threads,
          selectedThread: null,
          filterTags: [],
          filterType: null,
          filterDates: [null, null],
          filterRT: null,
          filterQuery: null,
          query: null,
          hopArray: [],
          goBackView: 'overview',
          artifactTypes: artifact_types,
          // eventArray: [],
        };
      }

      case 'UPDATE_TITLE': {
        const newProjectData = {
          ...state.projectData,
          title: action.title,
        };

        return saveJSON(newProjectData, state);
      }
     
      case 'BOOKMARK_FRAGMENT':{
        console.log('bookmark fragment', action.selectedArtifactEntry)
        let bookmarks = action.selectedArtifactEntry.files[action.selectedArtifactIndex].bookmarks ? action.selectedArtifactEntry.files[action.selectedArtifactIndex].bookmarks : [];
        let entryIndex = action.selectedArtifactEntry.index;
        bookmarks.push({ 'fragment': action.bookmarkFragment })

       
        const currentFiles = state.projectData.entries[entryIndex].files.map((f, i)=> {
          if(i === action.selectedArtifactIndex){
            f.bookmarks = bookmarks;
          }
          return f;
        });

        
        const entries = state.projectData.entries.map(
          (d: EntryType, i: number) =>
            entryIndex === i ? { ...d, files: currentFiles } : d
        );

        const newProjectData = { ...state.projectData, entries };

        const newPD = saveJSON(newProjectData, state);

        return newPD;
      }

      case 'REMOVE_BOOKMARK':{

        let bookmarks = action.selectedArtifactEntry.files[action.selectedArtifactIndex].bookmarks// ? action.selectedArtifactEntry.files[action.selectedArtifactIndex].bookmarks : [];
        let entryIndex = action.selectedArtifactEntry.index;
        bookmarks = bookmarks.filter((f, i) => i != action.fragIndex);//.push({ 'fragment': action.bookmarkFragment })

        const currentFiles = state.projectData.entries[entryIndex].files.map((f, i)=> {
          if(i === action.selectedArtifactIndex){
            f.bookmarks = bookmarks;
          }
          return f;
        });

        const entries = state.projectData.entries.map(
          (d: EntryType, i: number) =>
            entryIndex === i ? { ...d, files: currentFiles } : d
        );

        const newProjectData = { ...state.projectData, entries };

        const newPD = saveJSON(newProjectData, state);
        return newPD;
      }
      
      case 'ADD_EVENT': {
        const newProjectData = {
          ...state.projectData,
          // entries: newEntries,
          eventArray: action.eventArray,
        };
        return saveJSON(newProjectData, state);
      }

      case 'UPDATE_GO_BACK': {
        return {
          ...state,
          goBackView: action.goBackView,
          filterQuery: action.filterQuery,
        };
      }

      case 'ADD_TAG_TO_THREAD': {
        const { tag, threadIndex } = action;

        const newRT = { ...state.researchThreads };

        newRT.research_threads[threadIndex].associated_tags.push(tag);

        return saveJSONRT(newRT, state.folderPath, state);
      }

      case 'QUERY_TERM': {
        return {
          ...state,
          query: { term: action.term, matches: action.matches },
          filterQuery: action.matches.map((m) => m.entry.title),
        };
      }

      case 'ADD_ACTIVITY_TO_THREAD': {
        const { activity, rationale, activityIndex, threadIndex } = action;
        const newRT = state.researchThreads;
        const newA = {
          type: 'activity',
          dob: activity.date,
          activity_index: activityIndex,
          activityTitle: activity.title,
          rationale,
        };
        newRT.research_threads[threadIndex].evidence.push(newA);
        return saveJSONRT(newRT, state.folderPath);
      }

      case 'ADD_ARTIFACT_TO_THREAD': {
        const { activity, rationale, artifactIndex, threadIndex } = action;
        const newRT = state.researchThreads;
       
        const newA = {
          type: 'artifact',
          dob: activity.date,
          activity_index: activity.index,
          artifactIndex,
          activityTitle: activity.title,
          artifactTitle: activity.files[artifactIndex].title,
          rationale,
        };
        newRT.research_threads[threadIndex].evidence.push(newA);

        return saveJSONRT(newRT, state.folderPath, state);
      }

      case 'THREAD_FILTER': {
        if (action.filterRT) {
          console.log('action in filter', action.filterRT.associated_tags);
          let associatedByTags = state.projectData.entries.filter(f => {
            let test = f.tags.filter(tt => action.filterRT.associated_tags.includes(tt))
            return test.length > 0;
          })
          return {
            ...state,
            filterRT: {
              title: action.filterRT.title,
              key: action.filterRT.evidence.map((m) => m.activityTitle),
              associatedKey:
              associatedByTags.length > 0
                  ? associatedByTags.map(as => as.title)
                  : [],
            },
          };
        }
        return { ...state, filterRT: null, selectedThread: null };
      }

      case 'ADD_FRAGMENT_TO_THREAD': {
        const {
          activity,
          rationale,
          artifactIndex,
          threadIndex,
          fragment,
          fragmentType,
        } = action;
        const newRT = state.researchThreads;
        const newA = {
          type: 'fragment',
          dob: activity.date,
          activity_index: activity.index,
          artifactIndex,
          activityTitle: activity.title,
          artifactTitle: activity.files[artifactIndex].title,
          rationale,
          anchors: [{ anchor_type: fragmentType, frag_type: fragment }],
        };
        newRT.research_threads[threadIndex].evidence.push(newA);
        return saveJSONRT(newRT, state.folderPath, state);
      }

      case 'ADD_TAG_TO_ENTRY': {
        const { newTag, entryIndex } = action;

        const existingTags = state.projectData.tags.map((k) => k.title);
        const newColor = pickTagColor(state.projectData.tags);
        let newTags;

        console.log(newTag, entryIndex);

        if (!existingTags.includes(newTag.text)) {
          newTags = [
            ...state.projectData.tags,
            {
              title: newTag.text,
              color: newColor,
              date: new Date().toISOString(),
            },
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

        return saveJSON(newProjectData, state);
      }

      case 'ADD_FILES_TO_ENTRY': {
        const { fileList, entryIndex } = action;
        const currentFiles = state.projectData.entries[entryIndex].files;

        const newFiles = [
          ...currentFiles,
          ...copyFiles(fileList, state.folderPath),
        ];
        const entries = state.projectData.entries.map(
          (d: EntryType, i: number) =>
            entryIndex === i ? { ...d, files: newFiles } : d
        );

        const newProjectData = { ...state.projectData, entries };

        const newPD = saveJSON(newProjectData, state);
        console.log('file list', fileList);

        return newPD; 
      }

      case 'CREATED_GOOGLE_IN_ENTRY': {
        return action.newProjectData;
      }

      case 'HIGHLIGHT_TAG': {
        return { ...state, highlightedTag: action.highlightedTag };
      }

      case 'HIGHLIGHT_TYPE': {
        return { ...state, highlightedType: action.highlightedType };
      }

      case 'SELECTED_ARTIFACT': {
        return {
          ...state,
          selectedArtifactEntry: action.selectedArtifactEntry,
          selectedArtifactIndex: action.selectedArtifactIndex,
          hopArray: action.hopArray == Number ? hopArray : action.hopArray,
        };
      }

      case 'SELECTED_THREAD': {
        return { ...state, selectedThread: action.selectedThread };
      }

      case 'DELETE_EVIDENCE_FROM_THREAD': {
        return { ...state, researchThreads: action.researchThreads };
      }

      case 'ADD_URL': {
        let newFiles = state.projectData.entries[action.entryIndex].files;
        newFiles = [
          ...newFiles,
          { title: action.title, url: action.url, fileType: 'url' },
        ];

        const entries = state.projectData.entries.map(
          (d: EntryType, i: number) =>
            action.entryIndex === i ? { ...d, files: newFiles } : d
        );

        const newProjectData = { ...state.projectData, entries };
        return saveJSON(newProjectData, state);
      }

      case 'CREATE_THREAD': {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);

        const threadOb = {
          title: action.threadName,
          actions: [{ action: 'created', when: new Date() }],
          rt_id: uuidv4(),
          description: action.threadDescription,
          associated_tags: [],
          color: `#${randomColor}`,
          evidence: [],
        };
        const newRT = state.researchThreads;
        newRT.research_threads.push(threadOb);

        console.log('THREADOB', threadOb);

        return saveJSONRT(newRT, state.folderPath, state);
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

        return saveJSON(newProjectData, state);
      }

      case 'DELETE_FILE': {

        return deleteFileAction(action.fileName, action.entryIndex, state);

      }

      case 'ADD_ENTRY': {
        const newEntry: EntryType = {
          title: 'New entry',
          description: '',
          files: [],
          date: new Date().toISOString(),
          tags: [],
          urls: [],
          activity_uid: uuidv4(),
        };

        const newProjectData = {
          ...state.projectData,
          entries: [...state.projectData.entries, newEntry],
        };

        return saveJSON(newProjectData, state);
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

        return saveJSON(newProjectData, state);
      }

      case 'UPDATE_ENTRY_FIELD': {
        const entries = state.projectData.entries.map(
          (d: EntryType, i: number) =>
            action.entryIndex === i
              ? { ...d, [action.fieldName]: action.newValue }
              : d
        );
        console.log('in project state', entries);
        const newProjectData = { ...state.projectData, entries };
        console.log('new project data in project context', newProjectData);
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
        console.log('update filter', action.filterTags);
        return { ...state, filterTags: action.filterTags };
      }

      case 'UPDATE_FILTER_TYPES': {
        return { ...state, filterType: action.filterType };
      }

      case 'UPDATE_FILTER_DATES': {
        return { ...state, filterDates: action.filterDates };
      }

      case 'ADD_MARKS_TO_ARTIFACT': {
        const { markers, activity, artifactIndex } = action;

        const newFile = activity.files[artifactIndex];
        newFile.markers = markers;
        const entryIndex = activity.index;
        state.projectData.entries[entryIndex].files[artifactIndex] = newFile;

        const { entries } = state.projectData;
        entries[entryIndex].files[artifactIndex] = newFile;
        const newProjectData = { ...state.projectData, entries };

        return saveJSON(newProjectData, state);
      }

      case 'HOVER_OVER_ACTIVITY': {
        return {
          ...state,
          hoverActivity: action.hoverActivity,
        };
      }

      case 'HOVER_THREAD': {
        console.log('actionnnnn', action.researchThreadHover);

        return {
          ...state,
          researchThreadHover: action.researchThreadHover,
        };
      }

      default: {
        console.log("Can't handle:", action);
        return state;
      }
    }
  };
};
