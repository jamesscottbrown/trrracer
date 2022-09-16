import * as d3 from 'd3';
import * as d3co from 'd3-color';
import React, { useEffect, useMemo, useState } from 'react';
import { useProjectState } from './ProjectContext';
import ForceMagic from '../ForceMagic';
import Bubbles from '../Bubbles';
import { dataStructureForTimeline } from './VerticalAxis';
import { calcCircles } from '../PackMagic';
import { getIndexOfMonth } from '../timeHelperFunctions';

interface BubbleDetProps {
  widthSvg: number;
  filterType: null | any;
}

const ToolTip = (toolProp: any) => {
  const { hoverData, position } = toolProp;

  const queryData = hoverData.queryMatch ? hoverData.queryMatch[0] : null;

  return (
    <div
      id="tooltip"
      style={{
        position: 'absolute',
        left: position[0] + 450,
        top: position[1],
        textAlign: 'left',
        minWidth: 100,
        minHeight: 50,
        padding: 10,
        backgroundColor: '#fff',
        border: '2px solid gray',
        borderRadius: 10,
        pointerEvents: 'none',
        zIndex: 6000,
      }}
    >
      {hoverData.fileData ? (
        <span
          style={{
            font: '15px sans-serif',
            fontWeight: 600,
          }}
        >
          {hoverData.fileData.title}
        </span>
      ) : (
        <div>uknown</div>
      )}
      {hoverData.queryMatch ? (
        <div>
          {queryData.textMatch.length > 0 && (
            `${queryData.textMatch.length} matches found in text`
          )}
          {queryData.googMatch.length > 0 && (
            `${queryData.googMatch.length} matches found in google doc`
          )}
        </div>
      ):(
        <div>
        {hoverData.hopDataArray.map((fi: any, i: any) => (
          <div key={`act-data-${i}`} style={{ display: 'block', margin: 5 }}>
            <span
              style={{
                font: '13px sans-serif',
                fontWeight: 600,
              }}
            >
              {fi.hopReason === 'tag'
                ? `This was hopped to from tag : ${fi.tag}`
                : `${fi.hopReason}`}
            </span>
          </div>
        ))}
        </div>
      )}
     
    </div>
  );
};

