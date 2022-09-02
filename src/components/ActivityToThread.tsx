import { Box, Button, Textarea } from '@chakra-ui/react';
import React, { ChangeEvent, useState } from 'react';
import { useProjectState } from './ProjectContext';
import { EntryTypeWithIndex, ResearchThread } from './types';

type ActivitytoThreadPropType = {
  thread: ResearchThread;
  threadIndex: number;
  activity: EntryTypeWithIndex;
  activityIndex: number;
  setSeeThreadAssign: (seeThreadAssign: boolean) => void;
};

const ActivitytoThread = (props: ActivitytoThreadPropType) => {
  const [, dispatch] = useProjectState();

  const { thread, threadIndex, activity, activityIndex, setSeeThreadAssign } =
    props;
  const [showDesc, setShowDesc] = useState(false);
  const [threadRat, setThreadRat] = useState('');

  const handleDescriptionChange = (e: ChangeEvent) => {
    const inputValue = (e.target as HTMLInputElement).value;
    setThreadRat(inputValue);
  };

  return (
    <Box
      key={`t-${threadIndex}`}
      style={{
        border: '1px solid gray',
        borderRadius: '5px',
        cursor: 'pointer',
        textAlign: 'center',
      }}
    >
      <button
        onClick={() => setShowDesc(true)}
        type="button"
      >{`Add to "${thread.title}"`}</button>
      {showDesc && (
        <>
          <Textarea
            placeholder="Why are you including this?"
            onChange={handleDescriptionChange}
          />
          <Button
            onClick={() => {
              setShowDesc(false);
              setSeeThreadAssign(false);
              dispatch({
                type: 'ADD_ACTIVITY_TO_THREAD',
                activity,
                rationale: threadRat,
                activityIndex,
                threadIndex,
              });
            }}
          >
            Add
          </Button>
        </>
      )}
    </Box>
  );
};

export default ActivitytoThread;
