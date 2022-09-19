import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, FormControl, FormLabel, Switch } from '@chakra-ui/react';
import * as d3co from 'd3-color';

import ForceMagic from '../ForceMagic';
import { dataStructureForTimeline } from './VerticalAxis';
import { calcCircles } from '../PackMagic';
import { getIndexOfMonth } from '../timeHelperFunctions';
import { useProjectState } from './ProjectContext';
import { ThreadPath } from './bubbleVis/ThreadPath';
import { EventRect } from './bubbleVis/EventRect';
import { RTtooltip } from './bubbleVis/RTtooltip';
import { DateLabel } from './bubbleVis/DateLabel';
import { HighlightedActivity } from './bubbleVis/HighlightedActivity';
import { HiddenActivity } from './bubbleVis/HiddenActivity';
import { TimeLine } from './bubbleVis/TimeLine';
import { TimeLineBrush } from './bubbleVis/TimeLineBrush';
import { ToolTip } from './bubbleVis/ToolTip';

interface BubbleProps {
 
  flexAmount: number;
  setDefineEvent: (value: ((prevState: boolean) => boolean) | boolean) => void;
  defineEvent: boolean;
  bubbleDivWidth: number;
  setBubbleDivWidth: (gb: any) => any;
  windowDimension: any;
}

