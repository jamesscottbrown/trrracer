import React from 'react';
import * as d3 from 'd3';
import { getIndexOfMonth } from '../timeHelperFunctions';
import { useProjectState } from './ProjectContext';

const smalltalk = require('smalltalk');

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

  const { height, filteredActivities, setDefineEvent, defineEvent, yScale, translateY } =
    projectProps;

  const [
    { projectData, selectedArtifactEntry, hopArray },
    dispatch,
  ] = useProjectState();

  const allActivities = projectData.entries;
  const { eventArray } = projectData;

  const width = 130;
  const margin = height * 0.25;

  const yearMonth = dataStructureForTimeline(allActivities);

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



  React.useEffect(() => {

    console.log('ARE tHERe FILETERED ACTIVITIES??', filteredActivities);
    const filteredActivitiesExtent = d3.extent(
      filteredActivities.map((m: any) => new Date(m.date))
    );

    // Create root container where we will append all other chart elements
    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll('*').remove(); // Clear svg content before adding new elements

    const svg = svgEl.append('g').attr('transform', `translate(60, ${translateY})`);

    const yAxis = d3.axisLeft(yScale).ticks(22).tickSize(10);

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

    const axisLabel = yAxisGroup
      .selectAll('text')
      .join('text')
      .attr('font-size', '0.55rem')
      .attr('opacity', 0.5);

    const eventRectGroups = svg
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
      
    }

    // if(selectedArtifactEntry){
      const rects = svg
      .append('g')
      .selectAll('rect.activity')
      .data(allActivities)
      .join('rect')
      .classed('activity', true);

      rects.attr('width', 30).attr('height', 3);
      rects.attr('y', (d: any) => yScale(new Date(d.date)));

      rects
        .filter((r: any) => {
          return (
            new Date(r.date) >= filteredActivitiesExtent[0] &&
            new Date(r.date) <= filteredActivitiesExtent[1]
          );
        })
        .attr('fill', 'gray')
        .style('fill-opacity', 0.2);

      rects
        .filter((r: any) => {
          return (
            new Date(r.date) < filteredActivitiesExtent[0] ||
            new Date(r.date) > filteredActivitiesExtent[1]
          );
        })
        .attr('fill', 'red')
        .style('fill-opacity', 0.08);

    // }

  
    if (!defineEvent && !selectedArtifactEntry) {
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
          [40, height - margin],
        ])
        .on('start brush end', brushed);

      const gBrush = svg
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
        ? svg.append('text').classed('reset', true)
        : resetTest;

      reset
        .text('Reset Time')
        .attr('transform', 'translate(-10, -30)')
        .style('font-size', '12px')
        .style('cursor', 'pointer')
        .on('click', () => {
          dispatch({ type: 'UPDATE_FILTER_DATES', filterDates: [null, null] });
        });
    }

    if (selectedArtifactEntry) {
      if (hopArray) {
        rects
          .filter((f) => hopArray.map((m) => m.title).includes(f.title))
          .attr('fill', 'purple')
          .attr('fill-opacity', 1)
          .attr('height', 10);
      }

      rects
        .filter((f) => f.title === selectedArtifactEntry.title)
        .attr('fill', 'red')
        .style('fill-opacity', 1)
        .attr('height', 10)
        .attr('width', 30);
    }

    if (defineEvent) {

      let text;

      const brushedEvent = function (event: any) {
        if (!event.selection && !event.sourceEvent) return;
        const s0 = event.selection
          ? event.selection
          : [1, 2].fill(event.sourceEvent.offsetX);

        let s1 = s0;

        if (event.sourceEvent && event.type === 'end') {
          s1 = event.selection;
          d3.select(this).transition().call(event.target.move, s1);

          console.log([
            yScale.invert(event.selection[0]),
            yScale.invert(event.selection[1]),
          ]);

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
          .text((d, i) => {
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
          [40, height - margin],
        ])
        .on('start brush end', brushedEvent);

      const gBrush = svg.append('g').call(bY);

      svg.on('mousemove', (event)=> {
        let textTest = svg.select('text.hover-text');
        text = textTest.empty() ? svg.append('text').classed('hover-text', true) : textTest;
        let position = (event.offsetY - 120);
        text.text(yScale.invert(position));
        text.attr('y', position - 20);
        text.attr('x', -30);
        text.style('font-size', 11);
        text.style('font-weight', 800);
        
      })
      svg.on('mouseleave', (event)=> {
        let textTest = svg.select('text.hover-text');
        textTest.remove();
        // text = textTest.empty() ? svg.append('text').classed('hover-text', true) : textTest;
        // let position = (event.offsetY - 120);
        // text.text(yScale.invert(position));
        // text.attr('y', position - 20);
        // text.attr('x', -30);
        // text.style('font-size', 11);
        // text.style('font-weight', 800);
        
      })
    }
  }, [
    height,
    filteredActivities,
    selectedArtifactEntry,
    hopArray,
    defineEvent,
    eventArray,
  ]);

  return (
    <svg
      id="time-svg"
      ref={svgRef}
      width={width}
      height={height}
      style={{ display: 'inline' }}
    />
  );
};

export default VerticalAxis;
