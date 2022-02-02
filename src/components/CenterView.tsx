import React, { useState } from 'react';
import {
  Box,
  Flex
} from '@chakra-ui/react';


const CenterView = (projectProps: any) => {
  const {projectEntries} = projectProps;
  console.log(projectEntries);
    return(
        
        <Box bg='red' flex='4' flexDirection='column'>
        <svg>
        
        </svg>
        </Box>
      
        
    )
}

export default CenterView;

