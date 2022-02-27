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
    const [barColor, setBarColor] = useState('#FFFFFF');

    return (
        <Box style={{cursor:"pointer"}} bg={barColor} key={`${data.title}-${index}`} onMouseOver={()=> {
            console.log('highlight in mousehover', data.title, isTag)
            if(isTag){
                setBarColor('#D3D3D3');
                console.log('HOVER BITCHES')
                dispatch({type: "HIGHLIGHT_TAG", highlightedTag: data.title}) 
            }
            
        }} onMouseLeave={() => {
            if(isTag){
                setBarColor('#FFFFFF');
                dispatch({type: "HIGHLIGHT_TAG", highlightedTag: null})
            }
            
        }}>{`${data.title}  (${data.matches.length})`}</Box>
    )
}

export default SidebarButton;