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
        const activity =
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
        if (activity.length > 0) {
          activity[0].firstMonth = true;
        }
        return { month: i, year: year[0], activities: activity };
      });

      return { year: year[0], months: wrapper };
    });
};
export const jitter = (val: any) => Math.random() * val;

const VerticalAxis = (projectProps: any) => {
  const svgRef = React.useRef(null);

  const { defineEvent, setTimeFilter, viewType, filteredActivityNames } = projectProps;
  const [
    { projectData, selectedArtifactEntry, researchThreads, selectedThread },
  dispatch] = useProjectState();
  const activity = projectData.entries;
  const [newHeight, setNewHeight] = useState('100%');

  const width = 90;
  const height = +newHeight.split('px')[0];
  const margin = width * 0.25;

  const yearMonth = dataStructureForTimeline(activity);

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

    if (svgRef.current) {
      setNewHeight(window.getComputedStyle(svgRef.current).height);
    }

    const yScale = d3
      .scaleTime()
      .domain(d3.extent(activity.map((m) => new Date(m.date))))
      .range([0, height - margin])
      .nice();

    // Create root container where we will append all other chart elements
    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll('*').remove(); // Clear svg content before adding new elements

    const svg = svgEl.append('g').attr('transform', `translate(50, 10)`);

    const yAxis = d3.axisLeft(yScale).ticks(16).tickSize(10);

    const yAxisGroup = svg
      .append('g')
      .attr('transform', `translate(10, 40)`)
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
      .attr('opacity', 0.9)
      .attr('font-size', '0.55rem')

    let rects = svg.append('g').selectAll('rect.activity').data(projectData.entries).join('rect').classed('activity', true);
    rects.attr('width', 40).attr('height', 3);
    rects.attr('y', (d: any)=> yScale(new Date(d.date)));
    rects.attr('fill', 'gray').style('fill-opacity', .25)

    if (!defineEvent) {
      const filteredDomain = function (scale: any, min: any, max: any) {
        const dif = scale(d3.min(scale.domain())) - scale.range()[0];

        let iMin = min - dif < 0 ? 0 : Math.round(min - dif);
        const iMax = Math.round(max - dif);

        if (iMax == iMin) --iMin; // It happens with empty selections.

        return scale.domain().slice(iMin, iMax);
      };

        const triangle = d3.symbol().size(100).type(d3.symbolTriangle);

        const brushed = function (event, d) {
          if (!event.selection && !event.sourceEvent) return;
          const s0 = event.selection
            ? event.selection
            : [1, 2].fill(event.sourceEvent.offsetX);
          const d0 = filteredDomain(yScale, s0[0], s0[1]);
          let s1 = s0;

          if (event.sourceEvent && event.type === 'end') {
            s1 = event.selection;
            d3.select(this).transition().call(event.target.move, s1);
            setTimeFilter([
              yScale.invert(event.selection[0]),
              yScale.invert(event.selection[1]),
            ]);
            dispatch({ type: 'UPDATE_FILTER_DATES', filterDates: [yScale.invert(event.selection[0]), yScale.invert(event.selection[1])] });
          }

          // move handlers
          d3.selectAll('g.handles').attr('transform', (d) => {
            const y = d == 'handle--o' ? s1[0] : s1[1];
            return `translate(0, ${y})`;
          });

          // update labels
          d3.selectAll('g.handles')
            .selectAll('text')
            .attr('dy', d0.length > 1 ? 0 : 6)
            .text((d, i) => {
              let year;
              if (d0.length > 1) {
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
              } else {
                year =
                  d == 'handle--o'
                    ? yScale.invert(s1[0]).toLocaleDateString('en-us', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : '';
              }
              return year;
            });

        };

        const bY = d3
          .brushY()
          .handleSize(8)
          .extent([
            [0, 0],
            [40, height - margin],
          ])
          .on('start brush end', brushed);

        const gBrush = svg
          .append('g')
          .call(bY)
          .call(bY.move, [0, height - margin]);

        // gBrush.attr('transform', 'translate(-5,0)')

        gBrush.style('opacity', 0.3);

  //       // Custom handlers
  //       // Handle group
  //       const gHandles = gBrush
  //         .selectAll('g.handles')
  //         .data(['handle--o', 'handle--e'])
  //         .join('g')
  //         .attr('class', (d) => `handles ${d}`)
  //         .attr('fill', 'black')
  //         .attr('transform', (d) => {
  //           const x = d == 'handle--o' ? 0 : width - margin;
  //           return `translate(${x}, 5)`;
  //         });

  //       // Label
  //       gHandles
  //         .selectAll('text')
  //         .data((d) => [d])
  //         .join('text')
  //         .attr('text-anchor', 'middle')
  //         .attr('dy', -2)
  //         .text((d) => {
  //           if (d == 'handle--o') {
  //             return d3.min(yScale.domain()).toLocaleDateString('en-us', {
  //               weekday: 'long',
  //               year: 'numeric',
  //               month: 'short',
  //               day: 'numeric',
  //             });
  //           }
  //           return d3.max(yScale.domain()).toLocaleDateString('en-us', {
  //             weekday: 'long',
  //             year: 'numeric',
  //             month: 'short',
  //             day: 'numeric',
  //           });
  //         })
  //         .style('font-size', '11px');
  //       // Visible Line

  //       // Triangle
  //       gHandles
  //         .selectAll('.triangle')
  //         .data((d) => [d])
  //         .enter()
  //         .append('path')
  //         .attr('class', (d) => `triangle ${d}`)
  //         .attr('d', triangle)
  //         .attr('transform', (d) => {
  //           const x = d == 'handle--o' ? -6 : 6;
  //           const rot = d == 'handle--o' ? -90 : 90;
  //           return `translate(${x}, ${height / 2}) rotate(${rot})`;
  //         });

  //       gHandles
  //         .selectAll('.line')
  //         .data((d) => [d])
  //         .join('line')
  //         .attr('class', (d) => `line ${d}`)
  //         .attr('x1', 0)
  //         .attr('y1', -5)
  //         .attr('x2', 0)
  //         .attr('y2', height + 5)
  //         .attr('stroke', 'black');

  //     } else if (selectedArtifactEntry) {
  //       circles
  //         .filter((c: any) => {
  //           return c.title === selectedArtifactEntry.title;
  //         })
  //         .attr('fill', 'red')
  //         .attr('r', 10)
  //         .attr('fill-opacity', 1);
  //     } else if (viewType === 'research threads') {
  //       const threadG = circleG
  //         .selectAll('g.thread')
  //         .data(researchThreads.research_threads[selectedThread].evidence)
  //         .join('g')
  //         .classed('thread', true);

  //       const tCirc = threadG
  //         .append('circle')
  //         .attr('cx', (d) => yScale(new Date(d.dob)))
  //         .attr('cy', 5)
  //         .attr('r', 6)
  //         .attr('fill', researchThreads.research_threads[selectedThread].color)
  //         .attr('fill-opacity', 1)
  //         .attr('stroke', '#FFFFFF');

  //       threadG.each((d, i, n) => {
  //         if (i > 0) {
  //           const prev = d3.select(n[i - 1]).data()[0];

  //           d3.select(n[i])
  //             .append('line')
  //             .attr('x1', yScale(new Date(prev.dob)))
  //             .attr('y1', 5)
  //             .attr('x2', (d) => yScale(new Date(d.dob)))
  //             .attr('y2', 5)
  //             .attr(
  //               'stroke',
  //               researchThreads.research_threads[selectedThread].color
  //             )
  //             .attr('stroke-width', '1px');
  //         }
  //       });
  //     }
  //   }
  // }, [activity, selectedArtifactEntry, viewType, selectedThread, filteredActivityNames]);
      }
  });


  return (
    <svg id="time-svg" ref={svgRef} width={width} height={height} style={{display:'inline'}} />
  );
};

export default VerticalAxis;
