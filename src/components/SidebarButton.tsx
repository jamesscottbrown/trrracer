import React, { useState } from 'react';
import {
  Box,
  Flex,
  Heading
} from '@chakra-ui/react';

import * as d3 from "d3";
import { useProjectState } from './ProjectContext';

const SidebarButton = (sidebarProps: any) => {

    const {isTag, index, data} = sidebarProps;
    const [{ projectData }, dispatch] = useProjectState();

    return (
        <Box key={`${data.title}-${index}`} onMouseOver={()=> {
            console.log('highlight in mousehover', data.title)
            if(isTag){
                dispatch({type: "HIGHLIGHT_TAG", highlightedTag: data.title}) 
            }
            
        }} onMouseLeave={() => {
            if(isTag){
                dispatch({type: "HIGHLIGHT_TAG", highlightedTag: null})
            }
            
        }}>{`${data.title}  (${data.matches.length})`}</Box>
    )
}

export default SidebarButton;