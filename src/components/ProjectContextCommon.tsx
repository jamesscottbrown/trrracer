import { v4 as uuidv4 } from 'uuid';
import { EntryType, TagType } from './types';

const queryString = require('query-string');

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

export const getAppStateReducer = (
  copyFiles: any,
  readProjectFile: any,
  saveJSON: any,
  saveJSONRT: any,
  saveJSONGoogDoc: any,
  deleteFileAction: any,
  isReadOnly: boolean
) => {
  return (state: any, action: any) => {
    /**
     *  function for set data that checks to see if the file exists and if not, creates one.
     * research_threads = readProjectFile(baseDir, 'research_threads.json');
     */

    const checkRtFile = async (dir: any) => {
      const filePath = dir[dir.length - 1] != '/' ? `${dir}/` : dir;

      try {
        return await readProjectFile(dir, 'research_threads.json', null);
      } catch (e) {
        const rtOb = {
          title: action.projectData.title,
          research_threads: [],
        };
        saveJSONRT(rtOb, filePath, state);
        return rtOb;
      }
    };

    const getData = async (action: any, isReadOnly: boolean) => {
      const baseDir = action.folderName;

      let roleData;
      let google_data: any;
      let txt_data: any;
      let artifact_types: any;
      let google_em: any;
      let google_comms: any;
      let link_data: any;
      let views: any;
      let threadFil: any;
      let selectedActivity: any;
      let selectedArtifact: any;
      let newEntries = [...action.projectData.entries];
      let citationData = action.projectData.citations
        ? action.projectData.citations
        : [];
      let newTags = [...action.projectData.tags];

      const googleEnRequest = readProjectFile(baseDir, 'goog_em.json', null);
      const googleDataRequest = readProjectFile(baseDir, 'goog_doc_data.json', null);
      const googleCommsRequest = readProjectFile(baseDir, 'goog_comms.json', null);
      const txtDataRequest = readProjectFile(baseDir, 'text_data.json', null);
      const relDataRequest = readProjectFile(baseDir, 'roles.json', null);
      const artifactTypesRequest = readProjectFile(baseDir, 'artifactTypes.json', null);
      const linksRequest = readProjectFile(baseDir, 'links.json', null);

      try {
        google_em = await googleEnRequest;
      } catch (e: any) {
        console.error('could not load google em file');
        google_em = null;
      }

      try {
        // google_data = await readProjectFile(baseDir, 'goog_data.json', null);
        google_data = await googleDataRequest;
      } catch (e: any) {
        console.error('could not load google data file');
      }

      try {
        google_comms = await googleCommsRequest;
        // console.log('yes to goog comments');
      } catch (e) {
        google_comms = null;
        console.error('could not load goog comments');
      }

      try {
        txt_data = await txtDataRequest
        // console.log('yes to txtData');
      } catch (e) {
        txt_data = null;
        console.error('could not load text data');
      }

      try {
        roleData = await relDataRequest;
        // console.log('yes to role data');
      } catch (e) {
        console.error('could not load role data');
      }

      try {
        artifact_types = await artifactTypesRequest;
        // console.log('yes to artifact types data');
      } catch (e) {
        artifact_types = null;
        console.error('could not load artifact types');
      }

      try {
        link_data = await linksRequest;
        console.log('yes to linkData', baseDir);
      } catch (e) {
        link_data = null;
        console.error('could not load linkData');
      }

      try {
        newEntries = action.projectData.entries.map((e, i) => {
          let actOb = {};
          actOb.activity_uid = e.activity_uid;
          actOb.date = e.date;
          actOb.description = e.description;
          actOb.month = e.month;
          actOb.tags = e.tags;
          actOb.title = e.title;
          actOb.urls = e.urls;
          actOb.year = e.year;
          actOb.index = i;
          actOb.isPrivate = e.isPrivate ? e.isPrivate : false;
          actOb.files = e.files.map((ef) => {
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
            //           // if(j < 2){

            //   const file = readSync(`${baseDir}/${ef.title}`)

            //   retext()
            //     .use(retextPos) // Make sure to use `retext-pos` before `retext-keywords`.
            //     .use(retextKeywords)
            //     .process(file)
            //     .then((file) => {

            //       ef.keywords = file.data.keywords;
            //       ef.keyPhrases = file.data.keyphrases;
            //     // file.data.keywords.forEach((keyword) => {
            //     //
            //     // })

            // //     file.data.keyphrases.forEach((phrase) => {
           
            // //     })
            //   })
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

          return actOb;
        });

        newEntries = newEntries.sort(
          (a, b) =>
            // (reversedOrder ? -1 : +1) *
            Number(new Date(a.date)) - Number(new Date(b.date))
        );
      } catch (e) {
        console.error('could not reformat entries', e);
        return e;
      }

      try {
        newTags = newTags.map((t) => {
          let newT = {};
          newT.title = t.title;
          newT.color = t.color;
          newT.date = t.date;
          // newT.matches = t.matches.map(m => m.activity_uid);
          return newT;
        });
      } catch (e) {
        console.log('error with tags?');
      }

      const research_threads = await checkRtFile(baseDir);

      if (isReadOnly) {
        views = queryString.parse(location.search);

        if (Object.keys(views).length > 0) {
          if (views.granularity === 'thread') {
            let thisThread = research_threads.research_threads.filter(
              (f) => f.rt_id === views.id
            )[0];
            threadFil = {
              title: thisThread.title,
              rtId: views.id,
              rtIndex: research_threads.research_threads
                .map((rt: any) => rt.rt_id)
                .indexOf(views.id),
              key: thisThread.evidence.map((m: any) => m.activityTitle),
            };
          } else if (views.granularity === 'activity') {
            selectedActivity = views.id;
          } else if (views.granularity === 'artifact') {
            const activityTest = newEntries.filter((e) => {
              const test = e.files.filter((f) => f.artifact_uid === views.id);
              return test.length > 0;
            })[0];
            const artIn = activityTest.files
              .map((m) => m.artifact_uid)
              .indexOf(views.id);

            selectedArtifact = {
              activity: activityTest,
              artifactIndex: artIn,
            };
          }
        }
      }
      const newProjectData = {
        entries: newEntries,
        roles: roleData,
        citations: citationData,
        tags: newTags,
        // citations: action.projectData.citations,
        date: action.projectData.date,
        description: action.projectData.description,
        title: action.projectData.title,
        eventArray: action.projectData.eventArray
          ? action.projectData.eventArray
          : [],
      };

      return {
        folderPath: action.folderName,
        projectData: newProjectData,
        filteredActivities: newProjectData.entries,
        isReadOnly: isReadOnly,
        googleData: google_data,
        txtData: txt_data,
        researchThreads: research_threads,
        filterTags: [],
        filterType: null,
        filterDates: [null, null],
        filterRT: threadFil,
        filterQuery: null,
        query: null,
        linkData: link_data,
        hopArray: [],
        goBackView: 'overview',
        viewParams: views,
        artifactTypes: artifact_types,
        selectedActivityURL: selectedActivity,
        selectedArtifact: selectedArtifact,
        threadTypeFilterArray: [
          { type: 'activity', show: true },
          { type: 'artifact', show: true },
          { type: 'fragment', show: true },
          { type: 'tags', show: true },
        ],
        allRTs: [
          {
            title: 'UI and Design',
            id: '22fc1832-852c-43ac-9f2a-7cc057fdcd97',
            color: '#1340a8',
          },
          {
            title: 'Research Thread Concept',
            id: 'b973c840-f26c-4a21-99b3-b93e411d659c',
            color: '#84309b',
          },
        ],
        // citations: citationData
      };
    };

    const filterData = (
      fData: any,
      filterDates: any[],
      filterTags: any[],
      filterRT: any,
      filterType: any,
      filterQuery: any,
      researchThreads: any,
      threadTypeFilterArray: any
    ) => {
      // move that logic here
      const tagFiltered = [...fData]
        .filter((entryData: any) => {
          return filterTags.every((requiredTag: string) =>
            entryData.tags.includes(requiredTag)
          );
        })
        .map((e, index) => ({ ...e, index }));

      const typeFiltered = tagFiltered
        .filter((entryData: any) => {
          if (filterType) {
            if (filterType.includes('undefined')) {
              return entryData.files
                .map((m: any) => !m.artifactType || m.artifactType === '')
                .includes(true);
            }
            return entryData.files
              .map((m: any) => m.artifactType)
              .includes(filterType);
          }
          return entryData;
        })
        .map((e: EntryType, index: number) => ({ ...e, index }));

      const rtFiltered = typeFiltered.filter((entryData: any) => {
        if (filterRT) {
         
          return filterRT.key.includes(entryData.title);
        }
        return typeFiltered;
      });

      const rtTypesFiltered = rtFiltered.filter((entryData: any) => {
        if (filterRT) {
          let nono: any[] = [];
          let evidence = researchThreads?.research_threads.filter(
            (f) => f.title === filterRT.title
          )[0].evidence;

          threadTypeFilterArray.forEach((ty) => {
            if (!ty.show) {
              if (ty.type != 'tags') {
                let exclude = evidence
                  ?.filter((e) => e.type === ty.type)
                  .map((m) => m.activityTitle);
                nono = [...nono, exclude];
              }
            }
          });

          return nono.indexOf(entryData.title) === -1;
        }
        return typeFiltered;
      });

      const timeFiltered =
        filterDates[0] != null && filterDates[1] != null
          ? rtTypesFiltered.filter(
              (f) =>
                new Date(f.date) >= filterDates[0] &&
                new Date(f.date) <= filterDates[1]
            )
          : rtTypesFiltered;

      timeFiltered.sort(
        (a, b) =>
          // (reversedOrder ? -1 : +1) *
          Number(new Date(a.date)) - Number(new Date(b.date))
      );

      return filterQuery != null
        ? timeFiltered.filter((f) => filterQuery.includes(f.title))
        : timeFiltered;
    };

    switch (action.type) {
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

      case 'FILTER_DATA': {
        const newFiltered = filterData(
          state.projectData.entries,
          state.filterDates,
          state.filterTags,
          state.filterRT,
          state.filterType,
          state.filterQuery,
          state.researchThreads,
          state.threadTypeFilterArray
        );
        // saveJSON(state.projectData, state)
        return { ...state, filteredActivities: newFiltered };
      }

      case 'VIEW_PARAMS': {
     
        if (action.viewParams === null) {
          return {
            ...state,
            viewParams: action.viewParams,
            selectedActivityURL: null,
          };
        }
        return { ...state, viewParams: action.viewParams };
      }

      case 'FILE_META': {
        const { activityID, artifactTitle, artifactID, context } = action;
    
        const entries = [...state.projectData.entries].map((d: EntryType) => {
          if (d.activity_uid === activityID) {
            d.files.map((f: any) => {
              if (artifactID && f.artifact_uid === artifactID) {
                f.context = context;
               
              } else if (f.title === artifactTitle) {
                f.context = context;
               
              }
              return f;
            });
          }

          return d;
        });

        const newProjectData = { ...state.projectData, entries };

        return saveJSON(newProjectData, state);
      }

      case 'SET_FILTERED_ACTIVITIES': {
        return { ...state, filteredActivities: action.filteredActivities };
      }

      case 'UPDATE_RT_TYPE_SHOWN': {
        return {
          ...state,
          threadTypeFilterArray: action.threadTypeFilterArray,
        };
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

        const currentFiles = state.projectData.entries[entryIndex].files;
        const newFiles = [
          ...currentFiles,

          {
            title: `${name}.${extension}`,
            fileType: extension,
            artifactType: 'memo',
            fileId: fileId,
            context: 'null',
          },
        ];
        const entries = state.projectData.entries.map(
          (d: EntryType, i: number) =>
            entryIndex === i ? { ...d, files: newFiles } : d
        );

        const newProjectData = { ...state.projectData, entries };

        return saveJSON(newProjectData, state);
      }
      case 'UPDATE_GOOG_DOC_DATA': {
        setTimeout(() => {
          if (Object.keys(action.googDocData).length > 1) {
            return saveJSONGoogDoc(action.googDocData, state.folderPath, state);
          }
          return state;
        }, 1000);
     
        return state;
      }
      case 'UPDATE_GOOG_IDS': {
        const entries = [...state.projectData.entries].map((d: EntryType) => {
          let files = d.files.map((f: any) => {
            if (action.googFileIds && !f.title.includes('.txt')) {
              f.goog_ids = action.googFileIds[f.title]
                ? action.googFileIds[f.title]
                : null;
            }

            return f;
          });
          return d;
        });
        const newProjectData = { ...state.projectData, entries };

        return saveJSON(newProjectData, state);
      }
      case 'URL_SELECTED_ACTIVITY': {
      
        return { ...state, selectedActivityURL: action.selectedActivityURL };
      }
      case 'BOOKMARK_FRAGMENT': {
      //  selectedArtifactEntry: selectedArtifact.activity,
      //             selectedArtifactIndex: selectedArtifact.artifactIndex,
      //             bookmarkFragment: fragSelected,

        let bookmarks = action.selectedArtifactEntry.files[
          action.selectedArtifactIndex
        ].bookmarks
          ? action.selectedArtifactEntry.files[action.selectedArtifactIndex]
              .bookmarks
          : [];

        bookmarks.push({ fragment: action.bookmarkFragment });

        console.log('bookmark', bookmarks);

        const currentFiles = state.projectData.entries[action.selectedArtifactIndex].files.map(
          (f, i) => {
            if (i === action.selectedArtifactIndex) {
              f.bookmarks = bookmarks;
            }
            return f;
          }
        );

        const entries = state.projectData.entries.map((d: EntryType) =>
          action.selectedArtifactEntry.activity_uid === d.activity_uid
            ? { ...d, files: currentFiles }
            : d
        );
        
        const newProjectData = { ...state.projectData, entries };
        return saveJSON(newProjectData, state);
      }

      case 'REMOVE_BOOKMARK': {
        let bookmarks =
          action.selectedArtifactEntry.files[action.selectedArtifactIndex]
            .bookmarks;
        let entryIndex = action.selectedArtifactEntry.index;
        bookmarks = bookmarks.filter((f, i) => i != action.fragIndex); //.push({ 'fragment': action.bookmarkFragment })

        const currentFiles = state.projectData.entries[entryIndex].files.map(
          (f, i) => {
            if (i === action.selectedArtifactIndex) {
              f.bookmarks = bookmarks;
            }
            return f;
          }
        );

        const entries = state.projectData.entries.map(
          (d: EntryType, i: number) =>
            entryIndex === i ? { ...d, files: currentFiles } : d
        );

        const newProjectData = { ...state.projectData, entries };

        return saveJSON(newProjectData, state);
      }

      case 'ADD_EVENT': {
        const newProjectData = {
          ...state.projectData,
          // entries: newEntries,
          eventArray: action.eventArray,
        };
        return saveJSON(newProjectData, state);
      }

      case 'ADD_CITATION': {
        const newProjectData = {
          ...state.projectData,
          citations: action.citations,
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
        const { threadIndex, fieldName, newValue } = action;
        const newRT = { ...state.researchThreads };
        if (fieldName === 'title') {
          newRT.research_threads[threadIndex].title = newValue;
        }
        if (fieldName === 'description') {
          newRT.research_threads[threadIndex].description = newValue;
        }
        if (fieldName === 'merge') {
          newRT.research_threads[threadIndex].actions.push({
            action: 'merge',
            to: newValue,
            when: new Date(),
          });
          const newAddIndex = newRT.research_threads.indexOf(
            (f) => f.title === newValue
          );

          newRT.research_threads[newAddIndex].actions.push({
            action: 'mergeAdd',
            from: newRT.research_threads[threadIndex].title,
            when: new Date(),
          });
          newRT.research_threads[newAddIndex].evidence = [
            ...newRT.research_threads[newAddIndex],
            newRT.research_threads[threadIndex].evidence,
          ];
        }

        return saveJSONRT(newRT, state.folderPath, state);
      }

      case 'MERGE_THREADS': {
        const { fromThread, toThread } = action;

        const newRT = { ...state.researchThreads };

        let fromIndex = newRT.research_threads
          .map((m) => m.title)
          .indexOf(fromThread);
        let toIndex = newRT.research_threads
          .map((m) => m.title)
          .indexOf(toThread);

        newRT.research_threads[fromIndex].actions.push({
          action: 'merge',
          to: newRT.research_threads[toIndex].title,
          when: new Date(),
        });

        newRT.research_threads[toIndex].actions.push({
          action: 'mergeAdd',
          from: newRT.research_threads[fromIndex].title,
          when: new Date(),
        });

        const fromEvidence = newRT.research_threads[fromIndex].evidence.map(
          (m) => {
            m.mergedFrom = fromThread;
            return m;
          }
        );
        newRT.research_threads[toIndex].evidence = [
          ...fromEvidence,
          ...newRT.research_threads[toIndex].evidence,
        ];

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
          let associatedByTags = state.projectData.entries.filter((f) => {
            let test = f.tags.filter((tt) =>
              action.filterRT.associated_tags.includes(tt)
            );
            return test.length > 0;
          });
          let associatedTest =
            associatedByTags.length > 0
              ? associatedByTags
                  .map((as) => as.title)
                  .filter(
                    (at) =>
                      action.filterRT.evidence
                        .map((m) => m.activityTitle)
                        .indexOf(at) === -1
                  )
              : [];

          return {
            ...state,
            filterDates: [null, null],
            filterRT: {
              title: action.filterRT.title,
              key: action.filterRT.evidence.map((m) => m.activityTitle),
              rtIndex: action.rtIndex,
              rtId: action.filterRT.rt_id,
              associatedKey: associatedTest,
            },
          };
        }
        return { ...state, filterRT: null };
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
        const { newTag, activityID } = action;
        const existingTags = state.projectData.tags.map((k) => k.title);
        const newColor = pickTagColor(state.projectData.tags);
        let newTags;

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

        const newEntries = state.projectData.entries.map((d: EntryType) =>
          activityID === d.activity_uid
            ? { ...d, tags: [...d.tags, newTag.text] }
            : d
        );

        const newProjectData = {
          ...state.projectData,
          tags: newTags,
          entries: newEntries,
        };

        return saveJSON(newProjectData, state);
      }

      case 'ADD_FILES_TO_ENTRY': {
        const { fileList, activityID } = action;

        const currentFiles = state.projectData.entries.filter(
          (f) => f.activity_uid === activityID
        )[0].files;
        // const currentFiles = state.projectData.entries[entryIndex].files;

        const newFiles = [
          ...currentFiles,
          ...copyFiles(fileList, state.folderPath),
        ];
        const entries = state.projectData.entries.map((d: EntryType) =>
          d.activity_uid === activityID ? { ...d, files: newFiles } : d
        );

        const newProjectData = { ...state.projectData, entries };
        return saveJSON(newProjectData, state);
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
          selectedArtifact: {
            activity: action.activity,
            artifactIndex: action.artifactIndex,
          },
          hopArray: action.hopArray,
        };
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
          evidence: action.evidence,
        };
        const newRT = state.researchThreads;
        newRT.research_threads.push(threadOb);

        return saveJSONRT(newRT, state.folderPath, state);
      }

      case 'DELETE_THREAD': {
        const newRT = state.researchThreads;
        newRT.research_threads = newRT.research_threads.filter(
          (ft: any) => ft.rt_id != action.deleteThread
        );

        return saveJSONRT(newRT, state.folderPath, state);
      }

      case 'ADD_FILES': {
        const { fileList } = action;
        console.log('in add files',fileList, action.folderPath);
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
        const entries = [...state.projectData.entries].map((d: EntryType) => {
          return d.activity_uid === action.activityID
            ? { ...d, [action.fieldName]: action.newValue }
            : d;
        });
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
