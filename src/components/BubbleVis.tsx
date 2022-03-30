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

import ForceMagic from '../ForceMagic';
import Bubbles from '../Bubbles';

interface BubbleProps {
    filteredActivites: any,
    projectData: any,
    groupBy: any,
    splitBubbs: Boolean;
    setHoverActivity: (ent:any)=> void
}

const BubbleVis = (props:BubbleProps) => {

    const {filteredActivites, projectData, groupBy, splitBubbs, setHoverActivity} = props;

    const width = 200;
    const height = 600;

    const svgRef = React.useRef(null);

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

    const bubbleData = splitBubbs ? projectData.entries.flatMap(pd=> {
        let files = [...pd.files];
        files.map(f=> {
            f.activityTitle = pd.title;
            f.date = pd.date;
            return f;
        })
        return files;
    }) : projectData.entries;

    console.log('bubbleData', bubbleData);

    const forced = new ForceMagic(bubbleData, width, height, splitBubbs);

    useEffect(() => {

        let svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        let wrap = svg.append('g').attr('transform', 'translate(0, 50)');

        let nodes = forced.nodes.filter(f=> {
            return filteredActivites.map(m=> m.title).includes(f.title);
        })

        if(groupBy){

            let groups = [{label:'all', color:'gray', highlighted:forced.nodes, notHighlighted:[]}]
            if(groupBy.type === 'research_threads'){
                let tempgroups = groupBy.data.map(m=> {
                    let group = {label: m.title, color: m.color}
                    group.highlighted = nodes.filter(n => m.evidence.map((e, i)=> e.activityTitle).includes(n.title))
                    group.highlighted = group.highlighted.map(h => {
                        h.rtTitle = m.title;
                        h.evidence = m.evidence.filter((e, i)=> e.activityTitle === h.title);
                        return h
                    });

                    group.notHighlighted = nodes.filter(n=> m.evidence.map((e, i)=> e.activityTitle).indexOf(n.title) === -1)
                    return group;
                });
                
                groups = [...groups, ...tempgroups];

                let groupGroups = wrap.selectAll('g.group').data(groups).join('g').attr('class', 'group');

                groupGroups.attr('transform', (d, i) => `translate(${i * 200}, 0)`);

                let activityNotGroups = groupGroups.selectAll('g.activity_not')
                .data(d => d.notHighlighted).join('g').attr('class', 'activity_not');

                let activityHighlightGroups = groupGroups.selectAll('g.activity')
                .data(d => {
                    let temp = d.highlighted.map(m => {
                        m.color = d.color
                        return m;
                    })
                    return temp}).join('g').attr('class', 'activity');

                let bubbleNotHighlighted = new Bubbles(activityNotGroups, false);
                let bubbleHighlighted = new Bubbles(activityHighlightGroups, true);

                bubbleHighlighted.bubbles.on('mouseover', (event, d)=> {
                    d3.select(event.target).attr('r', (d.radius * 2)).attr('stroke', '#fff').attr('stroke-width', 2);
            
                    // setHoverActivity(d);
            
                    let htmlForm = () => {
                        let start =  `<div style="margin-bottom:10px; font-weight:700">`
                    if(!d.evidence){
                        start = start + `Activity: ${d.title} <br/>`

                        d.files.forEach((f)=> {
                            start = start + `<div><span style="font-weight:700; font-size:14px">${f.artifactType}:  </span>${f.title}</div>`
                        })

                    }else{
                        start = start + `Research Thread: ${d.rtTitle} - Activity: ${d.title} <br/>`
                        d.evidence.forEach((t)=> {
                            let type = t.type === 'fragment' ? 'Fragment of Artifact' : t.type;
                            let artifactTitle = t.type === 'fragment' || t.type === 'artifact' ? `: ${t.artifactTitle}` : '';
                            start = start + `<div><span style="font-weight:700; font-size:14px">${type}</span>${artifactTitle}</div></br>`
                            if(t.type === 'fragment'){
                            t.anchors.map(an => {
                                if(an.anchor_type === 'text'){
                                start = start + `<div style="margin-bottom:10px">${an.frag_type}</div>`
                                }
                            })
                            }
                            start = start + `<div>Rationale: ${t.rationale}<div>`
                        });
                    }
                        start = start + `</div>`
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
                });
            }
            
        }else{
            let notNodes = forced.nodes.filter(f => filteredActivites.map(m=> m.title).indexOf(f.title) === -1);

            let selectedNodes = forced.nodes.filter(f=> filteredActivites.map(m=> m.title).includes(f.title)).map(m=> {
                m.color = 'gray';
                return m;
            });

            let activityNot = wrap.selectAll('g.activity_not')
            .data(notNodes).join('g').attr('class', 'activity_not');

            let activityGroups = wrap.selectAll('g.activity')
            .data(selectedNodes).join('g').attr('class', 'activity');

            let bubbleNotHighlighted = new Bubbles(activityNot, false);
            let bubbleHighlighted = new Bubbles(activityGroups, true);
        
            
            bubbleHighlighted.bubbles.on('mouseover', (event, d)=> {
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
            });

            
        }

    }, [filteredActivites, groupBy, splitBubbs])

    
    return (
        <div style={{flex:"3"}}>
            <svg ref={svgRef} width={'100%'} height={'100%'}/>
        </div>
    )
}

export default BubbleVis;