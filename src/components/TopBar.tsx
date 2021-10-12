import React, { useState } from 'react';
import {
  Box,
  Flex,
  useColorModeValue,
  Heading,
  Spacer,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import { EntryType, FileObj, ProjectViewProps } from './types';
import ViewTypeControl from './ViewTypeControl';
const TopBar = (ProjectPropValues: ProjectViewProps) =>{
const { projectData, folderPath, viewType, setViewType } = ProjectPropValues;


let splitTitle = (title)=>{
    let t = title.split('/');
    return t[t.length - 1];
}

return (

<Box>
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
    <Heading as="h3">{splitTitle(projectData.title)}</Heading>
    <Spacer/>
     <div style={{float:"right"}}><ViewTypeControl viewType={viewType} setViewType={setViewType} /></div>
    </Flex>
</Box>
)

}

export default TopBar;
      
     