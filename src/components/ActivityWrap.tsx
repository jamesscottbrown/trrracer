import React, { useEffect, useRef } from 'react';
import { Divider } from '@chakra-ui/react';
import { useProjectState } from './ProjectContext';
import Entry from './Entry';
import ReadonlyEntry from './ReadonlyEntry';
import { openFile } from '../fileUtil';
import ThreadedReadonlyEntry from './ThreadedReadonlyEntry';
import { EntryTypeWithIndex } from './types';

type ActivityWrapPropType = {
  activityData: EntryTypeWithIndex;
  editable: boolean[];
  setEditableStatus: (index: number, isEditable: boolean) => void;
  setViewType: (v: any) => void;
  setSelectedArtifactIndex: number;
  setSelectedArtifactEntry: (e: any) => void;
  index: number;
  hoverActivity: any;
  viewType: string;
};

const ActivityWrap = (props: ActivityWrapPropType) => {
  const {
    activityData,
    editable,
    setEditableStatus,
    setViewType,
    setSelectedArtifactIndex,
    setSelectedArtifactEntry,
    index,
    hoverActivity,
    viewType,
  } = props;

  const [state, dispatch] = useProjectState();

  const myRef = useRef(null);

  useEffect(() => {
    if (hoverActivity && hoverActivity.title === activityData.title) {
      myRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hoverActivity]);

  const updateEntryField = (
    entryIndex: number,
    fieldName: string,
    newValue: any
  ) => {
    dispatch({ type: 'UPDATE_ENTRY_FIELD', entryIndex, fieldName, newValue });
  };
  if(editable[activityData.index]){

    return (
      <div ref={myRef}>
      
          <Entry
            /* eslint-disable-next-line react/no-array-index-key */
            key={`en-${activityData.title}-${activityData.index}-${index}`}
            entryData={activityData}
            entryIndex={activityData.index}
            openFile={openFile}
            updateEntryField={updateEntryField}
            allTags={state.projectData.tags}
            makeNonEditable={() => setEditableStatus(activityData.index, false)}
            viewType={viewType}
          />
        <Divider marginTop="1em" marginBottom="1em" />
      </div>
    );

  }else if(state.filterRT){

    return (
      <div ref={myRef}>
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
        <Divider marginTop="1em" marginBottom="1em" />
      </div>
    );

  }else{

    return (
      <div ref={myRef}>
         <ReadonlyEntry
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
        <Divider marginTop="1em" marginBottom="1em" />
      </div>
    );

  }

  // return (
  //   <div ref={myRef}>
  //     {editable[activityData.index] ? (
  //       <Entry
  //         /* eslint-disable-next-line react/no-array-index-key */
  //         key={`en-${activityData.title}-${activityData.index}-${index}`}
  //         entryData={activityData}
  //         entryIndex={activityData.index}
  //         openFile={openFile}
  //         updateEntryField={updateEntryField}
  //         allTags={state.projectData.tags}
  //         makeNonEditable={() => setEditableStatus(activityData.index, false)}
  //         viewType={viewType}
  //       />
  //     ) : (
  //       <ReadonlyEntry
  //         /* eslint-disable-next-line react/no-array-index-key */
  //         key={`ro-${activityData.title}-${activityData.index}-${index}`}
  //         entryData={activityData}
  //         openFile={openFile}
  //         setViewType={setViewType}
  //         setSelectedArtifactIndex={setSelectedArtifactIndex}
  //         setSelectedArtifactEntry={setSelectedArtifactEntry}
  //         makeEditable={() => setEditableStatus(activityData.index, true)}
  //         viewType={viewType}
  //       />
  //     )}

  //     <Divider marginTop="1em" marginBottom="1em" />
  //   </div>
  // );
};

export default ActivityWrap;
