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
import { getIndexOfMonth, monthDiff } from '../timeHelperFunctions';

const calcAxis = (axisProps: any) => {

}

const TopTimeline = (projectProps:any)=>{
    const svgRef = React.useRef(null);

    const { projectData } = projectProps;
    const activity = projectData.entries;

    let width = 1000;
    let height = 200;

    const monthGroups = d3.groups(activity, k => new Date(k.date).getMonth())

    let years = d3.groups(activity, y => new Date(y.date).getFullYear())

    let yearMonth = years.sort((a, b) => a[0] - b[0]).map((year, yi) => {
  
      let mon = d3.groups(year[1], m => new Date(m.date).getMonth())
  
      let wrapper = new Array(12).fill({}).map((m, i)=> {
        let activ = mon.filter(f => f[0] === i);
        let activity = activ.length > 0 ? activ.flatMap(f => {
          f[1] = f[1].map(a => {
            a.month = i
            a.year = year[0]
          return a})
          return f[1]}) : [];
        if(activity.length > 0){ 
          activity[0].firstMonth = true;
        }
        return { month: i, year: year[0], activities: activity }
      });
  
      return {year: year[0], months: wrapper}
    });

    console.log('yearMonth', yearMonth)

    let startIndex = getIndexOfMonth(yearMonth[0].months, 'first');
    let endIndex = getIndexOfMonth(yearMonth[yearMonth.length - 1].months, 'last')
    yearMonth[0].months = yearMonth[0].months.filter((f, i)=> i > startIndex - 1)
    yearMonth[yearMonth.length - 1].months = yearMonth[yearMonth.length - 1].months.filter((f, i)=> i < endIndex)
  
    let flatActivities = yearMonth.flatMap(yr => yr.months);

    console.log('flatActi', flatActivities);

    let lineData = flatActivities.map((m, i) => {
      return [i, m.activities.length]
    })


    

    React.useEffect(() => {

   

      let spanTime = d3.extent(activity.map(m=> new Date(m.date)))
     
      const monthScale = d3.scaleLinear().domain([0, monthDiff(spanTime[0], spanTime[1])]).range([0, 1000])
          
      let dateHolder = new Array(monthDiff(spanTime[0], spanTime[1]))
      
      let start = new Date(spanTime[0]).getMonth()
        
      const xScale = d3.scaleTime()
            .domain(d3.extent(activity.map(m=> new Date(m.date))))
            .range([0, width]);
  
            
  
          // Create root container where we will append all other chart elements
          const svgEl = d3.select(svgRef.current);
          svgEl.selectAll("*").remove(); // Clear svg content before adding new elements 
          const svg = svgEl
            .append("g")
            .attr("transform", `translate(10, 10)`);

          // var lineGenerator = d3.line();
          // var pathString = lineGenerator(lineData);
          
          // let path = svg.append('path')
          // d3.select(path)
          //   .attr('d', pathString);
  
          svg.selectAll('rect').data(activity).enter().append('rect').attr('x', d=> {
            
              return xScale(new Date(d.date))}).attr('y',20).attr('width', 2).attr('height', 100)
  
          // svg.selectAll('text').data(activity).enter().append('text').text(d=> d.title).attr('x', d=> {
                 
          //         return xScale(new Date(d.date))}).attr('y', 20).attr('width', 2).attr('height', 100)
      //    // Add X grid lines with labels
  
          // const xAxis = d3.axisBottom(monthScale)
          //     .ticks(5)
          //     .tickSize(-height + 10);
              
          // const xAxisGroup = svg.append("g")
          //     .attr("transform", `translate(0, ${height - 10})`)
          //     .call(xAxis);
  
          // xAxisGroup.select(".domain").remove();
          // xAxisGroup.selectAll("line").enter().append('line').attr("stroke", 'gray.900');
          // //    xAxisGroup.selectAll("line").attr("stroke", "rgba(255, 255, 255, 0.2)");
          // xAxisGroup.selectAll("text").enter().append('text')
          //     .attr("opacity", 0.5)
          //     .attr("color", "gray.900")
          //     .attr("font-size", "0.75rem");
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
        <svg ref={svgRef} width={'100%'} height={'100%'} >
        </svg>
        </Flex>
    )
}

export default TopTimeline;