import React from 'react';

import {
  Box,
  Flex,
  useColorModeValue,
  Heading,
  Button,
  Editable,
  EditableInput,
  EditablePreview,
  FormControl,
  FormLabel,
  Switch,
} from '@chakra-ui/react';

import { FaPlus } from 'react-icons/fa';
import { BiLogOut } from 'react-icons/bi';

import ViewTypeControl from './ViewTypeControl';
import QueryBar from './QueryBar';
import { useProjectState } from './ProjectContext';

interface TopbarProps {
  viewType: string;
  setViewType: any;
  newTitle: string;
  setNewTitle: any;
  setHideByDefault: (boo: any) => void;
  hideByDefault: boolean;
  setAddEntrySplash: (boo: any) => void;
  setPath: any;
}

const TopBar = (ProjectPropValues: TopbarProps) => {
  const {
    viewType,
    setViewType,
    newTitle,
    setNewTitle,
    setHideByDefault,
    hideByDefault,
    setAddEntrySplash,
    setPath,
  } = ProjectPropValues;

  const [
    {
      projectData,
      filteredActivities,
      selectedArtifact,
      isReadOnly,
      viewParams,
      researchThreads,
    },
    dispatch,
  ] = useProjectState();

  // USE callback when you pass anonymous functions to big components!!
  // const callBackOnClick = useCallback((event) => setAddEntrySplash(true), [setAddEntrySplash])
  const getName = () => {
    if (viewParams.granularity === 'thread') {
      return researchThreads?.research_threads.filter(
        (f) => f.rt_id === viewParams.id
      )[0].title;
    }
    if (viewParams.granularity === 'artifact') {
      return selectedArtifact.activity.files[selectedArtifact.artifactIndex]
        .title;
    }
    if (viewParams.granularity === 'activity') {
      return projectData.entries.filter(
        (f) => f.activity_uid === viewParams.id
      )[0].title;
    }
    return 'Unknown';
  };

  return (
    <Box
      position="fixed"
      left={0}
      right={0}
      flexFlow="row wrap"
      zIndex={1000}
      height="80px"
    >
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH="60px"
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle="solid"
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align="center"
      >
        <Heading as="h1">
          {isReadOnly ? (
            <span style={{ fontSize: 30, fontWeight: 800, margin: 10 }}>
              <BiLogOut
                style={{ display: 'inline' }}
                onClick={() => {
                  document.cookie =
                    'folderName=; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                  console.log(document.cookie);
                  setPath('');
                }}
              />{' '}
              {projectData.title === 'Jen' ? 'tRRRace Meta' : projectData.title}
            </span>
          ) : (
            <Editable
              value={newTitle}
              onChange={(val) => setNewTitle(val)}
              onCancel={() => setNewTitle(projectData.title)}
              onSubmit={(val) => dispatch({ type: 'UPDATE_TITLE', title: val })}
            >
              <EditablePreview />
              <EditableInput />
            </Editable>
          )}
        </Heading>

        <div style={{ marginLeft: '20px', marginRight: '20px' }}>
          <ViewTypeControl viewType={viewType} setViewType={setViewType} />
        </div>
        {(!viewParams || (viewParams && viewParams.view !== 'paper')) && (
          <QueryBar
            setSearchTermArtifact={null}
            setViewType={setViewType}
            filteredActivities={filteredActivities}
          />
        )}

        {(viewParams && viewParams.view === 'paper') && (
          <div
            style={{
              fontWeight: 600,
              fontSize: 22,
              marginLeft: '200px',
              marginRight: '100px',
              float: 'right',
            }}
          >
            Cited {viewParams.granularity}: {getName()}
          </div>
        )}

        {(viewType === 'activity view' ||
          viewType === 'timeline' ||
          viewType === 'overview') && (
          <div
            style={{
              float: 'right',
              fontSize: 24,
              fontWeight: 700,
              textAlign: 'end',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                fontSize: '14px',
                paddingRight: 15,
              }}
            >
              <FormControl display="flex" alignItems="center" marginBottom={10}>
                <FormLabel
                  htmlFor="split-by"
                  mb="0"
                  textAlign="right"
                  fontSize="12px"
                >
                  Hide all by default
                </FormLabel>
                <Switch
                  id="show-all"
                  onChange={() => setHideByDefault(!hideByDefault)}
                />
              </FormControl>
            </div>
            {(filteredActivities.length !== projectData.entries.length ||
              !hideByDefault) && (
              <div
                style={{
                  display: 'inline-block',
                  fontSize: '14px',
                  marginRight: 15,
                }}
              >{`${filteredActivities.length} Activities Shown  `}</div>
            )}
            {!isReadOnly && (
              <Button
                marginLeft="3px"
                alignSelf="end"
                // onClick={addEntry}
                onClick={() => setAddEntrySplash(true)}
                type="button"
              >
                <FaPlus /> Add activity
              </Button>
            )}
          </div>
        )}
      </Flex>
    </Box>
  );
};

export default TopBar;
