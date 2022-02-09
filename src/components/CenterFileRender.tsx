import React, { useState } from 'react';
import {
  Box
} from '@chakra-ui/react';
import * as d3 from "d3";
import path from 'path';

const CenterFileRender = (fileArrayProps: any) => {
    const {fileArray, folderPath} = fileArrayProps;
    
    const svgRef = React.useRef(null);

    let getRectHeight = (fileD) => {
        if(fileD.fileType === 'eml'){
            return 20
        }else if(fileD.fileType === 'url'){
            return 7
        }else{
            return 40
        }
    }

    const getHeight = (previousValue, currentValue) => ++previousValue + ++currentValue;

    let getSvgHeight = () => {
        let fileH = fileArray.map(m => getRectHeight(m))
        let fa = fileH.reduce(getHeight, 0)
        return fa
    }

    React.useEffect(() => {

        const svgEl = d3.select(svgRef.current);
        // svgEl.selectAll("*").remove(); // Clear svg content before adding new elements 

        let typeData = d3.groups(fileArray, f => f.fileType).flatMap(m => m[1]);

        let typeGroups = svgEl.selectAll('g').data(typeData).enter().append('g').attr('class', c => c.fileType)

        let rects = typeGroups.selectAll('rect').data(d => [d]).join('rect');
        rects.attr('width', (d)=> d.fileType === 'url' ? 50 : 40).attr('height', h => getRectHeight(h))
        
        rects.attr('fill', (d)=> d.fileType === 'url' ? "#3A9BDC" : "gray");
        rects.attr('x', (d) => d.fileType === 'url' ? 0 : 20);
        
        typeGroups.attr('transform', (d, i, n)=> {
            let space = n.filter((f, j)=> j < i).map(m => d3.select(m).select('rect').attr('height'));
            if(space.length > 0){
                return `translate(0, ${space.reduce(getHeight, 0)})`;
            }else{
                return `translate(0, 0)`;
            }
        });

        let images = typeGroups.filter(f => f.fileType === 'png');
        if(!images.empty()){
          
            images.each((im, i, n) => {

                console.log('im', im, n)

                let defs = d3.select(n[i])
                    .append("defs")
                    .append("pattern")
                    .attr("id", `image${im.title}`)
                    .attr("width", 10)
                    .attr("height", 10)
                    .append("image")
                    .attr("xlink:href", `file://${path.join(folderPath, im.title)}`)
                    .attr("width", 50)
                    .attr("height", 50)
 
                console.log('defs', defs)

                d3.select(n[i]).select("rect")
                    .attr("fill", `url(#image${im.title})`)
                    .style("width", "100%").style('padding-bottom', '92%'); 

            })
            
        }

        // let gdocG = typeGroups.filter(g => g.fileType === 'gdoc');

        // if(!gdocG.empty()){
           
        //     let emR = gdocG.selectAll('rect.em').data(d => {
        //         return d.emphasized}).join('rect').classed('em', true);
        //     console.log('emR', emR)
        //     // emR.attr('width', 30).attr('height', 3);
        // }

    }, [fileArray]);

    return(
        <Box w={50} bg={'#F8F8F8'}>
        {/* <Box w={50}> */}
            <svg width={50} height={getSvgHeight()} ref={svgRef}>
            </svg>
        </Box>
    )
  }
  
  export default CenterFileRender;