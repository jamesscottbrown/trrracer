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
    const [barColor, setBarColor] = useState('#ffffff');

    return (
        <Box bg={barColor} key={`${data.title}-${index}`} onMouseOver={()=> {
            console.log('highlight in mousehover', data.title)
            if(isTag){
                setBarColor('red');
                console.log('HOVER BITCHES')
                dispatch({type: "HIGHLIGHT_TAG", highlightedTag: data.title}) 
            }
            
        }} onMouseLeave={() => {
            if(isTag){
                setBarColor('#ffffff');
                dispatch({type: "HIGHLIGHT_TAG", highlightedTag: null})
            }
            
        }}>{`${data.title}  (${data.matches.length})`}</Box>
    )
}

export default SidebarButton;