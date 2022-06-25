import * as d3 from 'd3';
import React, { useEffect, useState } from 'react';
import { useProjectState } from './ProjectContext';
import ForceMagic from '../ForceMagic';
import Bubbles from '../Bubbles';
import { dataStructureForTimeline } from './VerticalAxis';
import type { EntryType } from './types';
import { calcCircles } from '../PackMagic';
import { getIndexOfMonth } from '../timeHelperFunctions';

interface BubbleDetProps {
  filteredActivities: EntryType[];
  widthSvg: number;
  filterType: null | any;
}

const ToolTip = (toolProp: any) => {
  const {hoverData, position} = toolProp;

  return <div
    id={'tooltip'}
    style={{
      position:'absolute',
      left: position[0] + 450,
      top: position[1],
      textAlign: 'left',
      minWidth:100,
      minHeight:50,
      padding:10,
      backgroundColor: '#fff',
      border: '2px solid gray',
      borderRadius: 10,
      pointerEvents:'none',
      zIndex: 6000
    }}
  >
    <span
    style={{
      font: '15px sans-serif',
      fontWeight:600
    }}
    >{hoverData.fileData.title}</span>
    <div>
    {
      hoverData.hopDataArray.map((fi:any, i:any) => (
        <div
            key={`act-data-${i}`}
            style={{display:'block', margin:5}}
        >
            <span
                style={{
                    font: '13px sans-serif',
                    fontWeight:600
                }}
            >{fi.hopReason === 'tag' ? `This was hopped to from tag : ${fi.tag}` : `${fi.hopReason}`}</span>
        </div>
      ))
    }
    </div>
  </div>
}

