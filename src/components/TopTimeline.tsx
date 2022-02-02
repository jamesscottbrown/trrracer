import React, { useState } from 'react';
import {
  Box,
  Flex,
  useColorModeValue,
  Heading,
  Spacer,
  useBreakpointValue,
  useDisclosure,
  Input,
  InputGroup,
  InputRightElement,
  Button
} from '@chakra-ui/react';
import {
  Search2Icon,
  SearchIcon
} from '@chakra-ui/icons';
import { EntryType, FileObj, ProjectViewProps } from './types';
import * as d3 from "d3";

const calcAxis = (axisProps: any) => {

}

const TopTimeline = (projectProps:any)=>{
    const svgRef = React.useRef(null);

    const { projectData } = projectProps;
    const activity = projectData.entries;

    let width = 1000;
    let height = 200;

    const monthGroups = d3.groups(activity, k => new Date(k.date).getMonth())

    function monthDiff(d1, d2) {
        var months;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        return months <= 0 ? 0 : months;
    }

    React.useEffect(() => {

     // if(activity.length > 0){

        
        let spanTime = d3.extent(activity.map(m=> new Date(m.date)))
     
      
      
          console.log("EXTENT MONTH NEW", monthGroups)
          console.log('span time', spanTime);
          console.log("SPANNER", monthDiff(spanTime[0], spanTime[1]))
  
          const monthScale = d3.scaleLinear().domain([0, monthDiff(spanTime[0], spanTime[1])]).range([0, 1000])
          
          let dateHolder = new Array(monthDiff(spanTime[0], spanTime[1]))
          console.log('datehoder',dateHolder)
          let start = new Date(spanTime[0]).getMonth()
          dateHolder.map((dh, i) => {
            console.log(dh, i, start)
            
          })

          const xScale = d3.scaleTime()
            .domain(d3.extent(activity.map(m=> new Date(m.date))))
            .range([0, width]);
  
            // console.log(xScale.domain())
  
          // Create root container where we will append all other chart elements
          const svgEl = d3.select(svgRef.current);
          svgEl.selectAll("*").remove(); // Clear svg content before adding new elements 
          const svg = svgEl
            .append("g")
            .attr("transform", `translate(10, 10)`);
  
          // svg.selectAll('rect').data(activity).enter().append('rect').attr('x', d=> {
          //     // console.log('XSCALE', new Date(d.date).getMonth())
          //     return xScale(new Date(d.date))}).attr('y',20).attr('width', 2).attr('height', 100)
  
          svg.selectAll('text').data(activity).enter().append('text').text(d=> d.title).attr('x', d=> {
                  //console.log('XSCALE', d3.timeMonth(new Date (d.date)))
                  return xScale(new Date(d.date))}).attr('y', 20).attr('width', 2).attr('height', 100)
      //    // Add X grid lines with labels
  
          const xAxis = d3.axisBottom(monthScale)
              .ticks(5)
              .tickSize(-height + 10);
              
          const xAxisGroup = svg.append("g")
              .attr("transform", `translate(0, ${height - 10})`)
              .call(xAxis);
  
          xAxisGroup.select(".domain").remove();
          xAxisGroup.selectAll("line").enter().append('line').attr("stroke", 'gray.900');
          //    xAxisGroup.selectAll("line").attr("stroke", "rgba(255, 255, 255, 0.2)");
          xAxisGroup.selectAll("text").enter().append('text')
              .attr("opacity", 0.5)
              .attr("color", "gray.900")
              .attr("font-size", "0.75rem");
      }, [activity]);

    return(
        <Flex flex={4} 
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        h={'150px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
        >
        <svg ref={svgRef} width={'100%'} height={'100%'} style={{backgroundColor:"green"}}>
        </svg>
        </Flex>
      
    )
}

export default TopTimeline;