import React from 'react';
import {
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import * as d3 from "d3";
import { getIndexOfMonth } from '../timeHelperFunctions';

const calcAxis = (axisProps: any) => {

}

const TopTimeline = (projectProps:any)=>{
    const svgRef = React.useRef(null);
   

    const { projectData, defineEvent } = projectProps;
    const activity = projectData.entries;

    let width = 1000;
    let height = 100;
    let margin = 200

    let years = d3.groups(activity, y => new Date(y.date).getFullYear())

    let yearMonth = years.sort((a, b) => a[0] - b[0]).map((year) => {

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

    let startIndex = getIndexOfMonth(yearMonth[0].months, 'first');
    let endIndex = getIndexOfMonth(yearMonth[yearMonth.length - 1].months, 'last')
    yearMonth[0].months = yearMonth[0].months.filter((f, i)=> i > startIndex - 1)
    yearMonth[yearMonth.length - 1].months = yearMonth[yearMonth.length - 1].months.filter((f, i)=> i < endIndex)
  
    let jitter = (val:any) => Math.random() * val;
    
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
            .attr("transform", `translate(10, 10)`);

          let circleG = svg.append('g').classed('circle-group', true);

          circleG.attr('transform', 'translate(0, 20)')
  
          circleG.selectAll('circle').data(activity).join('circle')
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
          console.log("THIS IS FALSE");

          const filteredDomain = function (scale:any, min:any, max:any) {
            let dif = scale(d3.min(scale.domain())) - scale.range()[0];
               
            let iMin = (min - dif) < 0 ? 0 : Math.round((min - dif));
            let iMax = Math.round((max - dif));
              
            if (iMax == iMin) --iMin; // It happens with empty selections.
    
            return scale.domain().slice(iMin, iMax)
          }

          const brushed = function(event) {

            if (!event.selection && !event.sourceEvent) return;
            const s0 = event.selection ? event.selection : [1, 2].fill(event.sourceEvent.offsetX),
                  d0 = filteredDomain(xScale, s0[0], s0[1]);
            let s1 = s0;
          
            if (event.sourceEvent && event.type === 'end') {
              s1 = event.selection;//snappedSelection(xScale, d0);
              d3.select(this).transition().call(event.target.move, s1);

              console.log(xScale.invert(event.selection[0]), xScale.invert(event.selection[1]))
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
              .text((d) => {
                let year;
                if (d0.length > 1) {
                  year = d == 'handle--o' ? xScale.invert(s1[0]) : xScale.invert(s1[1]);
                } else {
                  year = d == 'handle--o' ? xScale.invert(s1[0]) : '';
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
          .attr('fill', 'red')
          .attr('transform', d => {
            const x = d == 'handle--o' ? 0 : (width - margin);
            return `translate(${x}, 5)`;
          });

          // Label
          gHandles.selectAll('text')
            .data(d => [d])
            .join('text')
            .attr('text-anchor', 'middle')
            .attr('dy', 0)
            .text(d =>  d == 'handle--o' ? d3.min(xScale.domain()) : d3.max(xScale.domain()))
            

          // // Triangle
          // gHandles.selectAll('.triangle')
          //   .data(d => [d])
          //   .enter()
          //   .append('path')
          //   .attr('class', d => `triangle ${d}`)
          //   .attr('d', triangle)
          //   .attr('transform', d => {
          //     const x = d == 'handle--o' ? -6 : 6,
          //           rot = d == 'handle--o' ? -90 : 90;
          //     return `translate(${x}, ${size.h / 2}) rotate(${rot})`;
          //   });

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

        }

      }, [activity]);

    return(
        <Flex flex={4} 
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