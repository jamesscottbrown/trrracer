import React, { useRef } from 'react';
import ReadonlyEntry from '../ReadonlyEntry';
import { openFile } from '../../fileUtil';
import ThreadedReadonlyEntry from '../ThreadedReadonlyEntry';
import { EntryTypeWithIndex, ResearchThreadEvidence } from '../types';
import { useProjectState } from '../ProjectContext';

type ActivityWrapPropType = {
  activityData: EntryTypeWithIndex;
  editable: boolean[];
  setEditableStatus: (index: number, isEditable: boolean) => void;
  setViewType: (v: string) => void;
  index: number;
  viewType: string;
};

const ActivityWrap = (props: ActivityWrapPropType) => {
  const {
    activityData,
    editable,
    setEditableStatus,
    setViewType,
    index,
    viewType,
  } = props;

  const [{ filterRT, researchThreads }] = useProjectState();
  const myRef = useRef(null);

  const foundIn = researchThreads?.research_threads.filter((m) => {
    const test = m.evidence.filter(
      (f: ResearchThreadEvidence) => f.activityTitle === activityData.title
    );
    return test.length > 0;
  });

  if (filterRT) {
    return (
      <div
        className="list-activity"
        ref={myRef}
        style={{
          border: '.5px solid #A3AAAF',
          borderRadius: 6,
          margin: 5,
          boxShadow: '3px 3px 8px #A3AAAF',
        }}
      >
        <ThreadedReadonlyEntry
          /* eslint-disable-next-line react/no-array-index-key */
          key={`ro-${activityData.title}-${activityData.index}-${index}`}
          activityID={activityData.activity_uid}
          openFile={openFile}
          setViewType={setViewType}
          makeEditable={() => setEditableStatus(activityData.index, true)}
          viewType={viewType}
        />
      </div>
    );
  }

  return (
    <div
      className="list-activity"
      id={activityData.title}
      ref={myRef}
      style={{
        border: '.5px solid #A3AAAF',
        borderRadius: 6,
        margin: 5,
        boxShadow: '3px 3px 8px #A3AAAF',
      }}
    >
      <ReadonlyEntry
        /* eslint-disable-next-line react/no-array-index-key */
        key={`ro-${activityData.title}-${activityData.index}-${index}`}
        activityID={activityData.activity_uid}
        openFile={openFile}
        setViewType={setViewType}
        makeEditable={() => setEditableStatus(activityData.index, true)}
        viewType={viewType}
        foundIn={foundIn || []}
      />
    </div>
  );
};

export default ActivityWrap;