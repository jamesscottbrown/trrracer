import React, { useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Popover,
  PopoverTrigger,
  PopoverArrow,
  PopoverContent,
  PopoverBody,
  Button
} from '@chakra-ui/react';

import * as d3 from "d3";
import { useProjectState } from './ProjectContext';

const SidebarButton = (sidebarProps: any) => {

    const {isTag, index, data} = sidebarProps;
    const [{ projectData }, dispatch] = useProjectState();
    const [barColor, setBarColor] = useState('#FFFFFF');

    return (
        isTag ? 
        <Popover trigger="hover">
            <PopoverTrigger> 

                <Box style={{cursor:"pointer"}} bg={barColor} key={`${data.title}-${index}`} 
                    onMouseOver={()=> {
                    if(isTag){
                        setBarColor('#D3D3D3');
                        // dispatch({type: "HIGHLIGHT_TAG", highlightedTag: data.title}) 
                    }
                    }} onMouseLeave={() => {
                        if(isTag){
                            setBarColor('#FFFFFF');
                            // dispatch({type: "HIGHLIGHT_TAG", highlightedTag: null})
                        }
                    }}>{`${data.title}  (${data.matches.length})`}
                </Box>    
            
            </PopoverTrigger> 
                <PopoverContent bg='white' color='gray'>
                <PopoverArrow bg='white' />
                               
                <PopoverBody>
                    <Button>{"Add this tag to a thread."}</Button>
                </PopoverBody>
            </PopoverContent>
        </Popover>
        : 
        <Box style={{cursor:"pointer"}} bg={barColor} key={`${data.title}-${index}`} 
            onMouseOver={()=> {
                setBarColor('#D3D3D3');
            }} onMouseLeave={() => {
                setBarColor('#FFFFFF');
            }}>{`${data.title}  (${data.matches.length})`}
        </Box>      
        
        
    )
}

export default SidebarButton;