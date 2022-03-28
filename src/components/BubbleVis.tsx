import path from 'path';

import React, { useCallback, useEffect, useState } from 'react';

import { extent } from 'd3-array';
import { scaleTime } from 'd3-scale';
import { timeFormat } from 'd3-time-format';

import { repositionPoints } from 'respacer';

import {
  EntryType,
  ProjectType,
  ProjectViewProps,
  TagType,
} from './types';
import { useProjectState } from './ProjectContext';


const BubbleVis = (props:any) => {

    const svgRef = React.useRef(null);




    return (
        <div style={{backgroundColor:'red', flex:"3"}}>
            <svg ref={svgRef} width={'100%'} height={'100%'}/>
        </div>
    )
}

export default BubbleVis;