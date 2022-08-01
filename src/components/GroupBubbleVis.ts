import * as d3 from 'd3';
import * as d3co from 'd3-color';

import Bubbles from '../Bubbles';
import ForceMagic from '../ForceMagic';
import { EntryType, ResearchThreadData } from './types';

export default function groupBubbles(
  groupBy: any,
  wrap: any, // d3.Selection<SVGGElement, unknown, null, undefined>,
  forced: ForceMagic,
  setTool: (pos: [number, number]) => void,
  setHoverData: (entry: EntryType) => void,
  researchThreads: ResearchThreadData | undefined
) {
  const groupRTDATA = groupBy;

  d3.select('svg').attr('width', 1000);
  wrap.attr('transform', `translate(20, 50)`);

  d3.select('.timeline-wrap').attr('transform', `translate(50, 50)`);

  const groupGroups = wrap
    .selectAll('g.group')
    .data(groupRTDATA)
    .join('g')
    .attr('class', 'group');

  groupGroups.attr(
    'transform',
    (_: any, i: number) => `translate(${i * 210}, 0)`
  );

  const label = groupGroups.append('text').text((d) => d.title);
  label.style('font-size', '9px').style('text-anchor', 'middle');
  label.attr('x', 150).attr('y', -20);

  const underGroup = groupGroups
    .selectAll('g.underWrap')
    .data((d) => {
      return [forced.nodes.filter((f) => d.activities.indexOf(f.title) === -1)];
    })
    .join('g')
    .classed('underWrap', true);

  const midG = groupGroups.append('g').classed('midGroup', true);

  const hiddenActivityGroups = underGroup
    .selectAll('g.hidden-activity')
    .data((d) => d)
    .join('g')
    .attr('class', 'hidden-activity');

  hiddenActivityGroups.attr('transform', (d) => `translate(${d.x}, ${d.y})`);

  const hiddenBubbles = new Bubbles(hiddenActivityGroups, true, 'hidden');

  hiddenBubbles.bubbles
    .attr('fill', d3co.hsl('#d3d3d3').copy({ l: 0.94 }))
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

  const topWrap = groupGroups
    .selectAll('g.topWrap')
    .data((d) => {
      const temp = forced.nodes
        .filter((f) => d.activities.indexOf(f.title) > -1)
        .map((m) => {
          const ob = { ...m };
          ob.color = d.color;
          ob.rt_id = d.id;
          return ob;
        });
      return [temp];
    })
    .join('g')
    .classed('topWrap', true);

  const activityGroups = topWrap
    .selectAll('g.activity-g')
    .data((d) => d)
    .join('g')
    .attr('class', 'activity-g');

  activityGroups.attr('transform', (d) => `translate(${d.x}, ${d.y})`);

  const actBubbles = new Bubbles(activityGroups, true, 'activity');

  const artifactCircles = activityGroups
    .selectAll('circle.artifact')
    .data((d) => d.files)
    .join('circle')
    .classed('artifact', true);

  artifactCircles
    .attr('r', () => 3)
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y);
  artifactCircles.attr('fill', '#fff');

  // COLOR AND STYLING
  actBubbles.bubbles
    .attr('fill', (d) => d3co.hsl(d.color).copy({ l: 0.9 }))
    .attr('stroke', '#d3d3d3')
    .attr('stroke-width', 0.4);

  groupGroups.each((gData, i: number, nodes: any) => {
    const chosenR = researchThreads.research_threads.filter(
      (rt) => rt.rt_id === gData.id
    )[0];

    let linkDataBefore: any = [];
    let linkDataAfter: any = [];

    const parentGroup = d3.select(nodes[i]);

    const divideDate = new Date(
      chosenR.actions.filter((f) => f.action === 'created')[0].when
    );

    chosenR.evidence.forEach((r: any) => {
      const actG = parentGroup
        .selectAll('.activity-g')
        .filter((ha) => ha.title === r.activityTitle);

      if (r.type === 'activity') {
        actG.selectAll('circle.artifact').attr('fill', gData.color);
      } else if (r.type === 'artifact' || r.type === 'fragment') {
        actG
          .selectAll('circle.artifact')
          .filter((art) => art.title === r.artifactTitle)
          .attr('fill', gData.color);
      }

      if (new Date(actG.date) < divideDate) {
        linkDataBefore.push({
          coord: [actG.data()[0].x, actG.data()[0].y],
          date: actG.data()[0].date,
        });
      } else {
        linkDataAfter.push({
          coord: [actG.data()[0].x, actG.data()[0].y],
          date: actG.data()[0].date,
        });
      }
    });

    const lineGenerator = d3.line();

    if (linkDataAfter.length > 0) {
      linkDataAfter = linkDataAfter.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      const pathStringSolid = lineGenerator(linkDataAfter.map((m) => m.coord));

      midG
        .filter((f) => f.id === gData.id)
        .append('path')
        .attr('d', pathStringSolid)
        .attr('fill', 'none')
        .attr('stroke', gData.color)
        .attr('stroke-width', 1);
    }
    if (linkDataBefore.length > 0) {
      linkDataBefore = linkDataBefore.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      if (linkDataAfter.length > 0) linkDataBefore.push(linkDataAfter[0]);

      const pathStringDash = lineGenerator(linkDataBefore.map((m) => m.coord));

      midG
        .filter((f) => f.id === gData.id)
        .append('path')
        .attr('d', pathStringDash)
        .attr('fill', 'none')
        .attr('stroke', gData.color)
        .attr('stroke-width', 1)
        .style('stroke-dasharray', '5,5');
    }
  });

  activityGroups
    .on('mouseover', (event, d) => {
      d3.selectAll('.activity')
        .filter((f) => f.activity_uid === d.activity_uid)
        .attr('stroke', 'red')
        .attr('stroke-width', '2px');
      d3.selectAll('circle.hidden')
        .filter((f) => {
          if (f) {
            return f.activity_uid === d.activity_uid;
          }
          return f.title === d.title;
        })
        .attr('stroke', 'red')
        .attr('stroke-width', '2px');

      // TOOLTIP
      // const { activityData, position, researchThreads, filterRT } = toolProp;
      setTool([d.x, d.y]);
      setHoverData(d);
      d3.select('#tooltip').style('opacity', 1);
    })
    .on('mouseout', (event, d, i) => {
      //TOOLTIP

      setTool([0, 0]);
      const ob = { ...d };
      ob.i = i;
      setHoverData(ob);
      d3.select('#tooltip').style('opacity', 0);

      d3.selectAll('.activity')
        .filter((f) => f.activity_uid === d.activity_uid)
        .attr('stroke', 'gray')
        .attr('stroke-width', 0.4);
      d3.selectAll('circle.hidden')
        .filter((f) => f.activity_uid === d.activity_uid)
        .attr('stroke', 'gray')
        .attr('stroke-width', 0.4);
    });
}
