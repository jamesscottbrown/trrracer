import * as d3 from 'd3';
import * as d3co from 'd3-color';
import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, FormControl, FormLabel, Switch } from '@chakra-ui/react';

import ForceMagic from '../ForceMagic';
import Bubbles from '../Bubbles';
import { dataStructureForTimeline } from './VerticalAxis';
import { calcCircles } from '../PackMagic';
import { getIndexOfMonth } from '../timeHelperFunctions';
import { ToolIcon } from './Project';
import { useProjectState } from './ProjectContext';
import groupBubbles from './GroupBubbleVis';

const smalltalk = require('smalltalk');

interface BubbleProps {
  setGroupBy: (gb: any) => void;
  groupBy: any;
  flexAmount: number;
  setDefineEvent: (value: ((prevState: boolean) => boolean) | boolean) => void;
  defineEvent: boolean;
  bubbleDivWidth: number;
  setBubbleDivWidth: (gb: any) => any;
}

const RTtooltip = (toolProp: any) => {
  const { activityData, position, researchThreads, filterRT } = toolProp;

  const whatData = () => {
    if (filterRT) {
      return researchThreads.research_threads.filter(
        (f) => f.title === filterRT.title
      )[0];
    }
    if (activityData.rt_id) {
      return researchThreads.research_threads.filter(
        (f) => f.rt_id === activityData.rt_id
      )[0];
    }
    return researchThreads.research_threads[0];
  };
  const threadData = whatData();

  // let threadData = researchThreads.research_threads.filter(f=> f.title === compare)[0];
  const evidence = threadData.evidence.filter(
    (e) => e.activityTitle === activityData.title
  );

  return (
    <div
      id='tooltip'
      style={{
        position: 'absolute',
        left: position[0],
        top: -30, //evidence.length > 0 ? position[1] - 150 : position[1] - 50,
        textAlign: 'center',
        minWidth: 100,
        maxWidth: 450,
        minHeight: 50,
        padding: 10,
        backgroundColor: '#fff',
        border: '2px solid gray',
        borderRadius: 10,
        pointerEvents: 'none',
        zIndex: 6000,
      }}
    >
      <span
        style={{
          font: '15px sans-serif',
          fontWeight: 600,
        }}
      >
        {activityData.title}
      </span>
      {evidence.map((e: any, i: number) => (
        <div
          key={`artifact-evidence-${i}`}
          style={{ marginTop: 10, fontSize: 12 }}
        >
          <div
            style={{ fontWeight: 800 }}
          >{`Included artifact: ${e.artifactTitle}`}</div>
          {e.type === 'fragment' && (
            <span
              style={{ backgroundColor: '#fdfd96' }}
            >{`"${e.anchors[0].frag_type}"`}</span>
          )}
          <div style={{ marginTop: 10, fontSize: 11 }}>
            <span style={{ fontWeight: 800 }}>Rationale: </span>
            {e.rationale}
          </div>
        </div>
      ))}
    </div>
  );
};

