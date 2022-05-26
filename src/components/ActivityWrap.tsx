import React, { useEffect, useRef } from 'react';
import { Divider } from '@chakra-ui/react';
import Entry from './Entry';
import ReadonlyEntry from './ReadonlyEntry';
import { openFile } from '../fileUtil';
import ThreadedReadonlyEntry from './ThreadedReadonlyEntry';
import { EntryTypeWithIndex } from './types';

type ActivityWrapPropType = {
  activityData: EntryTypeWithIndex;
  projectData:any;
  editable: boolean[];
  setEditableStatus: (index: number, isEditable: boolean) => void;
  setViewType: (v: any) => void;
  setSelectedArtifactIndex: number;
  setSelectedArtifactEntry: (e: any) => void;
  index: number;
  viewType: string;
  folderPath: any; 
  dispatch: (dis:any) => void; 
  researchThreads:any;
  filterRT:any;
};

const ActivityWrap = (props: ActivityWrapPropType) => {
  const {
    projectData,
    activityData,
    editable,
    setEditableStatus,
    setViewType,
    setSelectedArtifactIndex,
    setSelectedArtifactEntry,
    index,
    viewType,
    folderPath, 
    dispatch, 
    researchThreads,
    filterRT
  } = props;


  const myRef = useRef(null);

  const updateEntryField = (
    entryIndex: number,
    fieldName: string,
    newValue: any
  ) => {
    dispatch({ type: 'UPDATE_ENTRY_FIELD', entryIndex, fieldName, newValue });
  };
  if(editable[activityData.index]){

    return (
      <div 
      className='list-activity'
      ref={myRef}>
          <Entry
            /* eslint-disable-next-line react/no-array-index-key */
            key={`en-${activityData.title}-${activityData.index}-${index}`}
            entryData={activityData}
            entryIndex={activityData.index}
            openFile={openFile}
            updateEntryField={updateEntryField}
            allTags={projectData.tags}
            makeNonEditable={() => setEditableStatus(activityData.index, false)}
            viewType={viewType}
          />
        <Divider marginTop="1em" marginBottom="1em" />
      </div>
    );

  }else if(filterRT){

    return (
      <div 
        className='list-activity'
        ref={myRef} 
        style={{
          border:".5px solid #A3AAAF", 
          borderRadius:6,
          margin:5,
          boxShadow: "3px 3px 8px #A3AAAF"
          }}>
         <ThreadedReadonlyEntry
            /* eslint-disable-next-line react/no-array-index-key */
            key={`ro-${activityData.title}-${activityData.index}-${index}`}
            entryData={activityData}
            openFile={openFile}
            setViewType={setViewType}
            setSelectedArtifactIndex={setSelectedArtifactIndex}
            setSelectedArtifactEntry={setSelectedArtifactEntry}
            makeEditable={() => setEditableStatus(activityData.index, true)}
            viewType={viewType}
        />
      </div>
    );

  }else{

    return (
      <div 
      className='list-activity'
      id={activityData.title}
      ref={myRef}
        style={{
          border:".5px solid #A3AAAF", 
          borderRadius:6,
          margin:5,
          boxShadow: "3px 3px 8px #A3AAAF"
          }}>
         <ReadonlyEntry
          /* eslint-disable-next-line react/no-array-index-key */
          key={`ro-${activityData.title}-${activityData.index}-${index}`}
          entryData={activityData}
          openFile={openFile}
          setViewType={setViewType}
          makeEditable={() => setEditableStatus(activityData.index, true)}
          viewType={viewType}
          folderPath={folderPath} 
          dispatch={dispatch} 
          researchThreads={researchThreads}
        />
        
      </div>
    );

  }

};

export default ActivityWrap;
