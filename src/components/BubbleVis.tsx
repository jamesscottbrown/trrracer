import path from 'path';
import * as d3 from 'd3';
import React, { useCallback, useEffect, useState } from 'react';

import { extent } from 'd3-array';
import { scaleTime } from 'd3-scale';
import { timeFormat } from 'd3-time-format';

import {
  EntryType,
  ProjectType,
  ProjectViewProps,
  TagType,
} from './types';
import { useProjectState } from './ProjectContext';
import { m } from 'framer-motion';

interface BubbleProps {
    filteredActivites: any,
    projectData: any,
    groupBy: any,
    setHoverActivity: (ent:any)=> void
}

const BubbleVis = (props:BubbleProps) => {

    const {filteredActivites, projectData, groupBy, setHoverActivity} = props;

    const dateRange = extent(projectData.entries.map((e) => new Date(e.date)));

    const width = 200;
    const height = 600;

    const svgRef = React.useRef(null);

    const circleScale = d3.scaleLinear()
    .domain(d3.extent(projectData.entries.map(m=> m.files.length)))
    .range([5, 20])

    //NEED TO MAKE THIS DYNAMIC
    const yScale = scaleTime()
      .range([0, (height - 70)])
      .domain(dateRange);

    const checktool = d3.select('#tooltip');

    const div = checktool.empty() ? 
    d3.select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0) 
    .style('position', 'absolute')
    .style('text-align', 'center')
    .attr('width', 60)
    .attr('height', 2)
    .style('padding', '10px')
    .style('font', '12px sans-serif')
    .style('background', 'white')
    .style('border', '2px solid gray')
    .style('border-radius', '10px')
    .style('pointer-events', 'none')
    : checktool;

    useEffect(() => {

        let nodesAll = projectData.entries.map((a, i)=> {
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
        const simulation = d3.forceSimulation(nodesAll)
            .force('x', d3.forceX().x(width / 2))
            .force('y', d3.forceY().y(d => yScale(new Date(d.date))))
            .force('collision', d3.forceCollide().radius(d => d.radius + 1))

        for (var i = 0; i < 120; ++i) simulation.tick();
        
        let nodes = nodesAll.filter(f=> {
            return filteredActivites.map(m=> m.title).includes(f.title);
        })

        if(groupBy){

            let groups = [{label:'all', color:'gray', highlighted:nodesAll, notHighlighted:[]}]
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
                .attr('fill-opacity', .3)
                .attr('r', (d:any)=> d.radius)
                .attr('cy', (d:any)=> d.y)
                .attr('cx', (d:any)=> d.x)
            }
            
        }else{

            let activityGroups = wrap.selectAll('g.activity')
            .data(nodesAll).join('g').attr('class', 'activity');
        
            let circles = activityGroups.selectAll('circle').data(d => [d]).join('circle');
        
            circles
            .attr('r', (d:any)=> d.radius)
            .attr('cy', (d:any)=> d.y)
            .attr('cx', (d:any)=> d.x)


            let notCirc = circles.filter(f=> {
                return filteredActivites.map(m=> m.title).indexOf(f.title) === -1
            });
            notCirc.attr('fill', 'gray').attr('fill-opacity', 0.25);

            let highCirc = circles.filter(f=> {
                return filteredActivites.map(m=> m.title).includes(f.title)
            });

            highCirc.attr('fill', 'gray');
            

            highCirc.on('mouseover', (event, d)=> {
                d3.select(event.target).attr('r', (d.radius * 2)).attr('stroke', '#fff').attr('stroke-width', 2);

                setHoverActivity(d);

                let htmlForm = () => {
                    let start = `<div style="margin-bottom:10px; font-weight:700">${d.title} <br/>
                                    ${d.date} <br/></div>`
                    d.files.forEach((f)=> {
                        start = start + `<div><span style="font-weight:700; font-size:14px">${f.artifactType}:  </span>${f.title}</div>`
                    })
                    return start;
                }

                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html(htmlForm)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");

            }).on('mouseout', (event, d)=> {
                d3.select(event.target).attr('r', (d.radius)).attr('stroke-width', 0);
                div.transition()
                .duration(500)
                .style("opacity", 0);
            })

            
        }

    }, [filteredActivites])

    
    return (
        <div style={{flex:"3"}}>
            <svg ref={svgRef} width={'100%'} height={'100%'}/>
        </div>
    )
}

export default BubbleVis;