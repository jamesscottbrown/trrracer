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

const TopTimeline = (projectProps:any)=>{

    const { projectData } = projectProps;
    console.log('test this out', projectData.entries)
    return(
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
        <svg><rect></rect></svg>
        </Flex>
        </Box>
    )
}

export default TopTimeline;