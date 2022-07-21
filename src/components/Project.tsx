/* eslint no-console: off */
import React, { useEffect, useMemo, useState } from 'react';
import { Flex, Box, Tag, TagLabel } from '@chakra-ui/react';

import { MdComment, MdPresentToAll } from 'react-icons/md';
import { GrNotes } from 'react-icons/gr';
import { RiComputerLine, RiNewspaperLine } from 'react-icons/ri';
import { BiQuestionMark } from 'react-icons/bi';
import {
  FaDatabase,
  FaLink,
  FaPaperclip,
  FaPaperPlane,
  FaPencilAlt,
} from 'react-icons/fa';

import ProjectListView from './ProjectListView';
import TopBar from './TopBar';
import { useProjectState } from './ProjectContext';
import LeftSidebar from './LeftSidebar';
import ArtifactDetailWindow from './ArtifactDetailWindow';
import QueryView from './QueryView';
import BubbleVis from './BubbleVis';
import PaperView from './PaperView';
import AddEntryForm from './AddEntryForm';

const queryString = require('query-string');

// CHANGE THE SEARCH PARAMS
// See https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
// const params = new URLSearchParams(location.search);
// const viewType = params.get("view");

interface ProjectProps {
  folderPath: string;
}
// two arrays are the same length,
// you dont have a  - in object, each key is string or number.

function compareObjects<T extends any>(objA: T, objB: T): boolean {
  if (Object.keys(objA).length !== Object.keys(objB).length) {
    return false;
  }

  for (const key in Object.keys(objA)) {
    if (objA[key] !== objB[key]) {
      return false;
    }
  }
  return true;
}

function compareObjectList<T extends any[]>(listA: T, listB: T): boolean {
  if (listA.length !== listB.length) {
    return false;
  }
  for (let i = 0; i < listA.length; i += 1) {
    if (!compareObjects(listA[i], listB[i])) {
      return false;
    }
  }
  return true;
}

const ResearchThreadTypeTags = () => {
  const [
    { filterRT, researchThreads, threadTypeFilterArray },
    dispatch,
  ] = useProjectState();

  const chosenThread = filterRT
    ? researchThreads.research_threads.filter(
        (f) => f.title === filterRT.title
      )[0]
    : null;

  const noTagsFilterArray = threadTypeFilterArray.filter(
    (f) => f.type !== 'tags'
  );

  const threadTypeGroups = noTagsFilterArray.map((ty) => {
    ty.matches =
      ty.type === 'tags'
        ? filterRT
          ? filterRT.associatedKey
          : null
        : chosenThread?.evidence.filter((f) => f.type === ty.type);
    return ty;
  });

  return (
    <Box
      style={{
        width: '100%',
        zIndex: 5000,
        position: 'fixed',
        top: filterRT ? 70 : -50,
      }}
    >
      {filterRT && (
        <Flex
          style={{
            backgroundColor: '#fff',
            paddingBottom: '20px',
            paddingTop: '20px',
            paddingLeft: '40px',
            paddingRight: '20px',
            alignContent: 'space-around',
            alignItems: 'center',
            alignSelf: 'center',
          }}
        >
          {threadTypeGroups.map((tg, i) => (
            <Tag
              key={`r-t-t-t-i${i}`}
              style={{
                marginRight: '15px',
                cursor: 'pointer',
                backgroundColor: chosenThread.color,
                color: chosenThread.color === '#3932a3' ? '#fff' : 'black',
                opacity: tg.show && tg.matches.length > 0 ? 1 : 0.4,
              }}
              onClick={() => {
                const temp = threadTypeFilterArray.map((m) => {
                  if (m.type === tg.type) {
                    m.show ? (m.show = false) : (m.show = true);
                  }
                  return m;
                });
                dispatch({
                  type: 'UPDATE_RT_TYPE_SHOWN',
                  threadTypeFilterArray: temp,
                });
              }}
            >
              <TagLabel>{`${tg.type} : ${tg.matches.length}`}</TagLabel>
            </Tag>
          ))}
        </Flex>
      )}
    </Box>
  );
};

