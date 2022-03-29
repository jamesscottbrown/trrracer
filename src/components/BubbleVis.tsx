import path from 'path';
import * as d3 from 'd3';
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
import { m } from 'framer-motion';

// const runSimulation = (data:any, circleScale:any, xScale:any, yScale:any) => {
//       //SIMULATION PART
//       let simulation = d3
//         .forceSimulation()
//         .nodes(data)
//         .force("x", d3.forceX(d => xScale(d.position)).strength(1))
//         .force("y", d3.forceY().strength(1))
//         .force(
//           "collision",
//           d3.forceCollide().radius(d => circleScale(d.total))
//         );
  
//       for (
//         let i = 0,
//           n = Math.ceil(
//             Math.log(simulation.alphaMin()) /
//               Math.log(1 - simulation.alphaDecay())
//           );
//         i < n;
//         ++i
//       ) {
//         simulation.tick();
//       }
//     //   simulation.on('end', firstCallback(data));
  
//       // Apply these forces to the nodes and update their positions.
//       // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
//       function firstCallback(firstPassData :any){
  
//           let newData = firstPassData.map(d=> {
//               d.sourceX = d.x;
//               d.sourceY = d.y;
//               return d
//           });
//           //SECOND SIMULATION
//           simulation = d3.forceSimulation().nodes(newData)
//               .force('x', d3.forceX(d => xScale(d.position)).strength(1))
//               .force('y', d3.forceY().y( d => {
//                   let move = groupKeys.filter(g=> g.key === d.category)[0].pos;
//                   return yScale(move);
//               }))
//               .force('collision', d3.forceCollide().radius( d => circleScale(d.total)))
  
//               for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
//                   simulation.tick();
//               }
//               simulation.on('end', secondCallback(newData));
//       }
  
//       function secondCallback(test){
//           //ASSIGN NEW POSITIONS TO GLOBAL DATA
//           that.data = test.map(d=> {
//           let move = that.groupKeys.filter(g=> g.key === d.category)[0].pos;
//               d.moveX = d.x;
//               d.moveY = d.y;
//               //THIS IS TO MAKE EACH GROUP SEPARATE FOR BRUSHES
//               d.correctedY = d.y - that.yScale(move);
//               return d
//           });
//       }
  
//   }
  


const BubbleVis = (props:any) => {

    const {filteredActivites, projectData, groupBy} = props;

    const dateRange = extent(projectData.entries.map((e) => new Date(e.date)));

    console.log(dateRange);

    const width = 200;
    const height = 600;

    const svgRef = React.useRef(null);

    const circleScale = d3.scaleLinear()
    .domain(d3.extent(filteredActivites.map(m=> m.files.length)))
    .range([5, 20])

    //NEED TO MAKE THIS DYNAMIC
    const yScale = scaleTime()
      .range([0, (height - 70)])
      .domain(dateRange);

    useEffect(() => {

        let nodes = filteredActivites.map((a, i)=> {
                let node = {}
                node.date = a.date;
                node.description = a.description;
                node.files = a.files;
                node.index = a.index;
                node.key_txt = a.key_txt;
                node.month = a.month;
                node.tags = a.tags;
                node.title = a.title;
                node.urls = a.urls;
                node.year = a.year;
                node.radius = circleScale(a.files.length);
                return node;
            });
        
        
        let svg = d3.select(svgRef.current);

        svg.selectAll('*').remove();

        let wrap = svg.append('g').attr('transform', 'translate(0, 50)');

        // create a force simulation and add forces to it
        const simulation = d3.forceSimulation(nodes)
            .force('x', d3.forceX().x(width / 2))
            .force('y', d3.forceY().y(d => yScale(new Date(d.date))))
            .force('collision', d3.forceCollide().radius(d => d.radius + 1))

        for (var i = 0; i < 120; ++i) simulation.tick();


        if(groupBy){

            let groups = [{label:'all', color:'gray', highlighted:nodes, notHighlighted:[]}]
            if(groupBy.type === 'research_threads'){
                let tempgroups = groupBy.data.map(m=> {
                    let group = {label: m.title, color: m.color}
                    group.highlighted = nodes.filter(n => m.evidence.map((e, i)=> e.activityTitle).includes(n.title))
                    group.notHighlighted = nodes.filter(n=> m.evidence.map((e, i)=> e.activityTitle).indexOf(n.title) === -1)
                    return group;
                });
                
                groups = [...groups, ...tempgroups];

                let groupGroups = wrap.selectAll('g.group').data(groups).join('g').attr('class', 'group');

                groupGroups.attr('transform', (d, i) => `translate(${i * 200}, 0)`)
    
                let activityHighlightGroups = groupGroups.selectAll('g.activity')
                .data(d => {
                    let temp = d.highlighted.map(m => {
                        m.color = d.color
                        return m;
                    })
                    return temp}).join('g').attr('class', 'activity');
            
                let circlesH = activityHighlightGroups.selectAll('circle').data(d => [d]).join('circle');
            
                circlesH
                .attr('fill', d=> d.color)
                .attr('r', (d:any)=> d.radius)
                .attr('cy', (d:any)=> d.y)
                .attr('cx', (d:any)=> d.x)

                let activityNotGroups = groupGroups.selectAll('g.activity_not')
                .data(d => d.notHighlighted).join('g').attr('class', 'activity_not');
            
                let circlesNH = activityNotGroups
                .selectAll('circle')
                .data(d => [d])
                .join('circle');
            
                circlesNH
                .attr('fill', 'gray')
                .attr('fill-opacity', .5)
                .attr('r', (d:any)=> d.radius)
                .attr('cy', (d:any)=> d.y)
                .attr('cx', (d:any)=> d.x)
            }
            
        }else{

            let activityGroups = wrap.selectAll('g.activity')
            .data(nodes).join('g').attr('class', 'activity');
        
            let circles = activityGroups.selectAll('circle').data(d => [d]).join('circle');
        
            circles
            .attr('r', (d:any)=> d.radius)
            .attr('cy', (d:any)=> d.y)
            .attr('cx', (d:any)=> d.x)
        }

    }, [filteredActivites])

    
    return (
        <div style={{flex:"3"}}>
            <svg ref={svgRef} width={'100%'} height={'100%'}/>
        </div>
    )
}

export default BubbleVis;