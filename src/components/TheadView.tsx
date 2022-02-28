import React, { useState } from 'react';
import {
  Box,
  Flex,
  Heading
} from '@chakra-ui/react';

import * as d3 from "d3";
import { useProjectState } from './ProjectContext';
import ThreadNav from './ThreadNav';


const ThreadView = () => {

    const headerStyle = {fontSize:'19px', fontWeight:600}

    return(
      <Flex position={'relative'} top={220}>
        <Box minW={'200px'} margin="8px" p={5} flex={1} flexDirection='column' h='calc(100vh - 250px)' overflow="auto">
        <ThreadNav/>
        </Box>
        <Box bg={'yellow'} flex={3} h='calc(100vh - 150px)' overflowY='auto'></Box>
      </Flex>
    )
}

export default ThreadView;