const ToolTip = (toolProp: any) => {
  const { activityData, position } = toolProp;

  return (
    <div
      id='tooltip'
      style={{
        position: 'absolute',
        left: position[0],
        top: position[1] - 50,
        textAlign: 'center',
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
      <span
        style={{
          font: '15px sans-serif',
          fontWeight: 600,
        }}
      >
        {activityData.title}
      </span>
      <div>
        {activityData.files.map((fi: any, i: any) => (
          <div
            key={`act-data-${i}`}
            style={{ display: 'inline-block', margin: 5 }}
          >
            <ToolIcon artifactType={fi.artifactType} size={28} />
            <span style={{ fontSize: 10 }}>{fi.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const renderAxis = (wrap: any, yScale: any, translateY: any) => {
  wrap.selectAll('*').remove();
  wrap.attr('transform', `translate(110, ${translateY})`);

  const yAxis = d3.axisLeft(yScale).ticks(40).tickSize(10);

  const yAxisGroup = wrap
    .append('g')
    .attr('transform', `translate(10, 0)`)
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
};

const BubbleVis = (props: BubbleProps) => {
  const {
    groupBy,
    setGroupBy,
    flexAmount,
    setDefineEvent,
    defineEvent,
    bubbleDivWidth,
    setBubbleDivWidth,
  } = props;

  const [
    {
      projectData,
      filterType,
      filterRT,
      filterTags,
      selectedThread,
      researchThreads,
      isReadOnly,
      selectedActivityURL,
      filteredActivities,
      viewParams,
    },
    dispatch,
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
    filteredActivities.length,
  ]);

  const { eventArray } = projectData;
  const [newHeight, setNewHeight] = useState(1000);
  const [svgWidth, setSvgWidth] = useState(500);
  const [translateY, setTranslateY] = useState(55);
  const [hoverData, setHoverData] = useState(projectData.entries[0]);
  const [toolPosition, setToolPosition] = useState([0, 0]);

  const grayStart = d3co.hsl('#d3d3d3');
  const grayLighter = { h: grayStart.h, s: 0.3, l: grayStart.l, opacity: 1 };

  const [onActivityColor, setOnActivityColor] = useState(grayLighter);
  const [onArtifactColor, setOnArtifactColor] = useState(grayStart);

  const width = 300;
  const translateXforWraps = 90;
  const height = newHeight; // +newHeight.split('px')[0];
  const svgRef = React.useRef(null);

  d3.select('#tooltip').style('opacity', 0);

  const packedCircData = useMemo(() => calcCircles([...projectData.entries]), [
    projectData.entries.length,
    projectData.entries.flatMap((f) => f.files).length,
  ]);
  const forced = useMemo(() => new ForceMagic(packedCircData, width, height), [
    packedCircData,
    width,
    height,
  ]);

  const highlightedNodes = useMemo(() => {
    const ids = usedEntries.map((m) => m.activity_uid);
    return forced.nodes.filter((f) => ids.includes(f.activity_uid));
  }, [usedEntries.length]);

  const notNodes = useMemo(() => {
    const ids = usedEntries.map((m) => m.activity_uid);
    return forced.nodes.filter((f) => ids.indexOf(f.activity_uid) === -1);
  }, [usedEntries.length]);

  useEffect(() => {
    if (filterRT) {
      const newColor = researchThreads?.research_threads.filter(
        (f) => f.title === filterRT.title
      )[0].color;
      const hslColor = d3co.hsl(newColor);

      console.log('HSL color', hslColor);

      setOnActivityColor(hslColor.copy({ s: 0.4, l: 0.9 }));
      setOnArtifactColor(hslColor);

      console.log(onArtifactColor);
    } else {
      setOnActivityColor(d3co.hsl('#d3d3d3'));
      setOnArtifactColor(d3co.hsl('gray'));
    }
  }, [filterRT, highlightedNodes]);

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
    if (selectedActivityURL) {
      setTranslateY(margin / 2);
    } else {
      setTranslateY(40);
    }

    const marginTime = height * 0.25;
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

    const filteredActivitiesExtent = d3.extent(
      usedEntries.map((m: any) => new Date(m.date))
    );

    const checkGroup = svg.select('g.timeline-wrap');
    const wrapAxisGroup = checkGroup.empty()
      ? svg.append('g').attr('class', 'timeline-wrap')
      : checkGroup;
    renderAxis(wrapAxisGroup, yScale, translateY);

    if (!defineEvent) {
      const triangle = d3.symbol().size(50).type(d3.symbolTriangle);

      const brushed = function (event: any) {
        if (!event.selection && !event.sourceEvent) return;
        const s0 = event.selection
          ? event.selection
          : [1, 2].fill(event.sourceEvent.offsetX);

        let s1 = s0;

        if (event.sourceEvent && event.type === 'end') {
          s1 = event.selection;
          d3.select(this).transition().call(event.target.move, s1);

          dispatch({
            type: 'UPDATE_FILTER_DATES',
            filterDates: [
              yScale.invert(event.selection[0]),
              yScale.invert(event.selection[1]),
            ],
          });
        }

        // move handlers
        d3.selectAll('g.handles').attr('transform', (d: any) => {
          const y = d === 'handle--o' ? s1[0] : s1[1];
          return `translate(0, ${y})`;
        });

        d3.selectAll('g.handles').selectAll('rect.handle-rect');

        // update labels
        d3.selectAll('g.handles')
          .selectAll('text')
          .attr('dy', (d) => (d === 'handle--o' ? -2 : 10))
          .text((d: any) => {
            const year =
              d === 'handle--o'
                ? yScale.invert(s1[0]).toLocaleDateString('en-us', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : yScale.invert(s1[1]).toLocaleDateString('en-us', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

            return year;
          });
      };

      const bY = d3
        .brushY()
        .handleSize(8)
        .extent([
          [0, 0],
          [20, height - marginTime],
        ])
        .on('start brush end', brushed);

      const gBrush = wrapAxisGroup
        .append('g')
        .call(bY)
        .call(bY.move, [
          yScale(filteredActivitiesExtent[0]),
          yScale(filteredActivitiesExtent[1]),
        ]);

      gBrush.select('.selection').attr('opacity', 0.2);

      // Custom handlers
      // Handle group
      const gHandles = gBrush
        .selectAll('g.handles')
        .data(['handle--o', 'handle--e'])
        .join('g')
        .attr('class', (d) => `handles ${d}`)
        .attr('fill', 'black')
        .attr('opacity', 1)
        .attr('transform', (d) => {
          const y =
            d === 'handle--o'
              ? yScale(filteredActivitiesExtent[0])
              : yScale(filteredActivitiesExtent[1]);
          return `translate(0, ${y})`;
        });

      gHandles
        .selectAll('rect.handle-rect')
        .data((d) => [d])
        .join('rect')
        .classed('handle-rect', true)
        .attr('fill', '#fff')
        .attr('width', 70)
        .attr('height', 13)
        .attr('y', (d) => (d === 'handle--o' ? -13 : 0))
        .attr('x', -50);

      // Label
      gHandles
        .selectAll('text')
        .data((d) => [d])
        .join('text')
        .attr('text-anchor', 'middle')
        .attr('dy', (d) => (d === 'handle--o' ? -2 : 10))
        .text((d) => {
          if (d === 'handle--o') {
            return filteredActivitiesExtent[0].toLocaleDateString('en-us', {
              weekday: 'long',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
          }
          return filteredActivitiesExtent[1].toLocaleDateString('en-us', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        })
        .style('font-size', '11px')
        .style('pointer-events', 'none');

      gHandles
        .selectAll('.triangle')
        .data((d) => [d])
        .join('path')
        .attr('class', (d) => `triangle ${d}`)
        .attr('d', triangle)
        .attr('transform', (d) => {
          const y = d === 'handle--o' ? -17 : 17;
          const rot = d === 'handle--o' ? 0 : 180;
          return `translate(20, ${y}) rotate(${rot})`;
        });

      gHandles
        .selectAll('.line')
        .data((d: any) => [d])
        .join('line')
        .attr('class', (d: any) => `line ${d}`)
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 20)
        .attr('y2', 0)
        .attr('stroke', 'black');

      if (!selectedActivityURL) {
        const resetTest = svg.select('text.reset');

        const reset = resetTest.empty()
          ? wrapAxisGroup.append('text').classed('reset', true)
          : resetTest;

        reset
          .text('Reset Time')
          .attr('transform', 'translate(-25, -30)')
          .style('font-size', '12px')
          .style('cursor', 'pointer')
          .on('click', () => {
            dispatch({
              type: 'UPDATE_FILTER_DATES',
              filterDates: [null, null],
            });
          });
      }
    }

    if (defineEvent) {
      let text;
      const bGroup = wrapAxisGroup.append('g');

      const bRect = bGroup
        .append('rect')
        .attr('width', 40)
        .attr('height', height - marginTime)
        .attr('fill-opacity', 0);

      const brushedEvent = function (event: any) {
        if (!event.selection && !event.sourceEvent) return;
        const s0 = event.selection
          ? event.selection
          : [1, 2].fill(event.sourceEvent.offsetX);

        let s1 = s0;

        if (event.sourceEvent && event.type === 'end') {
          s1 = event.selection;
          d3.select(this).transition().call(event.target.move, s1);

          const start = yScale.invert(s1[0]).toLocaleDateString('en-us', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });

          const end = yScale.invert(s1[1]).toLocaleDateString('en-us', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });

          smalltalk
            .prompt(
              'Adding an Event',
              `from ${start} to ${end}`,
              'Visit to Zanadu'
            )
            .then((value: string) => {
              const newEventArray = [
                ...eventArray,
                {
                  event: value,
                  time: [yScale.invert(s1[0]), yScale.invert(s1[1])],
                },
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
          const y = d == 'handle--o' ? s1[0] : s1[1];
          return `translate(0, ${y})`;
        });

        // update labels
        d3.selectAll('g.handles')
          .selectAll('text')
          .attr('dy', 6)
          .text((d) => {
            const year =
              d == 'handle--o'
                ? yScale.invert(s1[0]).toLocaleDateString('en-us', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : yScale.invert(s1[1]).toLocaleDateString('en-us', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

            return year;
          });
      };

      const bY = d3
        .brushY()
        .handleSize(8)
        .extent([
          [0, 0],
          [40, height - marginTime],
        ])
        .on('start brush end', brushedEvent);

      bGroup.call(bY);

      bGroup.on('mousemove', (event) => {
        const textTest = svg.select('text.hover-text');
        text = textTest.empty()
          ? svg.append('text').classed('hover-text', true)
          : textTest;
        const position = event.offsetY - 120;
        text.text(yScale.invert(position));
        text.attr('y', position - 20);
        text.attr('x', -30);
        text.style('font-size', 11);
        text.style('font-weight', 800);
      });
      bGroup.on('mouseleave', () => {
        const textTest = svg.select('text.hover-text');
        textTest.remove();
      });
    }
    /*
     */
    const eventRectGroups = wrap
      .selectAll('g.event')
      .data(eventArray)
      .join('g')
      .classed('event', true);

    if (eventArray.length > 0) {
      eventRectGroups.attr(
        'transform',
        (d) => `translate(-70, ${yScale(new Date(d.time[0]))})`
      );
      const eventRects = eventRectGroups
        .selectAll('rect')
        .data((d) => [d])
        .join('rect');

      eventRects.attr(
        'height',
        (d: any) => yScale(new Date(d.time[1])) - yScale(new Date(d.time[0]))
      );

      eventRects.attr('width', 1000);
      eventRects.style('fill-opacity', 0.05);

      if (!groupBy) {
        eventRectGroups
          .append('line')
          .attr('x1', 0)
          .attr('x2', 400)
          .attr('y1', 0)
          .attr('y2', 0)
          .attr('stroke', 'gray')
          .attr('stroke-width', 1);

        const eventText = eventRectGroups
          .selectAll('text')
          .data((d) => [d])
          .join('text')
          .text((d) => d.event);

        eventText.attr('x', 405);
        eventText.attr('y', 4);
        eventText.style('font-size', 10);
        eventText.style('fill', 'gray');
      }
    }

    if (groupBy) {
      groupBubbles(
        groupBy,
        wrap,
        forced,
        selectedActivityURL,
        usedEntries,
        setToolPosition,
        setHoverData,
        researchThreads
      );
    } else {
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
        .attr('fill', d3co.hsl('#d3d3d3').copy({ l: 0.94 })) //.attr('fill-opacity', .3)
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
        .attr('fill', onActivityColor) //.attr('fill-opacity', .3)
        .attr('stroke', '#d3d3d3')
        .attr('stroke-width', 0.4);

      const artifactCircles = highlightedActivityGroups
        .selectAll('circle.artifact')
        .data((d) => d.files)
        .join('circle')
        .classed('artifact', true);
      artifactCircles
        .attr('r', (d) => 3)
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);

      highlightedActivityGroups
        .select('.all-activities')
        .on('mouseover', (event, d) => {
          if (filterRT) {
            d3.select(event.target)
              .attr('stroke', 'gray')
              .attr('stroke-width', 2);
          } else if (filterType || filterTags.length > 0) {
            d3.select(event.target)
              .attr('stroke', 'gray')
              .attr('stroke-width', 1);
          } else if (selectedActivityURL !== null) {
            highlightedActivityGroups
              .select('.all-activities')
              .attr('fill-opacity', 1);
            highlightedActivityGroups
              .select('.all-activities')
              .attr('stroke-width', 1)
              .attr('stroke', 'red');
            const highlightedCircles = highlightedActivityGroups.selectAll(
              'circle.artifact'
            );
            highlightedCircles.attr('fill', 'white');
          } else {
            d3.select(event.target).attr('fill', 'gray');
          }
        })
        .on('mouseout', (event) => {
          if (filterRT) {
            d3.select(event.target).attr('stroke-width', 0);
          } else if (filterType || filterTags.length > 0) {
            d3.select(event.target)
              .attr('fill', 'gray')
              .attr('fill-opacity', 0.5);
            d3.select(event.target)
              .attr('stroke', 'gray')
              .attr('stroke-width', 0);
          } else if (selectedActivityURL !== null) {
            highlightedActivityGroups
              .select('.all-activities')
              .attr('fill-opacity', 0.5);
            const highlightedCircles = highlightedActivityGroups.selectAll(
              'circle.artifact'
            );
            highlightedCircles.attr('fill', 'gray');
          } else {
            d3.select(event.target)
              .attr('fill', '#d3d3d3')
              .attr('stroke', '#d3d3d3')
              .attr('stroke-width', 0.5);
          }
        });

      // THIS IS WHERE I STOPPED COPYING OVER!! EVERYTHING BELOW IS NOT COPIED
      if (filterType) {
        highlightedActivityGroups
          .select('.all-activities')
          .attr('fill', 'gray')
          .attr('fill-opacity', 0.5);
        highlightedActivityGroups
          .select('.all-activities')
          .attr('stroke-width', 0);
        const highlightedCircles = highlightedActivityGroups
          .selectAll('circle.artifact')
          .filter((f) => f.artifactType === filterType);
        highlightedCircles.attr('fill', 'gray').attr('fill-opacity', 1);
        const highlightedCirclesNOT = highlightedActivityGroups
          .selectAll('circle.artifact')
          .filter((f) => f.artifactType != filterType);
        highlightedCirclesNOT.attr('fill', '#fff').attr('fill-opacity', 0.7);
      } else if (filterTags.length > 0) {
        highlightedActivityGroups
          .select('.all-activities')
          .attr('fill', 'gray')
          .attr('fill-opacity', 0.5);
        highlightedActivityGroups
          .select('.all-activities')
          .attr('stroke-width', 0);
        const highlightedCircles = highlightedActivityGroups.selectAll(
          'circle.artifact'
        );
        highlightedCircles.attr('fill', 'gray');
      } else if (selectedActivityURL !== null) {
        highlightedActivityGroups
          .select('.all-activities')
          .attr('fill', 'red')
          .attr('fill-opacity', 0.5);
        highlightedActivityGroups
          .select('.all-activities')
          .attr('stroke-width', 1)
          .attr('stroke', 'red');
        const highlightedCircles = highlightedActivityGroups.selectAll(
          'circle.artifact'
        );
        highlightedCircles.attr('fill', 'gray');
      } else {
        const highlightedCircles = highlightedActivityGroups.selectAll(
          'circle.artifact'
        );
        highlightedCircles.attr('fill', 'gray');
      }

      if (
        filterRT &&
        researchThreads?.research_threads[selectedThread].evidence.length > 0
      ) {
        let linkDataBefore = [];
        let linkDataAfter = [];

        researchThreads?.research_threads[selectedThread].evidence.forEach(
          (f) => {
            let temp = highlightedActivityGroups.filter(
              (ha) => ha.title === f.activityTitle
            );

            const chosenActivityData = temp.select('.all-activities').data()[0];

            if (f.type === 'activity') {
              temp.select('.all-activities').attr('fill', onActivityColor);

              temp.selectAll('circle.artifact').attr('fill', '#d3d3d3');
            } else if (f.type === 'artifact' || f.type === 'fragment') {
              temp
                .selectAll('circle.artifact')
                .filter((art) => art.title === f.artifactTitle)
                .attr('fill', onArtifactColor);
              temp
                .select('circle.all-activities')
                .attr('fill', onActivityColor);
            }

            const divideDate = new Date(
              researchThreads?.research_threads[selectedThread].actions.filter(
                (f) => f.action === 'created'
              )[0].when
            );

            if (new Date(chosenActivityData.date) < divideDate) {
              linkDataBefore.push({
                coord: [chosenActivityData.x, chosenActivityData.y],
                date: chosenActivityData.date,
              });
            } else {
              linkDataAfter.push({
                coord: [chosenActivityData.x, chosenActivityData.y],
                date: chosenActivityData.date,
              });
            }
          }
        );

        const lineGenerator = d3.line();

        if (linkDataAfter.length > 0) {
          linkDataAfter = linkDataAfter.sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          );

          const pathStringSolid = lineGenerator(
            linkDataAfter.map((m) => m.coord)
          );

          midWrap
            .append('path')
            .attr('d', pathStringSolid)
            .attr('fill', 'none')
            .attr(
              'stroke',
              researchThreads?.research_threads[selectedThread].color
            )
            .attr('stroke-width', 2);
        }
        if (linkDataBefore.length > 0) {
          linkDataBefore = linkDataBefore.sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          );
          if (linkDataAfter.length > 0) linkDataBefore.push(linkDataAfter[0]);

          const pathStringDash = lineGenerator(
            linkDataBefore.map((m) => m.coord)
          );

          midWrap
            .append('path')
            .attr('d', pathStringDash)
            .attr('fill', 'none')
            .attr(
              'stroke',
              researchThreads?.research_threads[selectedThread].color
            )
            .attr('stroke-width', 2)
            .style('stroke-dasharray', '5,5');
        }
      }

      highlightedActivityGroups
        .on('mouseover', (event, d) => {
          setToolPosition([d.x, d.y]);
          setHoverData(d);
          d3.select('#tooltip').style('opacity', 1);

          const labelGTest = wrap.select('.timeline-wrap').select('#label-group');
          const labelG = labelGTest.empty()
            ? svg.select('.timeline-wrap').append('g').attr('id', 'label-group')
            : labelGTest;
          labelG.attr(
            'transform',
            `translate(0, ${forced.yScale(new Date(d.date))})`
          );

          const rect = labelG.append('rect');
          rect
            .attr('width', 50)
            .attr('height', 15)
            .attr('fill', '#fff')
            .attr('fill-opacity', 0.9);
          rect.attr('x', -50).attr('y', -12);

          const text = labelG
            .append('text')
            .text(
              new Date(d.date).toLocaleDateString('en-us', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            )
            .style('font-size', 9)
            .style('text-anchor', 'end')
            .style('font-weight', 600);

          midWrap
            .append('line')
            .attr('id', 'date_line')
            .attr('y1', d.y)
            .attr('x2', 0 - 70)
            .attr('y2', forced.yScale(new Date(d.date)))
            .attr('x1', +d.x)
            .attr('stroke', 'black')
            .attr('stroke-width', 1);

          if (filterRT) {
            let activities = d3
              .selectAll('.list-activity')
              .filter((f, i, n) => {
                return n[i].innerText.includes(d.title);
              });

            if (activities.nodes().length > 0) {
              activities
                .nodes()[0]
                .scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        })
        .on('mouseout', () => {
          d3.select('#tooltip').style('opacity', 0);
          d3.select('#date_line').remove();
          d3.select('#label-group').remove();
        })
        .on('click', (event: any, d: any) => {
          const activities = d3.selectAll('.list-activity').filter((f, i, n) => {
            return d3.select(n[i]).attr('id') === d.title;
          });
          activities
            .nodes()[0]
            .scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    setSvgWidth(
      wrap.node().getBBox().width + wrapAxisGroup.node().getBBox().width
    );
    setBubbleDivWidth(wrap.node().getBBox().width - 250);
  }, [
    selectedActivityURL,
    usedEntries,
    groupBy,
    eventArray,
    filterType,
    defineEvent,
    viewParams,
  ]);

  useEffect(() => {
    if (svgRef.current) {
      setNewHeight(window.innerHeight - 150);
    }
    if (groupBy) {
      setBubbleDivWidth(window.innerWidth);
      setSvgWidth(researchThreads?.research_threads.length * 200);
    }
  }, [window.innerHeight, window.innerWidth, groupBy]);

  return (
    <div
      style={{
        flex: flexAmount,
        paddingTop: '30px',
        paddingLeft: groupBy ? 30 : 0,
        width: bubbleDivWidth,
        overflowX: 'auto',
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
        {(!selectedActivityURL && !viewParams)&& (
          <Box
            marginLeft="3px"
            padding="3px"
            height="40px"
            display='inline-block'
          >
            <FormControl display="flex" alignItems="center" marginBottom={10}>
              <FormLabel
                htmlFor="split-by"
                mb="0"
                textAlign="right"
                fontSize="12px"
              >
                Facet by research threads
              </FormLabel>
              <Switch
                id="split-by"
                onChange={(event) => {
                  event.target.checked
                    ? setGroupBy(
                        researchThreads?.research_threads.map((rt) => {
                          return {
                            title: rt.title,
                            color: rt.color,
                            id: rt.rt_id,
                            activities: rt.evidence.map((m) => m.activityTitle),
                            dob: rt.actions.filter(
                              (a) => a.action === 'created'
                            )[0].when,
                          };
                        })
                      )
                    : setGroupBy(null);
                }}
              />
            </FormControl>
          </Box>
        )}
      </div>

      <svg
        ref={svgRef}
        width={
          groupBy !== null ? researchThreads.research_threads.length * 280 : 600
        }
        height={height}
        style={{ display: 'inline' }}
      />
      {filterRT || groupBy ? (
        <RTtooltip
          activityData={hoverData}
          position={toolPosition}
          filterRT={filterRT}
          researchThreads={researchThreads}
        />
      ) : (
        <ToolTip activityData={hoverData} position={toolPosition} />
      )}
    </div>
  );
};

export default BubbleVis;
