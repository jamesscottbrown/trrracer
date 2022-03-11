import React, { useState } from 'react';
import {
  Box,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Button,
} from '@chakra-ui/react';

import { ChevronDownIcon } from '@chakra-ui/icons';

import * as d3 from "d3";
import { useProjectState } from './ProjectContext';
import SidebarButton from './SidebarButton';
import ThreadNav from './ThreadNav';

const LeftSidebar = () => {

    const [{ projectData, researchThreads, filterTypes }, dispatch] = useProjectState();
    let artifacts = projectData.entries.flatMap(f=> f.files);

    const [fileTypeShown, setFileTypeShown] = useState({title:'all', matches: artifacts.length});

    let types = d3.groups(artifacts, a => a.fileType).map(ty => {
        return {title: ty[0], matches: ty[1].length}
    });
    let sortedTypes = types.sort((a, b)=> b.matches - a.matches);
    sortedTypes.push({title:'all', matches: artifacts.length})
    
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
            <ThreadNav researchTs={researchThreads ? researchThreads.research_threads : null} viewType={'overview'}/>
            <br />
            <Box>
                <span style={headerStyle}>
                    {`${projectData.entries.length} Activities`} 
                </span>
                <br></br>
            </Box>
            <Box marginLeft="3px" borderLeftColor={"black"} borderLeftWidth="1px" padding="3px">
                <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                    {`View ${fileTypeShown.title} artifacts (${fileTypeShown.matches})`}
                </MenuButton>
                <MenuList>
                    <MenuItem>{'all'}</MenuItem>
                    {
                       sortedTypes.map((m:any, i:any) => (
                        <MenuItem 
                            key={`type-${i}`} 
                            data={m} 
                            index={i}
                            onClick={()=>{
                                setFileTypeShown(m);
                                if(m.title != 'all'){
                                    dispatch({ type: 'UPDATE_FILTER_TYPES', filterTypes: [...filterTypes, m.title] });
                                }else{
                                    dispatch({ type: 'UPDATE_FILTER_TYPES', filterTypes: [] });
                                }
                            }}
                        >{`${m.title} (${m.matches})`}</MenuItem>
                        ))
                    }
                </MenuList>
                </Menu>
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