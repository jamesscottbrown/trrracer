/* eslint no-console: off */
import React, { useEffect, useMemo, useState } from 'react';
import { Flex, Box, Tag, TagLabel, position } from '@chakra-ui/react';

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
import { autoType } from 'd3';

// CHANGE THE SEARCH PARAMS
// See https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
// const params = new URLSearchParams(location.search);
// const viewType = params.get("view");

interface ProjectProps {
  folderPath: string;
}

const ResearchThreadTypeTags = () => {
  const [{ filterRT, researchThreads, threadTypeFilterArray }, dispatch] =
    useProjectState();

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
        top: filterRT ? 60 : -50,
      }}
    >
      {filterRT && (
        <Flex
          style={{
            backgroundColor: '#fff',
            paddingBottom: '10px',
            paddingLeft: '140px',
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
                backgroundColor: `${chosenThread?.color}50`,
                color: chosenThread?.color === '#3932a3' ? '#fff' : 'black',
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

function debounce(fn, ms) {
  let timer: any;
  return (_) => {
    clearTimeout(timer);
    timer = setTimeout((_) => {
      timer = null;
      fn.apply(this, arguments);
    }, ms);
  };
}

const Project = (ProjectPropValues: ProjectProps) => {
  const { folderPath, setPath } = ProjectPropValues;

  const [
    {
      projectData,
      filterTags,
      filterType,
      filterDates,
      filterQuery,
      filterRT,
      threadTypeFilterArray,
      goBackView,
      isReadOnly,
      viewParams,
    },
    dispatch,
  ] = useProjectState();

  const [viewType, setViewType] = useState<string>('overview');
  const [newTitle, setNewTitle] = useState<string>(
    projectData.title === 'Jen' ? 'tRRRacer Meta' : projectData.title
  );
  const [groupBy, setGroupBy] = useState(null);
  const [defineEvent, setDefineEvent] = useState<boolean>(false);
  const [hideByDefault, setHideByDefault] = useState<boolean>(false);
  const [addEntrySplash, setAddEntrySplash] = useState<boolean>(false);
  const [bubbleDivWidth, setBubbleDivWidth] = useState(300);
  const [windowDimension, setWindowDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const fromTop =
    (filterTags && filterTags?.length > 0) ||
    filterType != null ||
    filterRT != null
      ? 110
      : 70;

  useEffect(() => {
    if (isReadOnly && viewParams && viewParams.view) {
      setViewType(viewParams.view);
    }
  }, [isReadOnly, viewParams]);

  useEffect(() => {
    const debouncedHandleResize = debounce(function handleResize() {
      setWindowDimension({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    }, 1000);
    window.addEventListener('resize', debouncedHandleResize);
    return (_) => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  });


  const barWidth = useMemo(() => {
    const handicap = window.innerWidth > 1300 ? 50 : 0;
    return bubbleDivWidth < 0
      ? window.innerWidth - 800
      : window.innerWidth - (bubbleDivWidth + 600);
  }, [windowDimension.width]);

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
        <Flex position="relative" top={`${fromTop}px`}>
          <LeftSidebar fromTop={fromTop} />
          <BubbleVis
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            defineEvent={defineEvent}
            setDefineEvent={setDefineEvent}
            bubbleDivWidth={bubbleDivWidth}
            setBubbleDivWidth={setBubbleDivWidth}
            windowDimension={windowDimension}
          />
          <div 
          style={{
            width:"400px",
            height: "calc(100vh - 120px)", 
            overflow: "auto",
            backgroundColor:'#fff',
            position:'fixed',
            right:'10px',
            top: '90px',
            padding:'15px'
          }}
          >
            <QueryView setViewType={setViewType} />
          </div>
        </Flex>
      </div>
    );
  }
  if (viewType === 'detail view') {
    return (
      <ArtifactDetailWindow 
        bubbleDivWidth={bubbleDivWidth}
        setBubbleDivWidth={setBubbleDivWidth}
        windowDimension={windowDimension}
        setViewType={setViewType} 
        goBackView={goBackView} 
      />
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
          setPath={setPath}
        />
        <Flex position="relative" top={`${fromTop}px`}>
          {!groupBy && <LeftSidebar fromTop={fromTop} groupBy={groupBy} />}
          <BubbleVis
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            defineEvent={defineEvent}
            setDefineEvent={setDefineEvent}
            windowDimension={windowDimension}
            bubbleDivWidth={bubbleDivWidth}
            setBubbleDivWidth={setBubbleDivWidth}
          />

          {addEntrySplash && (
            <AddEntryForm setAddEntrySplash={setAddEntrySplash} />
          )}

          {!groupBy && !hideByDefault && (
            <div
            style={{
              width: barWidth,
              height: `calc(100vh - ${fromTop + 5}px)`,
              overflow: "auto",
              position: 'absolute',
              right: 0,
              top: 0
            }}
              // w={barWidth}
              // h={`calc(100vh - ${fromTop + 5}px)`}
              // overflowY="auto"
            >
              <ResearchThreadTypeTags />
              <ProjectListView 
                width={barWidth}
                setViewType={setViewType} 
                viewType={viewType} 
              />
            </div>
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
        <PaperView 
        folderPath={folderPath} 
        windowDimension={windowDimension} 
        setWindowDimension={setWindowDimension} 
        setViewType={setViewType}
        />
      </div>
    );
  }

  return null;
};

export default Project;
