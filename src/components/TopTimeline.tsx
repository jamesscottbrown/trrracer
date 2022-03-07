import React, { useState } from 'react';
import {
  Box,
  Flex,
  useColorModeValue
} from '@chakra-ui/react';

import * as d3 from "d3";
import { getIndexOfMonth, monthDiff } from '../timeHelperFunctions';
import { useProjectState } from './ProjectContext';

export const dataStructureForTimeline = (activityData:any) => {
  let years = d3.groups(activityData, (y:any) => new Date(y.date).getFullYear())

  return years.sort((a:any, b:any) => a[0] - b[0]).map((year:any) => {

    let mon = d3.groups(year[1], (m:any) => new Date(m.date).getMonth())

    let wrapper = new Array(12).fill({}).map((m, i)=> {
      let activ = mon.filter((f:any) => f[0] === i);
      let activity = activ.length > 0 ? activ.flatMap((f:any) => {
        f[1] = f[1].map((a:any) => {
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
}

export const jitter = (val:any) => Math.random() * val;

const TopTimeline = (projectProps:any)=> {

    const svgRef = React.useRef(null);
   
    const { defineEvent, timeFilter, setTimeFilter } = projectProps;
    const [{ projectData, selectedArtifactEntry, selectedArtifactIndex }, dispatch] = useProjectState();
    const activity = projectData.entries;
    const [ newWidth, setNewWidth ] = useState('1200px');

    let width = +newWidth.split('px')[0];
    let height = 100;
    let margin = 10;

    const yearMonth = dataStructureForTimeline(activity);

    let startIndex = getIndexOfMonth(yearMonth[0].months, 'first');
    let endIndex = getIndexOfMonth(yearMonth[yearMonth.length - 1].months, 'last')
    yearMonth[0].months = yearMonth[0].months.filter((f, i)=> i > startIndex - 1)
    yearMonth[yearMonth.length - 1].months = yearMonth[yearMonth.length - 1].months.filter((f, i)=> i < endIndex)
 
    React.useLayoutEffect(() => {
      // I don't think it can be null at this point, but better safe than sorry
       if (svgRef.current) {
          setNewWidth(window.getComputedStyle(svgRef.current).width);
       }
     });
    
    React.useEffect(() => {

      const xScale = d3.scaleTime()
            .domain(d3.extent(activity.map(m=> new Date(m.date))))
            .range([0, (width - margin)])
            .nice();
  
          // Create root container where we will append all other chart elements
          const svgEl = d3.select(svgRef.current);
          svgEl.selectAll("*").remove(); // Clear svg content before adding new elements 

          const svg = svgEl
            .append("g")
            .attr("transform", `translate(50, 10)`);

          let circleG = svg.append('g').classed('circle-group', true);

          circleG.attr('transform', 'translate(0, 20)')
  
          let circles = circleG.selectAll('circle').data(activity).join('circle')
          .attr('cx', d=> xScale(new Date(d.date)))
          .attr('cy', ()=> jitter(10))
          .attr('r', 5)
      
          .attr('fill', 'gray')
          .attr('fill-opacity', .4)
  
          const xAxis = d3.axisBottom(xScale)
              .ticks(16)
              .tickSize(10);
              
          const xAxisGroup = svg.append("g")
              .attr("transform", `translate(10, 40)`)
              .call(xAxis);
  
          xAxisGroup.select(".domain").remove();
          xAxisGroup.selectAll("line").enter().append('line').attr("stroke", 'gray.900');
   
          xAxisGroup.selectAll("text").join('text')
              .attr("opacity", 0.5)
              .attr("color", "gray.900")
              .attr("font-size", "0.75rem");

        if(!defineEvent){

          const filteredDomain = function (scale:any, min:any, max:any) {
            let dif = scale(d3.min(scale.domain())) - scale.range()[0];
               
            let iMin = (min - dif) < 0 ? 0 : Math.round((min - dif));
            let iMax = Math.round((max - dif));
              
            if (iMax == iMin) --iMin; // It happens with empty selections.
    
            return scale.domain().slice(iMin, iMax)
          }

          if(!selectedArtifactEntry && !selectedArtifactIndex){
            const brushed = function(event, d) {

              if (!event.selection && !event.sourceEvent) return;
              const s0 = event.selection ? event.selection : [1, 2].fill(event.sourceEvent.offsetX),
                    d0 = filteredDomain(xScale, s0[0], s0[1]);
              let s1 = s0;
            
              if (event.sourceEvent && event.type === 'end') {
                s1 = event.selection;
                d3.select(this).transition().call(event.target.move, s1);
                setTimeFilter([xScale.invert(event.selection[0]), xScale.invert(event.selection[1])]);
              }
              
              // move handlers
              d3.selectAll('g.handles')
                .attr('transform', d => {
                  const x = d == 'handle--o' ? s1[0] : s1[1];
                  return `translate(${x}, 0)`;
                });
            
               // update labels
               d3.selectAll('g.handles').selectAll('text')
                .attr('dx', d0.length > 1 ? 0 : 6)
                .text((d, i) => {
                  let year;
                  if (d0.length > 1) {
                    year = d == 'handle--o' ? xScale.invert(s1[0]).toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"}) : xScale.invert(s1[1]).toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"});
                  } else {
                    year = d == 'handle--o' ? xScale.invert(s1[0]).toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"}) : '';
                  } 
                  return year;
               })
            
                // update circles
                d3.selectAll('circle')
                  .attr('opacity', (d, i, n) => {
                    if(d3.select(n[i]).attr('cx') <= event.selection[0] || d3.select(n[i]).attr('cx') >= event.selection[1]){
                      return .2
                    }else{
                      return .5
                    }
                  });
            }
  
            let bX = d3.brushX()
            .handleSize(8)
            .extent([[0, 0], [(width - margin), height]])
            .on('start brush end', brushed)
  
            const gBrush = svg.append('g')
            .call(bX)
            .call(bX.move, [0, (width - margin)])
  
              // Custom handlers
            // Handle group
            const gHandles = gBrush.selectAll('g.handles')
            .data(['handle--o', 'handle--e'])
            .join('g')
            .attr('class', d => `handles ${d}`)
            .attr('fill', 'black')
            .attr('transform', d => {
              const x = d == 'handle--o' ? 0 : (width - margin);
              return `translate(${x}, 5)`;
            });
  
            // Label
            gHandles.selectAll('text')
              .data(d => [d])
              .join('text')
              .attr('text-anchor', 'middle')
              .attr('dy', -2)
              .text(d =>  {
                if(d == 'handle--o'){
                  return d3.min(xScale.domain()).toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"})
                }else{
                  return d3.max(xScale.domain()).toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"})
                }
              }).style('font-size', '11px')
                 // Visible Line

            gHandles.selectAll('.line')
              .data(d => [d])
              .join('line')
              .attr('class', d => `line ${d}`)
              .attr('x1', 0)
              .attr('y1', -5)
              .attr('x2', 0)
              .attr('y2', height + 5)
              .attr('stroke', 'black');

          }else{
            circles.filter((c:any)=> {
              return c.title === selectedArtifactEntry.title;
            }).attr('fill', 'red').attr('r', 10)
          }
        }

      }, [activity]);

    return(
        <Flex 
        // flex={4} 
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        h={height}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
        >
        <svg id={'time-svg'} ref={svgRef} width={'100%'} height={'100%'} >
        </svg>
        </Flex>
    )
}

export default TopTimeline;