const BubbleVis = (props: BubbleProps) => {
  const {
    flexAmount,
    setDefineEvent,
    windowDimension,
    defineEvent,
    bubbleDivWidth,
    setBubbleDivWidth
  } = props;

  const [
    {
      projectData,
      filterType,
      filterRT,
      filterTags,
      researchThreads,
      isReadOnly,
      selectedActivityURL,
      filteredActivities,
      viewParams
    },
    dispatch
  ] = useProjectState();

  const usedEntries = useMemo(() => {
    return selectedActivityURL
      ? projectData.entries.filter(
        (f) => f.activity_uid === selectedActivityURL
      )
      : filteredActivities;
  }, [
    selectedActivityURL,
    projectData.entries.length,
    filteredActivities.length
  ]);

  const { eventArray } = projectData;

  const [translateY, setTranslateY] = useState(55);
  const [hoverData, setHoverData] = useState(projectData.entries[0]);
  const [toolPosition, setToolPosition] = useState([0, 0]);

  const grayStart = d3co.hsl('#d3d3d3');
  const grayLighter = { h: grayStart.h, s: 0.3, l: grayStart.l, opacity: 1 };

  const [onActivityColor, setOnActivityColor] = useState(grayLighter);
  const [onArtifactColor, setOnArtifactColor] = useState(grayStart);

  const [mousedOverActivity, setMousedOverActivity] = useState(false);

  const [mouseDownTime, setMouseDownTime] = useState(null);

  const width = 350;
  const translateXforWraps = 90;
  const [height, setHeight] = useState(windowDimension.height - 200);
  const svgRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    setHeight(windowDimension.height - 200);

    // if (groupBy) {
    //   setBubbleDivWidth(windowDimension.width);
    // }
  }, [windowDimension]);

  let packedCircData = useMemo(() => calcCircles([...projectData.entries]), [
    projectData.entries.length,
    projectData.entries.flatMap((f) => f.files).length
  ]);

  const forced = useMemo(() => {
    return new ForceMagic(packedCircData, width, windowDimension.height - 200);
  }, [packedCircData, windowDimension]);

  const highlightedNodes = useMemo(() => {
    const ids = usedEntries.map((m) => m.activity_uid);
    return forced.nodes.filter((f) => ids.includes(f.activity_uid));
  }, [usedEntries.length]);

  const notNodes = useMemo(() => {
    const ids = usedEntries.map((m) => m.activity_uid);
    return forced.nodes.filter((f) => ids.indexOf(f.activity_uid) === -1);
  }, [usedEntries.length]);

  const { yScale, margin } = forced;

  useEffect(() => {
    if (filterRT) {
      const newColor = researchThreads?.research_threads.filter(
        (f) => f.title === filterRT.title
      )[0].color;
      const hslColor = d3co.hsl(newColor);
      setOnActivityColor(hslColor.copy({ s: 0.4, l: 0.9 }));
      setOnArtifactColor(hslColor);
    } else {
      setOnActivityColor(d3co.hsl('#d3d3d3'));
      setOnArtifactColor(d3co.hsl('gray'));
    }
  }, [filterRT, highlightedNodes]);

  useEffect(() => {
    // TODO: refactor out of effect
    if (selectedActivityURL) {
      setTranslateY(margin / 2);
    } else {
      setTranslateY(40);
    }

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

    // TODO: move
    wrapRef.current && setBubbleDivWidth(wrapRef.current - 250);

  }, [
    selectedActivityURL,
    usedEntries,
    eventArray,
    filterType,
    defineEvent,
    viewParams,
    windowDimension
  ]);

  return (
    <div
      style={{
        flex: flexAmount,
        paddingTop: '30px',
        paddingLeft: 0,
        width: 500,
        overflowX: 'auto'
      }}
    >
      <div style={{ width: '100%' }}>
        {!isReadOnly && (
          <Button
            size='sm'
            style={{ fontSize: '12px' }}
            onClick={() => {
              defineEvent ? setDefineEvent(false) : setDefineEvent(true);
            }}
          >
            Add events to timeline
          </Button>
        )}
      </div>

      <svg
        ref={svgRef}
        width={600}
        height={height}
        style={{ display: 'inline', cursor: 'crosshair' }}
        onMouseDown={(ev) => setMouseDownTime(yScale.invert(ev.clientY - svgRef.current.getBoundingClientRect().y - translateY))}
        onMouseUp={(ev) => {
          if (mouseDownTime){
            const mouseUpTime = yScale.invert(ev.clientY - svgRef.current.getBoundingClientRect().y - translateY);

            const millisecondsPerDay = 24 * 60 * 60 * 1000;

            if (Math.abs(mouseUpTime - mouseDownTime) < (0.2 * millisecondsPerDay) ){
               dispatch({
                type: 'UPDATE_FILTER_DATES',
                filterDates: [null, null]
              });
            } else if (mouseUpTime > mouseDownTime) {
              dispatch({
                type: 'UPDATE_FILTER_DATES',
                filterDates: [mouseDownTime, mouseUpTime]
              });

            } else {
              dispatch({
                type: 'UPDATE_FILTER_DATES',
                filterDates: [mouseUpTime, mouseDownTime]
              });

            }
            setMouseDownTime(null);
          }
        }}
      >
        <g
          className='under-wrap'
          transform={`translate(${translateXforWraps}, ${translateY})`}
        >
          {notNodes.map(event => <HiddenActivity event={event} key={event.activity_uid} />)}
        </g>
        <g
          className='path-wrap'
          transform={`translate(${translateXforWraps}, ${translateY})`}
        >
          <ThreadPath filterRT={filterRT} researchThreads={researchThreads} highlightedNodes={highlightedNodes} />
        </g>
        <g
          className='wrap'
          transform={`translate(${translateXforWraps}, ${translateY})`}
          ref={wrapRef}
        >
          {eventArray.map((event, i) => (
            <React.Fragment key={`event-${i}`}>
              <EventRect event={event} yScale={yScale} />
            </React.Fragment>
          ))}
          {highlightedNodes.map((event, i)=> (
            <React.Fragment key={`highlighted-${i}`}>
              <HighlightedActivity 
                event={event} 
                onActivityColor={onActivityColor}
                key={event.activity_uid} filterRT={filterRT}
                filterType={filterType}
                filterTags={filterTags}
                selectedActivityURL={selectedActivityURL}
                mousedOverActivity={mousedOverActivity}
                setMousedOverActivity={setMousedOverActivity}
                setToolPosition={setToolPosition}
                setHoverData={setHoverData}
              />
          </React.Fragment>
          )
          )}

          {hoverData &&
            <line id='date_line' y1={hoverData.y} y2={forced.yScale(new Date(hoverData.date))} x1={+hoverData.x}
                  x2={0 - 30} stroke='black' strokeWidth='1' />}

        </g>

        {/* timeline-wrap is referred to as wrapAxisGroup in the code */}
        <g
          className='timeline-wrap'
          transform={`translate(${translateXforWraps}, ${translateY})`}
        >
          <TimeLine yScale={yScale} />
          <TimeLineBrush
            windowDimension={windowDimension}
            margin={margin}
            yScale={yScale}
            eventArray={eventArray}
            setDefineEvent={setDefineEvent}
            defineEvent={defineEvent}
            selectedActivityURL={selectedActivityURL}
            usedEntries={usedEntries}
          />
          <DateLabel hoverData={hoverData} forced={forced} />

        </g>
      </svg>
      {filterRT ? (
        <RTtooltip
          activityData={hoverData}
          position={toolPosition}
          filterRT={filterRT}
          researchThreads={researchThreads}
          mousedOverActivity={mousedOverActivity}
        />
      ) : (
        <ToolTip activityData={hoverData} position={toolPosition} mousedOverActivity={mousedOverActivity} />
      )}
    </div>
  );
};

export default BubbleVis;
