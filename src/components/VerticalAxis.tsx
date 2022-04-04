import React, { useState } from 'react';
import { Flex, useColorModeValue } from '@chakra-ui/react';

import * as d3 from 'd3';
import { getIndexOfMonth } from '../timeHelperFunctions';
import { useProjectState } from './ProjectContext';

export const dataStructureForTimeline = (activityData: any) => {
  const years = d3.groups(activityData, (y: any) =>
    new Date(y.date).getFullYear()
  );

  return years
    .sort((a: any, b: any) => a[0] - b[0])
    .map((year: any) => {
      const mon = d3.groups(year[1], (m: any) => new Date(m.date).getMonth());

      const wrapper = new Array(12).fill({}).map((m, i) => {
        const activ = mon.filter((f: any) => f[0] === i);
        const allActivities =
          activ.length > 0
            ? activ.flatMap((f: any) => {
                f[1] = f[1].map((a: any) => {
                  a.month = i;
                  a.year = year[0];
                  return a;
                });
                return f[1];
              })
            : [];
        if (allActivities.length > 0) {
          allActivities[0].firstMonth = true;
        }
        return { month: i, year: year[0], activities: allActivities };
      });

      return { year: year[0], months: wrapper };
    });
};
export const jitter = (val: any) => Math.random() * val;

const VerticalAxis = (projectProps: any) => {
  const svgRef = React.useRef(null);

  const { defineEvent, height, filteredActivities } = projectProps;
  const [
    { projectData, selectedArtifactEntry, researchThreads, selectedThread },
  dispatch] = useProjectState();
  const allActivities = projectData.entries;


  const width = 150;
  
  const margin = height * 0.25;

  const yearMonth = dataStructureForTimeline(allActivities);

  const startIndex = getIndexOfMonth(yearMonth[0].months, 'first');
  const endIndex = getIndexOfMonth(
    yearMonth[yearMonth.length - 1].months,
    'last'
  );
  yearMonth[0].months = yearMonth[0].months.filter(
    (f, i) => i > startIndex - 1
  );
  yearMonth[yearMonth.length - 1].months = yearMonth[
    yearMonth.length - 1
  ].months.filter((f, i) => i < endIndex);

  React.useEffect(() => {

    const yScale = d3
      .scaleTime()
      .domain(d3.extent(allActivities.map((m) => new Date(m.date))))
      .range([0, height - margin])
      .nice();

    console.log('RANGE??',yScale.range())
  
    const filteredActivitiesExtent = d3.extent(filteredActivities.map(m => new Date(m.date)));

    // Create root container where we will append all other chart elements
    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll('*').remove(); // Clear svg content before adding new elements

    const svg = svgEl.append('g').attr('transform', `translate(90, 10)`);

    const yAxis = d3.axisLeft(yScale).ticks(16).tickSize(10);

    const yAxisGroup = svg
      .append('g')
      .attr('transform', `translate(10, 0)`)
      .call(yAxis);

    yAxisGroup.select('.domain').remove();
    yAxisGroup
      .selectAll('line')
      .enter()
      .append('line')
      .attr('stroke', 'gray.900');

    let axisLabel = yAxisGroup
      .selectAll('text')
      .join('text')
      .attr('font-size', '0.55rem')
      .attr('opacity', 0.5)

    let rects = svg.append('g').selectAll('rect.activity').data(allActivities).join('rect').classed('activity', true);
    rects.attr('width', 40).attr('height', 3);
    rects.attr('y', (d: any)=> yScale(new Date(d.date)));

    rects.filter(r => {
      return new Date(r.date) >= filteredActivitiesExtent[0] && new Date(r.date) <= filteredActivitiesExtent[1]
    }).attr('fill', 'gray').style('fill-opacity', .3)

    rects.filter(r => {
      return new Date(r.date) < filteredActivitiesExtent[0] || new Date(r.date) > filteredActivitiesExtent[1]
    }).attr('fill', 'red').style('fill-opacity', .08)

    if (!defineEvent) {

      // const filteredDomain = function (scale: any, min: any, max: any) {
      //   const dif = scale(d3.min(scale.domain())) - scale.range()[0];

      //   let iMin = min - dif < 0 ? 0 : Math.round(min - dif);
      //   const iMax = Math.round(max - dif);

      //   if (iMax == iMin) --iMin; // It happens with empty selections.

      //   return scale.domain().slice(iMin, iMax);
      // };

        const triangle = d3.symbol().size(100).type(d3.symbolTriangle);

        const brushed = function (event, d) {
          if (!event.selection && !event.sourceEvent) return;
          const s0 = event.selection
            ? event.selection
            : [1, 2].fill(event.sourceEvent.offsetX);
          // const d0 = filteredDomain(yScale, s0[0], s0[1]);
          let s1 = s0;

          if (event.sourceEvent && event.type === 'end') {
            s1 = event.selection;
            d3.select(this).transition().call(event.target.move, s1);
            console.log(yScale.invert(event.selection[0]), yScale.invert(event.selection[1]))
            dispatch({ type: 'UPDATE_FILTER_DATES', filterDates: [yScale.invert(event.selection[0]), yScale.invert(event.selection[1])] });
          }

          // move handlers
          d3.selectAll('g.handles').attr('transform', (d) => {
            const y = d == 'handle--o' ? s1[0] : s1[1];
            return `translate(0, ${y})`;
          });
          // console.log('D0?', d0);
          // update labels
          d3.selectAll('g.handles')
            .selectAll('text')
            // .attr('dy', d0.length > 1 ? 0 : 6)
            .attr('dy', 6)
            .text((d, i) => {
              let year;
              // if (d0.length > 1) {
                year =
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
              // } else {
              //   year =
              //     d == 'handle--o'
              //       ? yScale.invert(s1[0]).toLocaleDateString('en-us', {
              //           weekday: 'long',
              //           year: 'numeric',
              //           month: 'short',
              //           day: 'numeric',
              //         })
              //       : '';
              // }
              return year;
            });

        };

        const bY = d3
          .brushY()
          .handleSize(8)
          .extent([
            [0, 0],
            [50, height - margin],
          ])
          .on('start brush end', brushed);

        const gBrush = svg
          .append('g')
          .call(bY)
          .call(bY.move, [yScale(filteredActivitiesExtent[0]), yScale(filteredActivitiesExtent[1])]);

        
        // gBrush.attr('transform', 'translate(-5,0)')

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
            let y = d == 'handle--o' ? yScale(filteredActivitiesExtent[0]) : yScale(filteredActivitiesExtent[1])
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
            if (d == 'handle--o') {
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
          .style('pointer-events', 'none')
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
            const y = d == 'handle--o' ? -17 : 6;
            const rot = d == 'handle--o' ? 0 : 180;
            return `translate(20, ${y}) rotate(${rot})`;
            
          });

        gHandles
          .selectAll('.line')
          .data((d) => [d])
          .join('line')
          .attr('class', (d) => `line ${d}`)
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', 50)
          .attr('y2', 0)
          .attr('stroke', 'black');

          console.log('HEIGHTTTT!',height)
      }
  }, [height, filteredActivities]);


  return (
    <svg id="time-svg" ref={svgRef} width={width} height={height} style={{display:'inline'}} />
  );
};

export default VerticalAxis;
