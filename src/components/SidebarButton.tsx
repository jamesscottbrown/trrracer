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
    const [{ projectData, researchThreads }, dispatch] = useProjectState();
    const [barColor, setBarColor] = useState('#FFFFFF');
    const [showThreadPop, setShowThreadPop] = useState(false);

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
                    {
                        showThreadPop ? 
                        <Box>
                            {
                                (researchThreads && researchThreads.research_threads.length > 0) ?
                                researchThreads.research_threads.map((r, tIndex:number)=> (
                                    <Box key={`t-${tIndex}`} 
                                        onClick={()=> dispatch({type: "ADD_TAG_TO_THREAD", tag: data.title, threadIndex: tIndex})}
                                        style={{border:"1px solid gray", borderRadius:"5px", cursor:"pointer", textAlign:"center"}}>
                                        {`Add to "${r.title}"`}</Box>
                                ))
                                : <span>{"no threads yet"}</span>
                            }
                            <Button onClick={()=> setShowThreadPop(false)}>{"cancel"}</Button>
                        </Box> :
                        <Button onClick={()=> setShowThreadPop(true)}>{"Add this tag to a thread."}</Button>
                    }
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