const DetailBubble = (props: BubbleDetProps) => {
  const { 
    widthSvg, 
    filterType, 
    windowDimension, 
    bubbleDivWidth,
    setBubbleDivWidth  
  } = props;

  const [
    { projectData, 
      filteredActivities, 
      selectedArtifact, 
      hopArray, 
      query },
    dispatch,
  ] = useProjectState();

  const [newHeight, setNewHeight] = useState(1000);
  const [svgWidth, setSvgWidth] = useState(widthSvg);
  const [translateY, setTranslateY] = useState(35);
  const [hoverData, setHoverData] = useState({
    fileData: projectData.entries[0].files[0],
    hopDataArray: [{ hopReason: 'null' }],
    queryMatch: null
  });
  const [height, setHeight] = useState(windowDimension.height - 200);
  const [toolPosition, setToolPosition] = useState([0, 0]);

  useEffect(() => {
    setHeight(windowDimension.height - 200);

  }, [windowDimension]);

  const width = 80;
  const translateXforWraps = 90;
  const svgRef = React.useRef(null);

  const packedCircData = calcCircles(projectData.entries);

  d3.select('#tooltip').style('opacity', 0);

  useEffect(() => {
    if (svgRef.current) {
      setNewHeight(window.innerHeight - 150);
    }
    setSvgWidth(600);
  }, [window.innerHeight, window.innerWidth]);

  const usedEntries = useMemo(() => {
    return query ?
      filteredActivities
      : projectData.entries.filter(f => hopArray.map(h => h.activity.activity_uid).includes(f.activity_uid));
  }, [
    projectData.entries.length,
    filteredActivities.length,
  ]);

  const forced = useMemo(() => {
    return new ForceMagic(packedCircData, width, newHeight);
  }, [packedCircData]);

  const highlightedNodes = useMemo(() => {
    const ids = usedEntries.map((m) => m.activity_uid);
    return forced.nodes.filter((f) => ids.includes(f.activity_uid));
  }, [usedEntries.length]);

  const notNodes = useMemo(() => {
    const ids = usedEntries.map((m) => m.activity_uid);
    return forced.nodes.filter((f) => ids.indexOf(f.activity_uid) === -1);
  }, [usedEntries.length]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const underWrap = svg.append('g').classed('under-wrap', true);
    underWrap.attr(
      'transform',
      `translate(${translateXforWraps}, ${translateY})`
    );

    const midWrap = svg.append('g').classed('path-wrap', true);
    midWrap.attr(
      'transform',
      `translate(${translateXforWraps}, ${translateY})`
    );

    const wrap = svg
      .append('g')
      .attr('transform', `translate(${translateXforWraps}, ${translateY})`);

    const { yScale, margin } = forced;
    // setTranslateY(margin / 2);

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

    //// START AXIS
    const checkGroup = svg.select('g.timeline-wrap');
    const wrapAxisGroup = checkGroup.empty()
      ? svg.append('g').attr('class', 'timeline-wrap')
      : checkGroup;

    wrapAxisGroup.selectAll('*').remove();
    wrapAxisGroup.attr('transform', `translate(50, ${translateY})`);

    const yAxis = d3.axisLeft(yScale).ticks(40).tickSize(10);

    const yAxisGroup = wrapAxisGroup
      .append('g')
      // .attr('transform', `translate(-50, 0)`)
      .call(yAxis);

    yAxisGroup.select('.domain').remove();
    yAxisGroup
      .selectAll('line')
      .enter()
      .append('line')
      .attr('stroke', 'gray.900');

    yAxisGroup
      .selectAll('text')
      .join('text')
      .attr('font-size', '0.55rem')
      .attr('opacity', 0.5);
    /// END AXIS

    //HIGHLIGHTED AND NOT HIGHLIGHTED GROUPS

    const hiddenActivityGroups = underWrap
    .selectAll('g.hidden-activity')
    .data(notNodes)
    .join('g')
    .attr('class', 'hidden-activity');

    hiddenActivityGroups.attr(
      'transform',
      (d) => `translate(${d.x}, ${d.y})`
    );

  const hiddenBubbles = new Bubbles(hiddenActivityGroups, true, 'hidden');

  hiddenBubbles.bubbles
    .attr('fill', d3co.hsl('#d3d3d3').copy({ l: 0.94 })) // .attr('fill-opacity', .3)
    .attr('stroke', '#d3d3d3')
    .attr('stroke-width', 0.4);

  const hiddenCircles = hiddenActivityGroups
    .selectAll('circle.artifact')
    .data((d) => d.files)
    .join('circle')
    .classed('artifact', true);

  hiddenCircles
    .attr('r', () => 3)
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y);
  hiddenCircles.attr('fill', '#d3d3d3');

  // HIGHLIGHTED ACTIVITIES
  const highlightedActivityGroups = wrap
    .selectAll('g.activity')
    .data(highlightedNodes)
    .join('g')
    .attr('class', 'activity');

  highlightedActivityGroups.attr(
    'transform',
    (d) => `translate(${d.x}, ${d.y})`
  );

  const activityBubbles = new Bubbles(
    highlightedActivityGroups,
    true,
    'all-activities'
  );

  activityBubbles.bubbles
    .attr('fill', '#d3d3d3') // .attr('fill-opacity', .3)
    .attr('stroke', '#d3d3d3')
    .attr('stroke-width', 0.4);

  const artifactCircles = highlightedActivityGroups
    .selectAll('circle.artifact')
    .data((d) => d.files)
    .join('circle')
    .classed('artifact', true);

  artifactCircles.attr('fill', 'gray');

  artifactCircles
    .attr('r', () => 3)
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y);

  const theChosenOne = highlightedActivityGroups.filter(
    (f) => f.title === selectedArtifact.activity.title
  );
  theChosenOne
    .selectAll('circle.artifact')
    .filter((af, i) => selectedArtifact.artifactIndex === i)
    .attr('fill', 'red');

   
  const linkData = [];

  hopArray.forEach((h) => {
    const temp = highlightedActivityGroups.filter(
      (f) => h.activity.title === f.title
    );
    const td = temp.data()[0];
    if (td && td.x && td.y) {
      linkData.push({ coord: [td.x - 8, td.y], date: td.date });
    }
  });

  const lineGenerator = d3.line();

  const pathStringSolid = lineGenerator(linkData.map((m) => m.coord));

  underWrap
    .append('path')
    .attr('d', pathStringSolid)
    .attr('fill', 'none')
    .attr('stroke', 'gray')
    .attr('stroke-width', 1);

    artifactCircles
      .on('mouseover', (event, d) => {

        if(query){

          const parentData = d3.select(event.target.parentNode).data()[0];
          setToolPosition([parentData.x - (parentData.radius + 5), parentData.y]);
          const queryMatch = query.matches.filter(f=> f.entry.activity_uid === parentData.activity_uid);
          const hovData = { fileData: d, hopDataArray: null, queryMatch: queryMatch };
          setHoverData(hovData);
          d3.select('#tooltip').style('opacity', 1);

        }else{

          const hopData = hopArray.filter(
            (f) => f.artifactUid === d.artifact_uid
          );
          const parentData = d3.select(event.target.parentNode).data()[0];
          setToolPosition([parentData.x - (parentData.radius + 5), parentData.y]);
          const hovData = { fileData: d, hopDataArray: hopData, queryMatch: null };
          setHoverData(hovData);
          d3.select('#tooltip').style('opacity', 1);

        }
      
        const entry = projectData.entries.filter((en) => {
          const temp = en.files.filter((e) => e.title === d.title);
          return temp.length > 0;
        })[0];

        const labelGTest = wrap.select('.timeline-wrap').select('#label-group');
        const labelG = labelGTest.empty()
          ? svg.select('.timeline-wrap').append('g').attr('id', 'label-group')
          : labelGTest;
        labelG.attr(
          'transform',
          `translate(0, ${yScale(new Date(entry.date))})`
        );

        const parent = d3.select(event.target.parentNode);

        const rect = labelG.append('rect');

        rect
          .attr('width', 50)
          .attr('height', 15)
          .attr('fill', '#fff')
          .attr('fill-opacity', 0.9);

        rect.attr('x', -50).attr('y', -12);

        labelG
          .append('text')
          .text(
            new Date(entry.date).toLocaleDateString('en-us', {
              weekday: 'long',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          )
          .style('font-size', 9)
          .style('text-anchor', 'end')
          .style('font-weight', 600);

        underWrap
          .append('line')
          .attr('id', 'date_line')
          .attr('y1', parent.data()[0].y)
          .attr('x2', 0 - 70)
          .attr('y2', forced.yScale(new Date(entry.date)))
          .attr('x1', parent.data()[0].x)
          .attr('stroke', 'black')
          .attr('stroke-width', 1);
      })
      .on('mouseout', () => {
        d3.select('#tooltip').style('opacity', 0);
        d3.select('#date_line').remove();
        d3.select('#label-group').remove();
      })
      .on('click', (event: any, d: any) => {
        const parentData = d3.select(event.target.parentNode).data()[0];
        const selectedArtIndex = parentData.files
          .map((f) => f.artifact_uid)
          .indexOf(d.artifact_uid);
      
        dispatch({
          type: 'SELECTED_ARTIFACT',
          activity: parentData,
          artifactIndex: selectedArtIndex,
          hopArray: [
            ...hopArray,
            {
              activity: parentData,
              artifactUid:
                parentData.files[selectedArtifact.artifactIndex].artifact_uid,
              hopReason: 'revisit hopped artifact',
            },
          ],
        });
      });

    // }
  }, [filteredActivities, filterType, selectedArtifact]);

  return (
    <div style={{ width: widthSvg, paddingTop: '10px' }}>
      <svg
        ref={svgRef}
        width={svgWidth}
        height={height}
        style={{ display: 'inline' }}
      />
      <ToolTip hoverData={hoverData} position={toolPosition} />
    </div>
  );
};

export default DetailBubble;
