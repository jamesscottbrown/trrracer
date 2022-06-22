import React, { useEffect, useRef } from 'react';
import { Divider } from '@chakra-ui/react';
import Entry from './Entry';
import ReadonlyEntry from './ReadonlyEntry';
import { openFile } from '../fileUtil';
import ThreadedReadonlyEntry from './ThreadedReadonlyEntry';
import { EntryTypeWithIndex } from './types';
import { useProjectState } from './ProjectContext';

type ActivityWrapPropType = {
  activityData: EntryTypeWithIndex;
  editable: boolean[];
  setEditableStatus: (index: number, isEditable: boolean) => void;
  setViewType: (v: any) => void;
  viewtype: any;
  index: number;
  viewType: any;
};

const ActivityWrap = (props: any) => {
  const {
    activityData,
    editable,
    setEditableStatus,
    setViewType,
    index,
    viewType,
  } = props;

  const [{filterRT}, dispatch] = useProjectState();
  const myRef = useRef(null);

  const updateEntryField = (
    entryIndex: number,
    fieldName: string,
    newValue: any
  ) => {
    console.log('UPDATE ENTRY FIELD CALLED', activityData.activity_uid, newValue);
    dispatch({ type: 'UPDATE_ENTRY_FIELD', entryIndex, fieldName, newValue, activityID: activityData.activity_uid });
  };

  if(editable[activityData.index]){

    return (
      <div 
      className='list-activity'
      ref={myRef}>
          <Entry
            /* eslint-disable-next-line react/no-array-index-key */
            key={`en-${activityData.title}-${activityData.activity_uid}`}
            activityID={activityData.activity_uid}
            files={activityData.files}
            entryIndex={activityData.index}
            openFile={openFile}
            updateEntryField={updateEntryField}
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
        />
        
      </div>
    );

  }

};

export default ActivityWrap;
