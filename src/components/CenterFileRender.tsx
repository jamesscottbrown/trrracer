import React, { useState } from 'react';
import {
  Box
} from '@chakra-ui/react';
import * as d3 from "d3";

const CenterFileRender = (fileArrayProps: any) => {
    const {fileArray} = fileArrayProps;
    
    const svgRef = React.useRef(null);

    let getRectHeight = (fileD) => {
        if(fileD.fileType === 'eml'){
            return 20
        }else{
            return 40
        }
    }

  
    // React.useEffect(() => {

    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll("*").remove(); // Clear svg content before adding new elements 

    let typeData = d3.groups(fileArray, f => f.fileType);

    let typeGroups = svgEl.selectAll('g').data(typeData).enter().append('g').attr('class', c => c[0])

    let rects = typeGroups.selectAll('rect').data(d => d[1]).enter().append('rect').attr('width', 40).attr('height', h => getRectHeight(h));

    console.log('rects', rects);

    // rects.attr('y', (d, i, n)=> {
    //     n.filter()
    // })
    
    

       
    // }, [fileArray]);

    return(
        <Box w={50} bg={'yellow'}>
            <svg width={50} height={fileArray.length * 30} ref={svgRef}>
            </svg>
        </Box>
    )
  }
  
  export default CenterFileRender;