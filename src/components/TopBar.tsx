import React, { useState } from 'react';
import {
  Box,
  Flex,
  useColorModeValue,
  Heading,
  Spacer,
  useBreakpointValue,
  useDisclosure,
  Input,
  InputGroup,
  InputRightElement,
  Button
} from '@chakra-ui/react';
import {
  Search2Icon,
  SearchIcon
} from '@chakra-ui/icons';
import { EntryType, FileObj, ProjectViewProps } from './types';
import ViewTypeControl from './ViewTypeControl';
import TopTimeline from './TopTimeline';

const TopBar = (ProjectPropValues: ProjectViewProps) =>{
const { projectData, folderPath, viewType, setViewType } = ProjectPropValues;

console.log('PROJECT DATA', projectData)

let splitTitle = (title)=>{
    let t = title.split('/');
    return t[t.length - 1];
}
// background: #0596d8;
// padding: 10px;
// box-shadow: 1px 2px 3px #ccc;
// color: white;
// display: flex;
// flex-flow: row nowrap;
return (
<Box flexFlow={'row nowrap'}>
  <Flex  
    bg={useColorModeValue('white', 'gray.800')}
    color={useColorModeValue('gray.600', 'white')}
    minH={'60px'}
    py={{ base: 2 }}
    px={{ base: 4 }}
    borderBottom={1}
    borderStyle={'solid'}
    borderColor={useColorModeValue('gray.200', 'gray.900')}
    align={'center'}
    >
    {/* <Heading as="h1">
        <Editable
      
          value={newTitle}
          onChange={(val) => setNewTitle(val)}
          onCancel={() => setNewTitle(projectData.title)}
          onSubmit={(val) => dispatch({ type: 'UPDATE_TITLE', title: val })}
        >
          <EditablePreview />
          <EditableInput />
        </Editable>
    </Heading> */}
    <Heading as="h3">{splitTitle(projectData.title)}</Heading>
    <Spacer/>
    {/* <Checkbox
        checked={reversedOrder}
        onChange={(e) => setReversedOrder(e.target.checked)}
      >
        Reverse chronological order
    </Checkbox>  */}
    <InputGroup align={'center'} width={'400px'} marginEnd={'90px'}>
      <Input variant='flushed' placeholder='Search by term' />
      <InputRightElement width='4.5rem'>
        <Button h='1.75rem' size='sm' onClick={console.log("TEST")}>
          <Search2Icon/>
        </Button>
      </InputRightElement>
    </InputGroup>
    
     <div style={{float:"right"}}><ViewTypeControl viewType={viewType} setViewType={setViewType} /></div>
    </Flex>
    <TopTimeline projectData={projectData}/>
</Box>
)

}

export default TopBar;
      
     