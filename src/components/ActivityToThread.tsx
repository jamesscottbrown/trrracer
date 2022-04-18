import { Box, Button, Textarea } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useProjectState } from './ProjectContext';

const ActivitytoThread = (props: any) => {
  const [, dispatch] = useProjectState();

  const {
    thread,
    threadIndex,
    activity,
    activityIndex,
    setSeeThreadAssign,
    closePopover,
  } = props;
  const [showDesc, setShowDesc] = useState(false);
  const [threadRat, setThreadRat] = useState(null);

  const handleDescriptionChange = (e: any) => {
    const inputValue = e.target.value;
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
      <div onClick={() => setShowDesc(true)}>{`Add to "${thread.title}"`}</div>
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
              closePopover();
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
