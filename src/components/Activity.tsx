import React, { useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  Button,
  UnorderedList,
  ListItem,
  Textarea,
} from '@chakra-ui/react';
import type { File } from './types';

import CenterFileRender from './CenterFileRender';
import { useProjectState } from './ProjectContext';

const ActivitytoThread = (props: any) => {
  const [, dispatch] = useProjectState();

  const { thread, threadIndex, activity, activityIndex } = props;
  const [showDesc, setShowDesc] = useState(false);
  const [threadRat, setThreadRat] = useState(null);

  const handleDescriptionChange = (e: ChangeEvent) => {
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

const Activity = (activityProps: any) => {
  

  const { activity, folderPath, index, numRendered } = activityProps;
  const [{ highlightedTag, highlightedType, researchThreads }] =
    useProjectState();

  const [seeThreadAssign, setSeeThreadAssign] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [activitySelected, setActivitySelected] = useState(false);

  const colorVar =
    activitySelected ||
    activity.tags.indexOf(highlightedTag) > -1 ||
    activity.files.map((m: File) => m.fileType).indexOf(highlightedType) > -1
      ? '#FFFCBB'
      : '#F5F5F5';

  const closePopover = () => {
    setShowPopover(false);
  };

  if (!showPopover) {
    return (
      <Box
        key={`${activity.title}-${index}`}
        minWidth={(numRendered > 20 ? 50 : 300)}
        marginTop={2}
        marginLeft={4}
        className="activity"
        onMouseEnter={() => {
          setActivitySelected(true);
          setShowPopover(true);
        }}
      >
        <CenterFileRender
          key={`cfr-${activity.title}-${index}`}
          fileArray={activity.files}
          folderPath={folderPath}
          bgColor={colorVar}
          numRendered={numRendered}
          activity={activity}
        />
      </Box>
    );
  }

  return (
    <Popover
      isOpen={showPopover}
      onClose={closePopover}
      onMouseLeave={closePopover}
    >
      <PopoverTrigger>
        <Box
          key={`${activity.title}-${index}`}
          w={50}
          marginTop={2}
          marginLeft={4}
          className="activity"
          onMouseLeave={() => {
            setActivitySelected(false);
            closePopover();
          }}
        >
          <CenterFileRender
            key={`cfr-${activity.title}-${index}`}
            fileArray={activity.files}
            folderPath={folderPath}
            bgColor={colorVar}
            numRendered={numRendered}
          />
        </Box>
      </PopoverTrigger>
      <PopoverContent bg="white" color="gray">
        <PopoverArrow bg="white" />
        <PopoverHeader>
          <span style={{ fontWeight: 600 }}>{`${activity.title}`}</span>
          <span style={{ display: 'block' }}>{activity.date}</span>
        </PopoverHeader>
        <PopoverBody>
          {seeThreadAssign ? (
            <div>
              {researchThreads &&
              researchThreads.research_threads.length > 0 ? (
                researchThreads.research_threads.map(
                  (rt: any, tIndex: number) => (
                    <React.Fragment key={`rt-${tIndex}`}>
                      <ActivitytoThread
                        thread={rt}
                        threadIndex={tIndex}
                        activity={activity}
                        activityIndex={index}
                      />
                    </React.Fragment>
                  )
                )
              ) : (
                <span>no threads yet</span>
              )}
            </div>
          ) : (
            <div>
              <span style={{ display: 'block' }}>Artifacts:</span>
              <UnorderedList>
                {activity.files.map((f: File, i: number) => (
                  <ListItem key={`f-${f.title}-${i}`}>{f.title}</ListItem>
                ))}
              </UnorderedList>
            </div>
          )}
        </PopoverBody>
        <PopoverFooter>
          {seeThreadAssign ? (
            <Box>
              <Button onClick={() => setSeeThreadAssign(false)}>cancel</Button>
            </Box>
          ) : (
            <Button onClick={() => setSeeThreadAssign(true)}>
              Add this activity to a thread.
            </Button>
          )}
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};

export default Activity;
