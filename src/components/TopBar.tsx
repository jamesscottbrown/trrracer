import React, { useState } from 'react';

import {
  Box,
  Flex,
  useColorModeValue,
  Heading,
  Spacer,
  Checkbox,
  Button,
  FormControl,
  FormLabel,
  Switch,
  Editable,
  EditableInput,
  EditablePreview
} from '@chakra-ui/react';

import { FaPlus } from 'react-icons/fa';
import { FileObj, ProjectViewProps } from './types';
import ViewTypeControl from './ViewTypeControl';
import TopTimeline from './TopTimeline';
import FileUpload from './FileUpload';
import { useProjectState } from './ProjectContext';
import QueryBar from './QueryBar';

interface TopbarProps{
  viewType: string;
  setViewType: any;
  reversedOrder: any;
  setReversedOrder: any;
  timeFilter: any;
  setTimeFilter: any;
  newTitle: string;
  setNewTitle: any;
  filteredActivityNames: any;
  filteredActivities:any;
}

const TopBar = (ProjectPropValues: TopbarProps) => {
  const [{ projectData, filterTags, filterRT }, dispatch] = useProjectState();

  const [defineEvent, setDefineEvent] = useState<boolean>(false);

  const {
    viewType,
    setViewType,
    reversedOrder,
    setReversedOrder,
    newTitle,
    setNewTitle,
    filteredActivityNames,
    filteredActivities
  } = ProjectPropValues;

  console.log('viewType', viewType)

  const addEntry = () => {
    dispatch({ type: 'ADD_ENTRY' });
  };

  const saveFiles = (fileList: FileObj[]) => {
    dispatch({ type: 'ADD_FILES', fileList });
  };

  return (
    <Box
      position="fixed"
      left={0}
      right={0}
      flexFlow="row wrap"
      zIndex={1000}
      height={'100px'}
      backgrounColor={'yellow'}
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
        <Editable
          value={newTitle}
          onChange={(val) => setNewTitle(val)}
          onCancel={() => setNewTitle(projectData.title)}
          onSubmit={(val) => dispatch({ type: 'UPDATE_TITLE', title: val })}
        >
          <EditablePreview />
          <EditableInput />
        </Editable>
      </Heading>
      <Spacer />
      <QueryBar artifactData={null} setViewType={setViewType} filteredActivities={filteredActivities}/>

        <div style={{ float: 'right' }}>
          <ViewTypeControl viewType={viewType} setViewType={setViewType} />
        </div>
      </Flex>
      <Flex style={{height:70}}>
        <Box
          style={{height:60, padding:'3px'}}
          flex={1.1}
          bg={useColorModeValue('white', 'gray.800')}
          color={useColorModeValue('gray.600', 'white')}
        >
          {(viewType === 'activity view' || viewType === 'timeline' || viewType === 'overview') && (
            <>
              <Button onClick={() => console.log('BUTTON PUSH')}>
                Add events to timeline
              </Button>
            </>
          )}
        </Box>
        <Flex flex={4} flexDirection="column">
          <Box style={{ width: 'calc(100% - 200px)', display: 'block' }}>
            {filterTags.length > 0 &&
              filterTags.map((t, i) => (
                <div
                  key={`tags-${i}`}
                  style={{
                    display: 'inline-block',
                    margin: 5,
                    backgroundColor: 'gray',
                    color: '#ffffff',
                    borderRadius: 5,
                    padding: 5,
                  }}
                >
                  <span>{`${t}`}</span>
                  <span
                    onClick={() => {
                      dispatch({
                        type: 'UPDATE_FILTER_TAGS',
                        filterTags: filterTags.filter((f) => f != t),
                      });
                     

                    }}
                    style={{ padding: 5, cursor: 'pointer' }}
                  >
                    x
                  </span>
                </div>
              ))}
            {filterRT && (
              <div
              key={`rt-${filterRT.title}`}
              style={{
                display: 'inline-block',
                margin: 5,
                backgroundColor: 'gray',
                color: '#ffffff',
                borderRadius: 5,
                padding: 5,
              }}
            >
              <span>{`Research Thread: ${filterRT.title}`}</span>
              <span
                onClick={() => {
                  dispatch({
                    type:'THREAD_FILTER', 
                    filterRT: null
                  });
                }}
                style={{ padding: 5, cursor: 'pointer', fontWeight:700 }}
              >
                x
              </span>
            </div>
              
            )}
          </Box>
        </Flex>
        {(viewType === 'activity view' || viewType === 'timeline' || viewType === 'overview') && (
         
         <div
         style={{
           position: 'fixed',
           top: '70px',
           right: '10px',
           fontSize: 24,
           fontWeight: 700,
           textAlign: 'end',
            }}
          >{`${filteredActivities.length} Activities Shown  `}
            <Button marginLeft={'3px'} alignSelf="end" 
            onClick={addEntry} 
            type="button">
              <FaPlus /> Add activity
            </Button>
          </div>
         
     
        )}
      </Flex>
    </Box>
  );
};

export default TopBar;
