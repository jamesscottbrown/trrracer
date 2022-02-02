import React, { useState } from 'react';
import {
  Box,
  Flex,
  Heading
} from '@chakra-ui/react';

import * as d3 from "d3";


const LeftSidebar = (projectProps: any) => {

    const {projectData} = projectProps;
    console.log(projectData.entries)

    let artifacts = projectData.entries.flatMap(f=> f.files);

    let types = d3.groups(artifacts, a => a.fileType);

    let sortedTypes = types.sort((a, b)=> b[1].length - a[1].length)

    console.log(sortedTypes);
    

    let tags = projectData.tags.map(t => {
        t.matches = projectData.entries.filter(f=> {
            return f.tags.indexOf(t.title) > -1;
        });
        return t;
    });

    let sortedTags = tags.sort((a, b) => b.matches.length - a.matches.length)
   

    return(
        
        <Box p={5} flex='1' flexDirection='column'>
           <Box>
           <Heading as="h7">
              {`${projectData.entries.length} Activities`}
            </Heading><br></br>
            <Heading as="h7">
              {`${artifacts.length} Artifacts`}
            </Heading><br></br>
            <span></span>
           </Box>
           <Box>
               {sortedTypes.map(m => (
                   <Box>{`${m[1].length} ${m[0]} files`}</Box>
               ))}
               <br></br>
           </Box>
           <Heading as="h7">
              {`${tags.length} Tags`}
            </Heading><br></br>
            {
                sortedTags.map(st => (
                    <Box>{`${st.title}  (${st.matches.length})`}</Box>
                ))
            }
        </Box>
      
        
    )
}

export default LeftSidebar;