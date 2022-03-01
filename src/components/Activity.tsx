import React, { useState } from 'react';
import {
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Button,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';

import * as d3 from "d3";
import CenterFileRender from './centerFileRender';
import { useProjectState } from './ProjectContext';


const Activity = (activityProps: any) => {

    const { activity, folderPath, index } = activityProps;
    const [{ projectData, highlightedTag }, dispatch] = useProjectState();

    const colorVar = activity.tags.indexOf(highlightedTag) > -1 ? '#FFFCBB' : '#F5F5F5';
   
    return(
        <Popover trigger="hover">
            <PopoverTrigger>
                <Box key={`${activity.title}-${index}`} w={50} marginTop={2} className={`activity`}>
                    <CenterFileRender key={`cfr-${activity.title}-${index}`} fileArray={activity.files} folderPath={folderPath} bgColor={colorVar}></CenterFileRender>
                </Box>
            </PopoverTrigger>
            <PopoverContent bg='white' color='gray'>
                <PopoverArrow bg='white' />
                <PopoverHeader>{`${activity.title}`}
                <span style={{display:'block'}}>{activity.date}</span>
                </PopoverHeader>
                <PopoverBody>
                    <span style={{display:'block'}}>{"Artifacts:"}</span>
                    <UnorderedList>
                        {
                            activity.files.map((f, i)=>(
                                <ListItem key={`f-${f.title}-${i}`}>{f.title}</ListItem>
                            ))
                        }
                    </UnorderedList>
                  
                </PopoverBody>
            </PopoverContent>
        </Popover>
       
    )
}

export default Activity;