import React, { useState } from 'react';
import {
  Box,
  Flex,
  Grid,
  Wrap,
  WrapItem
} from '@chakra-ui/react';

import * as d3 from "d3";
import CenterFileRender from './centerFileRender';
import { useProjectState } from './ProjectContext';


const Activity = (activityProps: any) => {

    const { activity, folderPath, index } = activityProps;
    const [{ projectData, highlightedTag }, dispatch] = useProjectState();

    // console.log('state in project activity', projectData, highlightedTag)

    console.log('activity', activity);

    const colorVar = activity.tags.indexOf(highlightedTag) > -1 ? 'red' : 'gray';

    return(
        <Box key={`${activity.title}-${index}`} w={50} marginTop={2} className={`activity`}>
            <CenterFileRender key={`cfr-${activity.title}-${index}`} fileArray={activity.files} folderPath={folderPath} bgColor={colorVar}></CenterFileRender>
        </Box>
    )
}

export default Activity;