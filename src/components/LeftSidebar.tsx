import React, { useState } from 'react';
import {
  Box,
  Flex,
  Heading
} from '@chakra-ui/react';

import * as d3 from "d3";
import { useProjectState } from './ProjectContext';
import SidebarButton from './SidebarButton';

const LeftSidebar = () => {

    const [{ projectData }, dispatch] = useProjectState();

    let artifacts = projectData.entries.flatMap(f=> f.files);

    let types = d3.groups(artifacts, a => a.fileType);

    let sortedTypes = types.sort((a, b)=> b[1].length - a[1].length)
    

    let tags = projectData.tags.map(t => {
        t.matches = projectData.entries.filter(f=> {
            return f.tags.indexOf(t.title) > -1;
        });
        return t;
    });

    let sortedTags = tags.sort((a, b) => b.matches.length - a.matches.length)
   
    const headerStyle = {fontSize:'19px', fontWeight:600}

    return(
        
        <Box margin="8px" p={5} flex='.7' flexDirection='column' h='calc(100vh - 250px)' overflow="auto">
            <Box>
                <span style={headerStyle}>
                    {`${projectData.entries.length} Activities`}
                </span><br></br>
                <span style={headerStyle}>
                    {`${artifacts.length} Artifacts`}
            </span><br></br>
            <span></span>
           </Box>
           <Box marginLeft="3px" borderLeftColor={"black"} borderLeftWidth="1px" padding="3px">
                {sortedTypes.map((m:any, i:any) => (
                   <Box key={`${m.title}-${i}`} onMouseEnter={()=>{
                    console.log('highlight in filetype mousehover', m.title)
                    // dispatch({type: "HIGHLIGHT_TAG", highlightedTag: st.title})
                   }}>{`${m[1].length} ${m[0]} files`}</Box>
                ))}
               <br></br>
           </Box>
           <span style={headerStyle}>
              {`${tags.length} Tags`}
            </span><br></br>
            <Box marginLeft="3px" borderLeftColor={"black"} borderLeftWidth="1px" padding="3px">
            {   
                sortedTags.map((st:any, s:any) => (
                    <SidebarButton isTag={true} data={st} index={s}/>
                    // <Box key={`${st.title}-${s}`} onMouseOver={()=> {
                    //     console.log('highlight in mousehover', st.title)
                    //     dispatch({type: "HIGHLIGHT_TAG", highlightedTag: st.title}) 
                    // }} onMouseLeave={() => dispatch({type: "HIGHLIGHT_TAG", highlightedTag: null})}>{`${st.title}  (${st.matches.length})`}</Box>
                ))
            }
            </Box>
        </Box>
      
        
    )
}

export default LeftSidebar;