export const ToolIcon = (toolProp: any) => {
  const { artifactType, size } = toolProp;

  if (artifactType === 'transcript') {
    return (
      <MdComment style={{ display: 'inline', fontSize: size, marginLeft: 4 }} />
    );
  }
  if (artifactType === 'correspondance' || artifactType === 'correspondence') {
    return (
      <FaPaperPlane
        style={{ display: 'inline', fontSize: size, marginLeft: 4 }}
      />
    );
  } else if (artifactType === 'link') {
    return (
      <FaLink style={{ display: 'inline', fontSize: size, marginLeft: 4 }} />
    );
  } else if (artifactType === 'related work') {
    return (
      <FaPaperclip
        style={{ display: 'inline', fontSize: size, marginLeft: 4 }}
      />
    );
  } else if (artifactType === 'sketch') {
    return (
      <FaPencilAlt
        style={{ display: 'inline', fontSize: size, marginLeft: 4 }}
      />
    );
  } else if (artifactType === 'notes') {
    return (
      <GrNotes style={{ display: 'inline', fontSize: size, marginLeft: 4 }} />
    );
  } else if (artifactType === 'tool artifact') {
    return (
      <RiComputerLine
        style={{ display: 'inline', fontSize: size, marginLeft: 4 }}
      />
    );
  } else if (artifactType === 'presentation') {
    return (
      <MdPresentToAll
        style={{ display: 'inline', fontSize: size, marginLeft: 4 }}
      />
    );
  } else if (artifactType === 'data') {
    return (
      <FaDatabase
        style={{ display: 'inline', fontSize: size, marginLeft: 4 }}
      />
    );
  } else if (artifactType === 'paper draft') {
    return (
      <RiNewspaperLine
        style={{ display: 'inline', fontSize: size, marginLeft: 4 }}
      />
    );
  }
  return (
    <BiQuestionMark
      style={{ display: 'inline', fontSize: size, marginLeft: 4 }}
    />
  );
};

