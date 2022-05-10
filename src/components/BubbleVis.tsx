import path from 'path';
import * as d3 from 'd3';
import React, { useEffect, useState } from 'react';
import { useProjectState } from './ProjectContext';
import ForceMagic from '../ForceMagic';
import Bubbles from '../Bubbles';
import VerticalAxis, { dataStructureForTimeline } from './VerticalAxis';
import type { EntryType } from './types';
import { Box, Button, FormControl, FormLabel, Spacer, Switch } from '@chakra-ui/react';
import { calcCircles } from '../PackMagic';
import { getIndexOfMonth } from '../timeHelperFunctions';

interface BubbleProps {
  filteredActivities: EntryType[];
  setGroupBy:(gb:any)=> void;
  groupBy: any;
  setSplitBubbs: (b:boolean)=> void;
  splitBubbs: boolean;
  setHoverActivity: (ent: any) => void;
  flexAmount: number;
  setDefineEvent: (value: ((prevState: boolean) => boolean) | boolean) => void;
  defineEvent: boolean;
}

const BubbleVis = (props: BubbleProps) => {
  const {
    filteredActivities,
    groupBy,
    setGroupBy,
    splitBubbs,
    setSplitBubbs,
    setHoverActivity,
    flexAmount,
    setDefineEvent,
    defineEvent,
  } = props;

  const [
    { artifactTypes, selectedThread, researchThreads, folderPath, projectData, filterRT },
    dispatch
  ] = useProjectState();
  
  const {eventArray} = projectData;

  const [newHeight, setNewHeight] = useState('1000px');
  const [translateY, setTranslateY] = useState(35);

  const width = 200;
  const height = +newHeight.split('px')[0];

  const svgRef = React.useRef(null);

  let packedCircData = calcCircles(projectData.entries);

  const checktool = d3.select('#tooltip');

  const div = checktool.empty()
    ? d3
        .select('body')
        .append('div')
        .attr('id', 'tooltip')
        .style('opacity', 0)
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

  const forced = new ForceMagic(packedCircData, width, height, splitBubbs);

  useEffect(() => {
    if (svgRef.current) {
      setNewHeight(window.getComputedStyle(svgRef.current).height);
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const underWrap = svg.append('g').classed('path-wrap', true)
    underWrap.attr('transform', `translate(180, ${translateY})`);//.attr('transform', .attr('transform', `translate(0, ${translateY})`);)
    const wrap = svg.append('g').attr('transform', `translate(180, ${translateY})`);

    const { yScale, margin } = forced;
    setTranslateY(margin / 3);

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

  // React.useEffect(() => {

    const filteredActivitiesExtent = d3.extent(
      filteredActivities.map((m: any) => new Date(m.date))
    );

    // Create root container where we will append all other chart elements
    // const svgEl = d3.select(svgRef.current);
    // svgEl.selectAll('*').remove(); // Clear svg content before adding new elements
    let checkGroup = svg.select('g.timeline-wrap');

    let wrapAxisGroup = checkGroup.empty() ? svg.append('g').attr('class', 'timeline-wrap') : checkGroup;
    
    wrapAxisGroup.selectAll('*').remove();
    wrapAxisGroup.attr('transform', `translate(110, ${translateY})`);

    const yAxis = d3.axisLeft(yScale).ticks(30).tickSize(10);

    const yAxisGroup = wrapAxisGroup
      .append('g')
      .attr('transform', `translate(10, 0)`)
      .call(yAxis);

    yAxisGroup.select('.domain').remove();
    yAxisGroup
      .selectAll('line')
      .enter()
      .append('line')
      .attr('stroke', 'gray.900');

    const axisLabel = yAxisGroup
      .selectAll('text')
      .join('text')
      .attr('font-size', '0.55rem')
      .attr('opacity', 0.5);

    if (!defineEvent) {
      const triangle = d3.symbol().size(100).type(d3.symbolTriangle);

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

        // update labels
        d3.selectAll('g.handles')
          .selectAll('text')
          .attr('dy', 6)
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

      gBrush.select('.overlay').attr('opacity', 0.25);

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

      // Label
      gHandles
        .selectAll('text')
        .data((d) => [d])
        .join('text')
        .attr('text-anchor', 'middle')
        .attr('dy', -2)
        .text((d) => {
          if (d === 'handle--o') {
            console.log('sanity check filtered activities extent', filteredActivitiesExtent)
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
      //       // Visible Line

      //       // Triangle
      gHandles
        .selectAll('.triangle')
        .data((d) => [d])
        .enter()
        .append('path')
        .attr('class', (d) => `triangle ${d}`)
        .attr('d', triangle)
        .attr('transform', (d) => {
          const y = d === 'handle--o' ? -17 : 6;
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
        .attr('x2', 40)
        .attr('y2', 0)
        .attr('stroke', 'black');

      const resetTest = svg.select('text.reset');

      const reset = resetTest.empty()
        ?wrapAxisGroup.append('text').classed('reset', true)
        : resetTest;

      reset
        .text('Reset Time')
        .attr('transform', 'translate(-25, -30)')
        .style('font-size', '12px')
        .style('cursor', 'pointer')
        .on('click', () => {
          dispatch({ type: 'UPDATE_FILTER_DATES', filterDates: [null, null] });
        });
    }

    if (defineEvent) {

      let text;
      let bGroup = wrapAxisGroup.append('g')
      
      let bRect = bGroup.append('rect').attr('width', 40).attr('height', height-marginTime).attr('fill-opacity', 0);

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

      bGroup.call(bY)

      bGroup.on('mousemove', (event)=> {
        let textTest = svg.select('text.hover-text');
        text = textTest.empty() ? svg.append('text').classed('hover-text', true) : textTest;
        let position = (event.offsetY - 120);
        text.text(yScale.invert(position));
        text.attr('y', position - 20);
        text.attr('x', -30);
        text.style('font-size', 11);
        text.style('font-weight', 800);
        
      })
      bGroup.on('mouseleave', () => {
        let textTest = svg.select('text.hover-text');
        textTest.remove();
        
      })
    }
 
  /*
  */
    const eventRectGroups = wrap
    .selectAll('g.event')
    .data(eventArray)
    .join('g')
    .classed('event', true);

    if (eventArray.length > 0) {

        eventRectGroups.attr('transform', (d)=> `translate(0, ${yScale(new Date(d.time[0]))})`)
        const eventRects = eventRectGroups.selectAll('rect').data(d => [d]).join('rect');

        eventRects.attr(
        'height',
        (d: any) => yScale(new Date(d.time[1])) - yScale(new Date(d.time[0]))
        );

        eventRects.attr('width', 600);
        eventRects.style('fill-opacity', 0.05);

        if(!groupBy){
          let eventText = eventRectGroups
          .selectAll('text')
          .data((d) => [d])
          .join('text')
          .text((d) => d.event);
  
          eventText.attr('x', 270);
          eventText.attr('y', 20);
          eventText.style('font-size', 10);
          eventText.style('fill', 'gray');
        }
     
    }

    const nodes = forced.nodes.filter((f: any) => {
      if (splitBubbs) {
        return filteredActivities.map((m: any) => m.title).includes(f.activityTitle);
      }
      return filteredActivities.map((m: any) => m.title).includes(f.title);
    });

    if (groupBy) {
 
      if (groupBy.type === 'research_threads') {

        const groupRTDATA = groupBy.data.map((m: any) => {
          return { label: m.title, color: m.color };
        });

        const groupGroups = wrap
          .selectAll('g.group')
          .data(groupRTDATA)
          .join('g')
          .attr('class', 'group');

        groupGroups.attr('transform', (d: any, i: any) => `translate(${(i * 230)}, 0)`);

        let allActivityGroups = groupGroups
        .selectAll('g.activity')
        .data(forced.nodes)
        .join('g')
        .attr('class', 'activity');

      allActivityGroups.attr('transform', d => `translate(${d.x}, ${d.y})`);

      let underGroup = groupGroups.append('g');

      // allActivityGroups.attr('transform', d => `translate(${d.x}, ${d.y})`);

      let activityBubbles = new Bubbles(
        allActivityGroups,
        true,
        'all-activities'
      );

      activityBubbles.bubbles.attr('fill', "#fff").attr('fill-opacity', .2).attr('stroke', '#d3d3d3').attr('stroke-width', .2);
      let artifactCircles = allActivityGroups.selectAll('circle.artifact').data(d => d.files).join('circle').classed('artifact', true);
      artifactCircles.attr('r', d => (d.r - 1)).attr('cx', d => d.x).attr('cy', d => d.y);

      let highlightedActivities = allActivityGroups.filter((ac) => filteredActivities.map((m:any) => m.title).includes(ac.title));
      
      groupGroups.each((d, i, n)=> {
        console.log('each', d3.select(n[i]));
        let chosenRT = researchThreads?.research_threads.filter(f => f.title === d.label)[0];
        let rtActivities = chosenRT.evidence.map(m => m.activityTitle);
        let colorCirc = d3.select(n[i]).selectAll('circle.all-activities').filter(c => rtActivities.includes(c.title));
        colorCirc.attr('fill', d.color);

        let notColA = d3.select(n[i]).selectAll('.activity').filter(c => rtActivities.indexOf(c.title) === -1);
        notColA.selectAll('.artifact').attr('fill', '#d3d3d3');
        let notCol = d3.select(n[i]).selectAll('circle.all-activities').filter(c => rtActivities.indexOf(c.title) === -1);
        notCol.attr('fill', '#d3d3d3');
      })

      }
    } else {

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

      activityBubbles.bubbles.attr('fill', "#fff").attr('fill-opacity', .2).attr('stroke', '#d3d3d3').attr('stroke-width', .2);
      
      let artifactCircles = allActivityGroups.selectAll('circle.artifact').data(d => d.files).join('circle').classed('artifact', true);
      artifactCircles.attr('r', d => (d.r)).attr('cx', d => d.x).attr('cy', d => d.y);

      let highlightedActivities = allActivityGroups.filter((ac) => filteredActivities.map((m:any) => m.title).includes(ac.title));
      highlightedActivities.select('.all-activities')
      .on('mouseover', (event, d) => {
        if(filterRT){
          d3.select(event.target).attr('stroke', 'gray').attr('stroke-width', 2);
        }else{
          d3.select(event.target).attr('fill', 'gray');
        }
       
      }).on('mouseout', (event, d) => {
        if(filterRT){
        d3.select(event.target).attr('stroke-width', 0);
        }else{
        d3.select(event.target).attr('fill', '#fff');
        }
      });

      let highlightedCircles = highlightedActivities.selectAll('circle.artifact');

      highlightedCircles.attr('fill', 'gray');

      let hiddenCircles = allActivityGroups.filter(ac => {
        return filteredActivities.map((m:any) => m.title).indexOf(ac.title) === -1})
      .selectAll('circle.artifact');

      hiddenCircles.attr('fill', 'gray')
      .attr('fill-opacity', .3);

      if(filterRT){
        console.log('selecteddddd',selectedThread, filterRT)
        let tagChecker = [...filterRT.associatedKey].filter(at => filterRT.key.indexOf(at) === -1);

        let linkData = [];
        researchThreads?.research_threads[selectedThread].evidence.forEach(f => {
          let temp = highlightedActivities.filter(ha => ha.title === f.activityTitle);
        
        let chosenActivityData = temp.select('.all-activities').data()[0];
        
        if(f.type === 'activity'){
          temp.select('.all-activities')
            .attr('fill', researchThreads?.research_threads[selectedThread].color);
        
        }else if(f.type === 'artifact' || f.type === 'fragment'){
      
          let artifactCoord = temp.selectAll('circle.artifact').filter(art => art.title === f.artifactTitle);
          temp
            .select('circle.background')
            .attr('fill-opacity', 1);
          temp.selectAll('circle.artifact')
            .filter(art => art.title === f.artifactTitle)
            .attr('fill', researchThreads?.research_threads[selectedThread].color);
          temp.select('circle.all-activities')
            .attr('fill', researchThreads?.research_threads[selectedThread].color);
          
          let adjustedX = (+artifactCoord.attr('cx') < 0) ? (chosenActivityData.x - artifactCoord.attr('cx')) : (chosenActivityData.x + artifactCoord.attr('cx'));
          let adjustedY = (+artifactCoord.attr('cy') < 0) ? (chosenActivityData.y - artifactCoord.attr('cy')) : (chosenActivityData.y - (artifactCoord.attr('cy')));
          // console.log('adjusted Y??', adjustedY, 'chosenactivity', chosenActivityData.y, artifactCoord.attr('cy'));
          linkData.push({coord: [chosenActivityData.x, chosenActivityData.y], date: chosenActivityData.date})
        }
      })

      console.log('highlighted activities', researchThreads?.research_threads[selectedThread], filterRT)
      
      var lineGenerator = d3.line();
      linkData = linkData.sort((a, b) => new Date(a.date) - new Date(b.date))
      var pathString = lineGenerator(linkData.map(m=> m.coord));

      underWrap.append('path')
        .attr('d', pathString)
        .attr('fill', 'none')
        .attr('stroke', 'gray')
        .attr('stroke-width', 1);
    }

    highlightedActivities
        .on('mouseover', (event, d) => {
          console.log(d)
          underWrap.append('line')
            .attr('id', 'date_line')
            .attr('y1', d.y)
            .attr('x1', (0-100))
            .attr('y2', d.y)
            .attr('x2', (+d.x))
            .attr('stroke', 'gray')
            .attr('stroke-width', 1)

          underWrap.append('text')
            .attr('id', 'date_label')
            .text(new Date(d.date).toLocaleDateString('en-us', {
              weekday: 'long',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }))
            .attr('text-anchor', 'end')
            .attr('font-size', 9)
            .attr('x', (0-100))
            .attr('y', d.y)

          // setHoverActivity(d);

          const htmlForm = () => {
            let start = `<div style="margin-bottom:10px; font-weight:700">${d.title} <br/>
                                    ${d.date} <br/></div>`;
            if (!splitBubbs) {
              if (selectedThread != null) {
                const test = researchThreads.research_threads[
                  selectedThread
                ].evidence.filter((f) => f.activityTitle === d.title);

                if (test.length > 0) {
                  test.forEach((t) => {
                    const type =
                      t.type === 'fragment' ? 'Fragment of Artifact' : t.type;
                    const artifactTitle =
                      t.type === 'fragment' || t.type === 'artifact'
                        ? `: ${t.artifactTitle}`
                        : '';
                    start += `<div><span style="font-weight:700; font-size:14px">${type}</span>${artifactTitle}</div></br>`;
                    if (t.type === 'fragment') {
                      t.anchors.map((an:any) => {
                        if (an.anchor_type === 'text') {
                          start += `<div style="margin-bottom:10px">${an.frag_type}</div>`;
                        }
                      });
                    }
                    start += `<div>Rationale: ${t.rationale}<div>`;

                    if (t.artifactTitle.includes('.png')) {
                      start += `<img src="${path.join(
                        folderPath,
                        t.artifactTitle
                      )}" style="width:500px; height:auto"
                                    />`;
                    }
                  });
                } else {
                  start += `</br>
                    <span>This activity is tagged with a tag associated with the research thread <span style="font-weight:700">${researchThreads.research_threads[selectedThread].title}</span>`;
                }

                start += `</div>`;
                return start;
              }
              d.files.forEach((f:any) => {
                start += `<div><span style="font-weight:700; font-size:14px">${f.artifactType}:  </span>${f.title}</div>`;
              });
            } else {
              console.log('dis a file', d);
            }
            return start;
          };

          div.transition().duration(200).style('opacity', 0.9);
          div
            .html(htmlForm)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 28}px`);
        })
        .on('mouseout', (event:any, d:any) => {
          // d3.select(event.target).attr('r', d.radius)
          d3.select('#date_line').remove();
          d3.select('#date_label').remove();
          //.attr('stroke-width', 0);
          div.transition().duration(500).style('opacity', 0);
        });

    // }
      }

  }, [filteredActivities, groupBy, splitBubbs, eventArray]);

  return (
    <div style={{ flex: flexAmount, paddingTop:'10px' }}>
      <div
        style={{width:'100%'}}
      >
        <Button
          size={'sm'}
          style={{fontSize:"12px"}}
          onClick={() =>
            defineEvent ? setDefineEvent(false) : setDefineEvent(true)
          }
        >
          Add events to timeline
        </Button>
       
        <Box marginLeft="50px" padding="3px" height="30px" display={'inline-block'}>
        <FormControl display="flex" alignItems="center" marginBottom={10}>
          <FormLabel
            htmlFor="split-by"
            mb="0"
            textAlign="right"
            fontSize="12px"
          >
            Split bubbles to artifacts
          </FormLabel>
          <Switch
            id="split-by"
            onChange={(event) => {
              event.target.checked ? setSplitBubbs(true) : setSplitBubbs(false);
            }}
          />
        </FormControl>
      </Box>
      <Box marginLeft="3px" padding="3px" height="40px" display={'inline-block'}>
        <FormControl display="flex" alignItems="center" marginBottom={10}>
          <FormLabel
            htmlFor="split-by"
            mb="0"
            textAlign="right"
            fontSize="12px"
          >
            Group by research threads
          </FormLabel>
          <Switch
            id="split-by"
            onChange={(event) => {
              event.target.checked
                ? setGroupBy({
                    type: 'research_threads',
                    data: researchThreads.research_threads,
                  })
                : setGroupBy(null);
            }}
          />
        </FormControl> 
      </Box>
           
      </div>

      <svg
        ref={svgRef}
        width="calc(100% - 160px)"
        height={height}
        style={{ display: 'inline' }}
      />
    </div>
  );
};

export default BubbleVis;
