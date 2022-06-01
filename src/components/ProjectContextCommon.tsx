import { v4 as uuidv4 } from 'uuid';
import { sendToFlask } from '../flaskHelper';
import { EntryType, TagType } from './types';
// import {toString} from 'nlcst-to-string'
// import {retext} from 'retext'
// import retextPos from 'retext-pos'
// import retextKeywords from 'retext-keywords'

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

export const getAppStateReducer = (copyFiles: any, readProjectFile: any, saveJSON: any, saveJSONRT: any, deleteFileAction: any, isReadOnly: boolean) => {

  console.log('project state reducer in project context common');
  
  return (state: any, action: any) => {
    /**
     *  function for set data that checks to see if the file exists and if not, creates one.
     * research_threads = readProjectFile(baseDir, 'research_threads.json');
     */

     const checkRtFile = async (dir: any) => {
      const filePath = dir[dir.length - 1] != '/' ? `${dir}/` : dir;

      try {
        const res = await readProjectFile(dir, 'research_threads.json', null);
        return res;
      } catch (e) {
        const rtOb = {
          title: action.projectData.title,
          research_threads: [],
        };
        saveJSONRT(rtOb, filePath, state);
        return rtOb;
      }
    };

    

    const getData = async (action:any, isReadOnly:boolean) => {
      const baseDir = action.folderName;

      let roleData;
      let google_data: any;
      let txt_data: any;
      let artifact_types: any;
      let google_em: any;
      let google_comms: any;
      let linkData: any;
      let newEntries = [...action.projectData.entries];
     
      try {
        google_em = await readProjectFile(baseDir, 'goog_em.json', null);
        console.log('yes to google em file');
      } catch (e: any) {
        console.error('could not load google em file');
        google_em = null;
      }

      try {
        google_data = await readProjectFile(baseDir, 'goog_data.json', null);
        console.log('yes to goog data file');
      } catch (e: any) {
        console.error('could not load google data file');
      }

      try {
        google_comms = await readProjectFile(baseDir, 'goog_comms.json', null);
        console.log('yes to goog comments');
      } catch (e) {
        google_comms = null;
        console.log('could not load goog comments');
      }

      try {
        txt_data = await readProjectFile(baseDir, 'text_data.json', null);
        console.log('yes to txtData');
      } catch (e) {
        txt_data = null;
        console.error('could not load text data');
      }

      try {
        roleData = await readProjectFile(baseDir, 'roles.json', null);
        console.log('yes to role data');
      } catch (e) {
        console.error('could not load role data');
      }

      try {
        artifact_types = await readProjectFile(baseDir, 'artifactTypes.json', null);
        console.log('yes to artifact types data');
      } catch (e) {
        artifact_types = null;
        console.error('could not load artifact types');
      }

      try {
        linkData = await readProjectFile(baseDir, 'links.json', null);
        console.log('yes to linkData');
      } catch (e) {
        linkData = null;
        console.error('could not load linkData');
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
      const research_threads = await checkRtFile(baseDir);
      console.log({ research_threads });

      const newProjectData = {
        ...action.projectData,
        entries: newEntries,
        roles: roleData,
        eventArray: action.projectData.eventArray
          ? action.projectData.eventArray
          : []
      };

      return {
        folderPath: action.folderName,
        projectData: newProjectData,
        isReadOnly: isReadOnly,
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
        linkData:linkData,
        hopArray: [],
        goBackView: 'overview',
        artifactTypes: artifact_types,
        threadTypeFilterArray: [
          { type: 'activity', show: true },
          { type: 'artifact', show: true },
          { type: 'fragment', show: true },
          { type: 'tags', show: true }
        ]
      };
    };

    switch (action.type) {
      // case 'SET_DATA': {
      //   const baseDir = action.folderName;

      //   console.log(action.type, action.folderName)

      //   let roleData;
      //   let google_data: any;
      //   let txt_data: any;
      //   let artifact_types: any;
      //   let google_em: any;
      //   let google_comms: any;

      //   let newEntries = [...action.projectData.entries];

      //   try {
      //     google_em = await readProjectFile(baseDir, 'goog_em.json', null);
        
      //   } catch (e: any) {
      //     console.error('could not load google em file');
      //     google_em = null;
      //   }

      //   try {
      //     google_data = await readProjectFile(baseDir, 'goog_data.json', null);
         
      //   } catch (e: any) {
      //     console.error('could not load google data file');
      //   }

      //   try {
      //     google_comms = readProjectFile(baseDir, 'goog_comms.json', null);
      
      //   } catch (e) {
      //     google_comms = null;
      //     console.log('could not load goog comments');
      //   }

      //   try {
      //     txt_data = readProjectFile(baseDir, 'text_data.json', null);
        
      //   } catch (e) {
      //     txt_data = null;
      //     console.error('could not load text data');
      //   }

      //   try {
      //     roleData = readProjectFile(baseDir, 'roles.json', null);
        
      //   } catch (e) {
      //     console.error('could not load role data');
      //   }

      //   try {
      //     artifact_types = readProjectFile(baseDir, 'artifactTypes.json', null);
        
      //   } catch (e) {
      //     artifact_types = null;
      //     console.error('could not load artifact types');
      //   }

      //   try {
      //     newEntries = action.projectData.entries.map((e:any, i:number) => {
      //       e.index = i;
      //       e.key_txt = txt_data
      //         ? txt_data['text-data'].filter((td) => td['entry-index'] === i)
      //         : [];

      //       e.files = e.files.map((ef:any, j:number) => {
      //         if (ef.fileType === 'gdoc') {
      //           // ef.artifactType = 'notes'
      //           ef.emphasized = google_em ? google_em[ef.fileId] : [];
      //           ef.comments = google_comms ? google_comms[ef.fileId] : [];
      //         }else if(ef.fileType === 'txt'){

      //           // if(j < 2){

      //           //   const file = readSync(`${baseDir}/${ef.title}`)

      //           //   retext()
      //           //     .use(retextPos) // Make sure to use `retext-pos` before `retext-keywords`.
      //           //     .use(retextKeywords)
      //           //     .process(file)
      //           //     .then((file) => {
                    
      //           //       ef.keywords = file.data.keywords;
      //           //       ef.keyPhrases = file.data.keyphrases;
      //           //     // file.data.keywords.forEach((keyword) => {
      //           //     //  
      //           //     // })

      //           // //     console.log('Key-phrases:')
      //           // //     file.data.keyphrases.forEach((phrase) => {
      //           // //       console.log(phrase.matches[0].nodes.map((d) => toString(d)).join(''))
      //           // //     })
      //           //   })
      //           // }
      //         }
      //         // else if(ef.fileType === 'pdf'){
      //         //   ef.artifactType = 'related work';
      //         // }
      //         // else if(ef.title.includes('.png')){
      //         //   ef.artifactType = 'sketch';
      //         // }

      //         // else if(ef.title.includes('https:/')){
      //         //   ef.artifactType = 'link';
      //         // }
      //         // else if(ef.fileType === 'txt'){
      //         //   ef.artifactType = 'transcript';
      //         // }
      //         // else if(ef.fileType === 'eml'){
      //         //   ef.artifactType = 'correspondence'
      //         // }
      //         // else if(ef.fileType === 'csv' || ef.fileType === 'phy' || ef.fileType === 'htm'){
      //         //   ef.artifactType = 'data'
      //         // }else if(ef.fileType === 'gif' || ef.fileType === 'jpg'){
      //         //   ef.artifactType = 'tool artifact'
      //         // }
      //         // else if(ef.title.includes('Screen ')){
      //         //   ef.artifactType = 'tool artifact';
      //         // }
      //         ef.artifactType = ef.artifactType ? ef.artifactType : '';
      //         if(ef.fileType === 'txt'){
      //           // console.log('FILE WITH KEYS?', ef);
      //         }
              
      //         return ef;
      //       });
      //       // }

      //       return e;
      //     });
      //   } catch (e) {
      //     newEntries = action.projectData.entries;

      //     return e;
      //   }
      //   console.log('base dir in set data', baseDir);
      //   const research_threads = checkRtFile(baseDir);

      //   const newProjectData = {
      //     ...action.projectData,
      //     entries: newEntries,
      //     roles: roleData,
      //     eventArray: action.projectData.eventArray
      //       ? action.projectData.eventArray
      //       : [],
      //   };

      //   return {
      //     folderPath: action.folderName,
      //     projectData: newProjectData,
      //     googleData: google_data,
      //     txtData: txt_data,
      //     researchThreads: research_threads,
      //     selectedThread: null,
      //     filterTags: [],
      //     filterType: null,
      //     filterDates: [null, null],
      //     filterRT: null,
      //     filterQuery: null,
      //     query: null,
      //     hopArray: [],
      //     goBackView: 'overview',
      //     artifactTypes: artifact_types,
      //     threadTypeFilterArray: [
      //       { type:'activity', show:true },
      //       { type:'artifact', show:true },
      //       { type:'fragment', show:true },
      //       { type:'tags', show:true }
      //     ],
      //   };
      // }

      case 'SET_DATA': {
        // loading a project requires waiting for files to load over the network
        // the simplest way to handle this is to handle this in an async function,
        // and dispatch a new message to save the project data when it is ready
        getData(action, isReadOnly).then(data => action.dispatch({ type: 'SAVE_DATA', data }));
        return state;
      }
      case 'SAVE_DATA': {
        return action.data;
      }

      case 'UPDATE_RT_TYPE_SHOWN': {
        return {...state, threadTypeFilterArray : action.threadTypeFilterArray}
      }

      case 'UPDATE_TITLE': {
        const newProjectData = {
          ...state.projectData,
          title: action.title,
        };

        return saveJSON(newProjectData, state);
      }

      case 'CREATE_GOOGLE_IN_ENTRY': {
        const { name, fileType, fileId, entryIndex } = action;
  
        let extension = fileType === 'document' ? 'gdoc' : 'gsheet';
  
        console.log("this is firing in GDOC NAMEEEEE", name, fileType, fileId, entryIndex);
  
        const currentFiles = state.projectData.entries[entryIndex].files;
        const newFiles = [
          ...currentFiles,
        
          {title: `${name}.${extension}`, fileType: extension, artifactType:'memo', fileId: fileId, context: "null"}
        ];
        const entries = state.projectData.entries.map((d: EntryType, i: number) =>
          entryIndex === i ? { ...d, files: newFiles } : d
        );
  
        const newProjectData = { ...state.projectData, entries };
  
        return saveJSON(newProjectData, state);
      }
     
      case 'BOOKMARK_FRAGMENT':{
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

      case 'UPDATE_THREAD_FIELD': {
        const {threadIndex, fieldName, newValue } = action;
        const newRT = { ...state.researchThreads };
        if(fieldName === 'title'){
          newRT.research_threads[threadIndex].title = newValue;
        }
        if(fieldName === 'description'){
          newRT.research_threads[threadIndex].description = newValue;
        }
        if(fieldName === 'merge'){

          console.log('theadIndex')
          let filterThreads = newRT.research_threads
          newRT.research_threads[threadIndex].actions.push({action: "merge", to: newValue, when: new Date()});
          let newAddIndex = newRT.research_threads.indexOf(f => f.title === newValue);
          console.log('newAddIndex',newAddIndex)
          newRT.research_threads[newAddIndex].actions.push({action: "mergeAdd", from: newRT.research_threads[threadIndex].title, when: new Date()})
          newRT.research_threads[newAddIndex].evidence = [...newRT.research_threads[newAddIndex], newRT.research_threads[threadIndex].evidence]
        }
    
        return saveJSONRT(newRT, state.folderPath, state);
      }

      case 'MERGE_THREADS':{
        const {fromThread, toThread} = action;

        const newRT = { ...state.researchThreads };

        let fromIndex = newRT.research_threads.map(m => m.title).indexOf(fromThread);
        let toIndex = newRT.research_threads.map(m => m.title).indexOf(toThread);

        newRT.research_threads[fromIndex].actions.push({action: "merge", to: newRT.research_threads[toIndex].title, when: new Date()});
        
        newRT.research_threads[toIndex].actions.push({action: "mergeAdd", from: newRT.research_threads[fromIndex].title, when: new Date()})
      
        let fromEvidence = newRT.research_threads[fromIndex].evidence.map(m => {
          m.mergedFrom = fromThread;
          return m;
        })
        let newEvidence = [...fromEvidence, ...newRT.research_threads[toIndex].evidence]
        
        
        newRT.research_threads[toIndex].evidence = newEvidence;
      
    
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

        console.log('this is hitting', activity, rationale, activityIndex, threadIndex)
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
         console.log('MADE IT TO CONTEXT',action.filterRT)
          let associatedByTags = state.projectData.entries.filter(f => {
            let test = f.tags.filter(tt => action.filterRT.associated_tags.includes(tt))
            return test.length > 0;
          });
          let associatedTest = associatedByTags.length > 0 ? associatedByTags.map(as => as.title).filter(at => action.filterRT.evidence.map((m) => m.activityTitle).indexOf(at) === -1) : []
          
          return {
            ...state,
            filterDates: [null, null],
            filterRT: {
              title: action.filterRT.title,
              key: action.filterRT.evidence.map((m) => m.activityTitle),
              associatedKey: associatedTest
            },
            selectedThread: action.selectedThread,
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

        return saveJSONRT(newRT, state.folderPath, state);
      }

      case 'DELETE_THREAD': {
        
        const newRT = state.researchThreads;
        newRT.research_threads = newRT.research_threads.filter((ft: any) => ft.rt_id != action.deleteThread);
        console.log('newwww newww', newRT.research_threads);
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
          title: action.data.title,
          description: action.data.description,
          files: [],
          date: new Date(action.data.date).toISOString(),
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