const DetailBubble = (props: BubbleDetProps) => {
  const {
    filteredActivities,
    widthSvg,
    filterType
  } = props;

  const [
    { projectData, selectedArtifactEntry, selectedArtifactIndex, hopArray },
    dispatch
  ] = useProjectState();
  
  const [newHeight, setNewHeight] = useState(1000);
  const [svgWidth, setSvgWidth] = useState(widthSvg);
  const [translateY, setTranslateY] = useState(35);
  const [hoverData, setHoverData] = useState({fileData: projectData.entries[0].files[0], hopDataArray: [{hopReason:'null'}]});
  const [toolPosition, setToolPosition] = useState([0, 0]);

  const width = 80;

  const height = +newHeight//.split('px')[0];

  const svgRef = React.useRef(null);

  let packedCircData = calcCircles(projectData.entries);

  d3.select('#tooltip').style('opacity', 0);

  const forced = new ForceMagic(packedCircData, width, height - 100);

  useEffect(()=> {
    if (svgRef.current) {
       setNewHeight((window.innerHeight - 150));
     }
  
      setSvgWidth(600);
     
  }, [window.innerHeight, window.innerWidth])
  

  useEffect(() => {
   

    
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const underWrap = svg.append('g').classed('path-wrap', true)
    underWrap.attr('transform', `translate(105, 20)`);
    const wrap = svg.append('g').attr('transform', `translate(95, 20)`);

    const { yScale, margin } = forced;
    setTranslateY(margin / 2);

    const yearMonth = dataStructureForTimeline(projectData.entries);

    const startIndex = getIndexOfMonth(yearMonth[0].months, 'first');
    const endIndex = getIndexOfMonth(
      yearMonth[yearMonth.length - 1].months,
      'last'
    );
    yearMonth[0].months = yearMonth[0].months.filter(
      (f: any, i: number) => i > startIndex - 1
    );
    yearMonth[yearMonth.length - 1].months = yearMonth[
        yearMonth.length - 1
    ].months.filter((f: any, i: number) => i < endIndex);

    let allActivityGroups = wrap
    .selectAll('g.activity')
    .data(forced.nodes)
    .join('g')
    .attr('class', 'activity');

    allActivityGroups.attr('transform', d => `translate(${d.x}, ${d.y})`);

    let activityBubbles = new Bubbles(
    allActivityGroups,
    true,
    'all-activities'
    );

    activityBubbles.bubbles.attr('fill', "#d3d3d3").attr('fill-opacity', .3).attr('stroke', '#d3d3d3').attr('stroke-width', .4);
    
    let artifactCircles = allActivityGroups.selectAll('circle.artifact').data(d => d.files).join('circle').classed('artifact', true);
    artifactCircles.attr('r', d => (3)).attr('cx', d => d.x).attr('cy', d => d.y);

    let highlightedActivities = allActivityGroups.filter((ac) => {
    
      return hopArray ? hopArray.map((m) => m.activity.title).includes(ac.title): []});
   
    highlightedActivities.select('.all-activities').attr('fill', "#F5F5F5").attr('fill-opacity', 1).attr('stroke-width', 1);;

    let highlightedCircles = highlightedActivities.selectAll('circle.artifact').filter((f) => {
        return hopArray.map(h => h.artifactUid).includes(f.artifact_uid);
    });

    highlightedActivities.selectAll('circle.artifact').filter((f) => {
        return hopArray.map(h => h.artifactUid).indexOf(f.artifact_uid) === -1;
    }).attr('fill', 'gray')
    .attr('fill-opacity', .2);

    highlightedCircles.attr('fill', 'gray');
    
    let theChosenOne = highlightedActivities.filter(f => f.title === selectedArtifactEntry.title);
    theChosenOne.selectAll('circle.artifact').filter((af, i) => selectedArtifactIndex === i).attr('fill', 'red');

    let hiddenCircles = allActivityGroups.filter(ac => {
    return hopArray.map((m) => m.activity.title).indexOf(ac.title) === -1})
    .selectAll('circle.artifact');

    hiddenCircles.attr('fill', 'gray')
    .attr('fill-opacity', .2);

    let linkData = [];
    
    // highlightedActivities.each(f => {
    //     linkData.push({coord: [(f.x - 8), f.y], date: f.date})
    // })

    hopArray.forEach((h, i) => {
        let temp = highlightedActivities.filter(f => h.activity.title === f.title);
        let td = temp.data()[0];
        if(td && td.x && td.y){

          linkData.push({coord: [(td.x - 8), td.y], date: td.date});

        }
        
    });
 
    var lineGenerator = d3.line();

    var pathStringSolid = lineGenerator(linkData.map(m=> m.coord));

    underWrap.append('path')
    .attr('d', pathStringSolid)
    .attr('fill', 'none')
    .attr('stroke', 'gray')
    .attr('stroke-width',1);
 
    highlightedCircles
        .on('mouseover', (event, d) => {
            let hopData = hopArray.filter(f => f.artifactUid === d.artifact_uid);
            let parentData = d3.select(event.target.parentNode).data()[0];
            setToolPosition([(parentData.x - (parentData.radius + 5)), parentData.y]);
            let hovData = {fileData: d, hopDataArray: hopData}
            setHoverData(hovData);
            d3.select('#tooltip').style('opacity', 1);
        })
        .on('mouseout', (event:any, d:any) => {
          d3.select('#tooltip').style('opacity', 0);
        }).on('click', (event:any, d:any)=> {
          
            let parentData = d3.select(event.target.parentNode).data()[0];
            let selectedArtIndex = parentData.files.map(f => f.artifact_uid).indexOf(d.artifact_uid);
          
            let newHopData = [
                    ...hopArray,
                    { activity: 
                    parentData, 
                    artifactUid: parentData.files[selectedArtifactIndex].artifact_uid,
                    hopReason: 'revisit hopped artifact',
                    }
                ]
          
            dispatch({
                type: 'SELECTED_ARTIFACT',
                selectedArtifactEntry: parentData,
                selectedArtifactIndex: selectedArtIndex,
                hopArray: [
                  ...hopArray,
                  { activity: parentData, 
                    artifactUid: parentData.files[selectedArtifactIndex].artifact_uid,
                    hopReason: 'revisit hopped artifact',
                  },
                ]
            });
        })

    // }
      
  }, [filteredActivities, filterType, selectedArtifactEntry, selectedArtifactIndex]);

  return (
    <div style={{ width: widthSvg, paddingTop:'10px' }}>
        <svg
            ref={svgRef}
            width={svgWidth}
            height={height}
            style={{ display: 'inline' }}
        />
        <ToolTip hoverData={hoverData} position={toolPosition}/>
    </div>
  );
};

export default DetailBubble;