const Project = (ProjectPropValues: ProjectProps) => {
  const { folderPath } = ProjectPropValues;
  const [
    {
      projectData,
      filterTags,
      filterType,
      filterDates,
      filterQuery,
      filterRT,
      threadTypeFilterArray,
      researchThreads,
      goBackView,
      isReadOnly
    },
    dispatch,
  ] = useProjectState();

  // const [viewParam, setViewParam] = useState('overview');
  const [viewType, setViewType] = useState<string>('overview');
  // const [reversedOrder, setReversedOrder] = useState<boolean>(true);
  const [newTitle, setNewTitle] = useState<string>(projectData.title);
  const [groupBy, setGroupBy] = useState(null);
  const [defineEvent, setDefineEvent] = useState<boolean>(false);
  const [hideByDefault, setHideByDefault] = useState<boolean>(false);
  const [addEntrySplash, setAddEntrySplash] = useState<boolean>(false);
  // const [granularity, setGranularity] = useState<null|string>(null);
  // const [cIndex, setcIndex] = useState<null|number>(null);
  const [bubbleDivWidth, setBubbleDivWidth] = useState(300);

  const fromTop =
    (filterTags && filterTags?.length > 0) ||
    filterType != null ||
    filterRT != null
      ? 110
      : 70;

  useEffect(() => {
    if (isReadOnly) {
      const parsed = queryString.parse(location.search);
      console.log('PARSED??', parsed);

      if (parsed.view) {
        setViewType(parsed.view);
        dispatch({
          type: 'VIEW_PARAMS',
          viewParams: {
            view: parsed.view,
            granularity: parsed.granularity,
            id: parsed.id,
            cIndex: parsed.cIndex,
          },
        });
      } else {
        dispatch({
          type: 'VIEW_PARAMS',
          viewParams: null,
        });
      }

      // setGranularity(parsed.granularity);
      // setcIndex(parsed.cIndex);

      if (parsed.granularity === 'thread') {
        // sample for thread url
        // http://127.0.0.1:8080/?view=overview&granularity=thread&id=202c5ede-1637-47a0-8bc6-c75700f34036

        const chosenRT = researchThreads?.research_threads.filter(
          (f) => f.rt_id === parsed.id
        )[0];
        const threadindex = researchThreads?.research_threads
          .map((m) => m.rt_id)
          .indexOf(parsed.id);
        dispatch({
          type: 'THREAD_FILTER',
          filterRT: chosenRT,
          selectedThread: threadindex,
        });
      } else if (parsed.granularity === 'activity') {
        // sample for activity
        // http://127.0.0.1:8080/?view=overview&granularity=activity&id=455e9315-ad20-48ba-be6b-5430f1198096
        console.log('activityURL', parsed.id);
        dispatch({
          type: 'URL_SELECTED_ACTIVITY',
          selectedActivityURL: parsed.id,
        });
      } else if (parsed.granularity === 'artifact') {
        // http://127.0.0.1:8080/?view=detail%20view&granularity=artifact&id=6361f1cc-a79e-4205-9513-12036c9417a6

        const selected = projectData.entries.filter((en) => {
          const fileTest = en.files.filter((f) => f.artifact_uid === parsed.id);
          return fileTest.length > 0;
        });

        const artifact = selected[0].files
          .map((m) => m.artifact_uid)
          .indexOf(parsed.id);

        const newHop = [
          {
            activity: selected[0],
            artifactUid: parsed.id,
            hopReason: 'first hop',
            tag: null,
          },
        ];

        dispatch({
          type: 'SELECTED_ARTIFACT',
          selectedArtifactEntry: selected.length > 0 ? selected[0] : null,
          selectedArtifactIndex: selected.length > 0 ? artifact : null,
          hopArray: newHop,
        });
      }
    }
  }, [queryString, viewType, groupBy, window.history]);

  const barWidth = useMemo(() => {
    const handicap = window.innerWidth > 1300 && barWidth > 0 ? 150 : 0;
    return bubbleDivWidth < 0
      ? window.innerWidth - 700
      : window.innerWidth - (bubbleDivWidth - handicap);
  }, [bubbleDivWidth, window.innerWidth]);

  useEffect(() => {
    dispatch({ type: 'FILTER_DATA' });
  }, [
    filterTags,
    filterType,
    filterDates,
    filterRT,
    filterQuery,
    threadTypeFilterArray,
    projectData.entries.length,
    projectData.entries.flatMap((f) => f.files).length,
  ]);

  if (viewType === 'query') {
    return (
      <div
        style={{
          height: '100vh',
          position: 'fixed',
          top: 0,
          bottom: 0,
          width: '100%',
        }}
      >
        <TopBar
          viewType={viewType}
          setViewType={setViewType}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          setHideByDefault={setHideByDefault}
          hideByDefault={hideByDefault}
          setAddEntrySplash={setAddEntrySplash}
        />
        <Flex position="relative" top={130}>
          <LeftSidebar fromTop={fromTop} />
          <BubbleVis
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            defineEvent={defineEvent}
            setDefineEvent={setDefineEvent}
            flexAmount={2}
          />
          <Box flex="3" h="calc(100vh - 130px)" overflowY="auto">
            <QueryView setViewType={setViewType} />
          </Box>
        </Flex>
      </div>
    );
  }
  if (viewType === 'detail view') {
    return (
      <ArtifactDetailWindow setViewType={setViewType} goBackView={goBackView} />
    );
  }
  if (viewType === 'overview') {
    return (
      <div
        style={{
          height: '100vh',
          position: 'fixed',
          top: 0,
          bottom: 0,
          width: '100%',
        }}
      >
        <TopBar
          viewType={viewType}
          setViewType={setViewType}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          setHideByDefault={setHideByDefault}
          hideByDefault={hideByDefault}
          setAddEntrySplash={setAddEntrySplash}
        />
        <Flex position="relative" top={`${fromTop}px`}>
          {!groupBy && <LeftSidebar fromTop={fromTop} groupBy={groupBy} />}
          <BubbleVis
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            defineEvent={defineEvent}
            setDefineEvent={setDefineEvent}
            // flexAmount={2}
            bubbleDivWidth={bubbleDivWidth}
            setBubbleDivWidth={setBubbleDivWidth}
          />

          {addEntrySplash && (
            <AddEntryForm setAddEntrySplash={setAddEntrySplash} />
          )}

          {!groupBy && !hideByDefault && (
            <Box
              w={barWidth}
              h={`calc(100vh - ${fromTop + 5}px)`}
              overflowY="auto"
            >
              <ResearchThreadTypeTags />
              <ProjectListView setViewType={setViewType} viewType={viewType} />
            </Box>
          )}
        </Flex>
      </div>
    );
  }
  if (viewType === 'paper') {
    return (
      <div
        style={{
          height: '100vh',
          position: 'fixed',
          top: 0,
          bottom: 0,
          width: '100%',
        }}
      >
        <TopBar
          viewType={viewType}
          setViewType={setViewType}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          setHideByDefault={setHideByDefault}
          hideByDefault={hideByDefault}
          setAddEntrySplash={setAddEntrySplash}
        />
        <PaperView folderPath={folderPath} />
      </div>
    );
  }

  return null;
};

export default Project;
