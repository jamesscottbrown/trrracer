import React, { useState } from 'react';
import {
  Box,
} from '@chakra-ui/react';

import * as d3 from "d3";
import { useProjectState } from './ProjectContext';
import SidebarButton from './SidebarButton';
import ThreadNav from './ThreadNav';

const LeftSidebar = () => {

    const [{ projectData }, dispatch] = useProjectState();

    let artifacts = projectData.entries.flatMap(f=> f.files);

    let types = d3.groups(artifacts, a => a.fileType).map(ty => {
        return {title: ty[0], matches: ty[1]}
    });
    let sortedTypes = types.sort((a, b)=> b.matches.length - a.matches.length);
    
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
            <ThreadNav />
            <br />
            <Box>
                <span style={headerStyle}>
                    {`${projectData.entries.length} Activities`} 
                </span><br></br>
                <span style={headerStyle}>
                    {`${artifacts.length} Artifacts`}
            </span><br></br>
           </Box>
           <Box marginLeft="3px" borderLeftColor={"black"} borderLeftWidth="1px" padding="3px">
                {sortedTypes.map((m:any, i:any) => (
                    <SidebarButton key={`type-${i}`} isTag={false} data={m} index={i} />
                ))}
               <br></br>
           </Box>
           <span style={headerStyle}>
              {`${tags.length} Tags`}
            </span><br></br>
            <Box marginLeft="3px" borderLeftColor={"black"} borderLeftWidth="1px" padding="3px">
            {   
                sortedTags.map((st:any, s:any) => (
                    <React.Fragment key={`tag-${s}-frag`}>
                        <SidebarButton isTag={true} data={st} index={s}/>
                    </React.Fragment>
                ))
            }
            </Box>
        </Box>
      
        
    )
}

export default LeftSidebar;