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


const Activity = (activityProps: any) => {

    const { activity, folderPath, index } = activityProps;

    return(
        <Box key={`${activity.title}-${index}`} w={50} marginTop={2} className={`activity`}>
            <CenterFileRender key={`cfr-${activity.title}-${index}`} fileArray={activity.files} folderPath={folderPath} ></CenterFileRender>
        </Box>
    )
}

export default Activity;