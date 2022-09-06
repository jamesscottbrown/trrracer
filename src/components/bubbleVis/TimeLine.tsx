import React, { useRef } from 'react';
import * as d3 from 'd3';

export const TimeLine = (props) => {
  const { yScale } = props;

  const axisRef = useRef(null);

  const yAxis = d3.axisLeft(yScale).ticks(40).tickSize(10);

  const yAxisGroup = d3.select(axisRef.current).call(yAxis);

  /*
const yAxisGroup = wrap
  .append('g')
  .attr('transform', `translate(10, 0)`)
  .call(yAxis);
*/

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
    .attr('opacity', 0.5)
    .style("user-select", "none");

  return <g ref={axisRef} transform={`translate(10, 0)`} />;
};
