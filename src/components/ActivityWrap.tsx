import React, { useEffect, useState, useRef } from 'react';
import { Divider } from '@chakra-ui/react';
import { useProjectState } from './ProjectContext';
import Entry from './Entry';
import ReadonlyEntry from './ReadonlyEntry';
import { openFile } from '../fileUtil';

const ActivityWrap = (props: any) => {
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

  return (
    <div ref={myRef}>
      {editable[activityData.index] ? (
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
      ) : (
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
      )}

      <Divider marginTop="1em" marginBottom="1em" />
    </div>
  );
};

export default ActivityWrap;
