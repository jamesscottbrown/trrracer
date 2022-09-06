import { useProjectState } from '../ProjectContext';
import React, { useRef, useState } from 'react';
import * as d3 from 'd3';

const smalltalk = require('smalltalk');

/*
const BrushDefiningEvent = (props) => {
  const brushedEvent = function(event: any) {
    if (!event.selection && !event.sourceEvent) return;
    let s1 = event.selection
      ? event.selection
      : [1, 2].fill(event.sourceEvent.offsetX);

    if (event.sourceEvent && event.type === 'end') {
      s1 = event.selection;
      d3.select(this).transition().call(event.target.move, s1);

      const start = yScale.invert(s1[0]).toLocaleDateString('en-us', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      const end = yScale.invert(s1[1]).toLocaleDateString('en-us', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      smalltalk
        .prompt('Adding an Event', `from ${start} to ${end}`, 'Visit to Zanadu')
        .then((value: string) => {
          const newEventArray = [
            ...eventArray,
            {
              event: value,
              time: [yScale.invert(s1[0]), yScale.invert(s1[1])]
            }
          ];
          dispatch({ type: 'ADD_EVENT', eventArray: newEventArray });
          setDefineEvent(false);
        })
        .catch(() => {
          console.log('cancel');
        });
      //
    }

    // move handlers
    d3.selectAll('g.handles').attr('transform', (d) => {
      const y = d === 'handle--o' ? s1[0] : s1[1];
      return `translate(0, ${y})`;
    });

    // update labels
    d3.selectAll('g.handles')
      .selectAll('text')
      .attr('dy', 6)
      .text((d) => {
        const val = d === 'handle--o' ? s1[0] : s1[1];

        return yScale.invert(val).toLocaleDateString('en-us', {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      });
  };

  const bY = d3
    .brushY()
    .handleSize(8)
    .extent([
      [0, 0],
      [40, windowDimension.height - 200 - margin]
    ])
    .on('start brush end', brushedEvent);

  const bGroup = d3.select(brushRef.current);

  bGroup.call(bY);
};
*/

const BrushFiltering = (props) => {
  const { usedEntries, yScale, selectedActivityURL } = props;
  const [{ filterDates, projectData }, dispatch] = useProjectState();

  const filteredActivitiesExtentTest = d3.extent(
    usedEntries.map((m: any) => new Date(m.date))
  );

  const filteredActivitiesExtent = filteredActivitiesExtentTest[0]
    ? filteredActivitiesExtentTest
    : d3.extent(projectData.entries.map((m: any) => new Date(m.date)));

  const startDate = (filterDates[0] || filteredActivitiesExtent[0]);
  const startDateString = startDate.toLocaleDateString('en-us', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const endDate = (filterDates[1] || filteredActivitiesExtent[1]);
  const endDateString = endDate.toLocaleDateString('en-us', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });


  const resetTime = () => {
    dispatch({
      type: 'UPDATE_FILTER_DATES',
      filterDates: [null, null]
    });
  };

  // prettier-ignore
  return <g fill='none' pointerEvents='all' >

    {!selectedActivityURL && <text transform="translate(-35, -30)" style={{fontSize: '12px', cursor: 'pointer', fill: 'black'}} onClick={resetTime}>Reset Time</text>}

    <rect className='overlay' pointerEvents='all' cursor='crosshair' x='0' y='0' width='20' height='1557.2' />
    <rect className='selection' fill='#777' fillOpacity='0.3' stroke='#fff' shapeRendering='crispEdges'
          x='0' y={yScale(startDate)} width='20' height={yScale(endDate) - yScale(startDate)} opacity='0.2' />
    <rect className='handle handle--n' x='-4' y='-4' width='28' height='8' />
    <rect className='handle handle--s' x='-4' y='1553.2' width='28' height='8' />
    <g className='handles handle--o' fill='black' opacity='1'
       transform={`translate(0, ${yScale(startDate)})`}>
      <rect className='handle-rect' fill='#fff' width='70' height='13' y='-13' x='-50'></rect>
      <text textAnchor='middle' dy='-2' style={{ fontSize: '11px', pointerEvents: 'none', userSelect: 'none' }}>{startDateString}
      </text>
      <path className='triangle handle--o'
            d='M0,-6.204032394013997L5.372849659117709,3.1020161970069986L-5.372849659117709,3.1020161970069986Z'
            transform='translate(20, -17) rotate(0)'></path>
      <line className='line handle--o' x1='0' y1='0' x2='20' y2='0' stroke='black' />
    </g>
    <g className='handles handle--e' fill='black' opacity='1'
       transform={`translate(0, ${yScale(endDate)})`} y='0' x='-50' >
      <text textAnchor='middle' dy='10' style={{ fontSize: '11px', pointerEvents: 'none', userSelect: 'none' }}>{endDateString}
      </text>
      <path className='triangle handle--e'
            d='M0,-6.204032394013997L5.372849659117709,3.1020161970069986L-5.372849659117709,3.1020161970069986Z'
            transform='translate(20, 17) rotate(180)' />
      <line className='line handle--e' x1='0' y1='0' x2='20' y2='0' stroke='black' />
    </g>
  </g>;
};

export const TimeLineBrush = (props) => {
  // TODO: move

  const {
    windowDimension,
    margin,
    yScale,
    eventArray,
    setDefineEvent,
    defineEvent,
    usedEntries,
    selectedActivityURL
  } = props;

  const [, dispatch] = useProjectState();
  const brushRef = useRef(null);

  if (defineEvent) {
    return null;
//    return <BrushDefiningEvent />;
  } else {
    return <BrushFiltering usedEntries={usedEntries} yScale={yScale} selectedActivityURL={selectedActivityURL} />;
  }

  return (
    <rect
      width={40}
      height={windowDimension.height - 200 - margin}
      fillOpacity={0}
      id='bGroup'
      ref={brushRef}
    />
  );
};
