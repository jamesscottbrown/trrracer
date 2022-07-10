import * as d3 from 'd3';
import { useMemo } from 'react';
import Bubbles from "../Bubbles";
import * as d3co from 'd3-color';
import { useProjectState } from './ProjectContext';


export default function groupBubbles(groupBy, wrap, forced, selectedActivityURL, filteredActivities, setTool, researchThreads) {
      
          const groupRTDATA = groupBy;

          d3.select('svg').attr('width', 1000)
          wrap.attr('transform', `translate(20, 50)`);
         
          d3.select('.timeline-wrap').attr('transform', `translate(50, 50)`);

          const groupGroups = wrap
            .selectAll('g.group')
            .data(groupRTDATA)
            .join('g')
            .attr('class', 'group');
      
          groupGroups.attr('transform', (d: any, i: any) => `translate(${(i * 210)}, 0)`);

          let label = groupGroups.append('text').text(d => d.title);
          label.style('font-size','9px').style('text-anchor','middle')
          label.attr('x', 150).attr('y', -20)

          let underGroup = groupGroups.selectAll('g.underWrap').data((d)=> {
            return [forced.nodes.filter(f => d.activities.indexOf(f.title) === -1)];
          }).join('g').classed('underWrap', true);

          let midG = groupGroups.append('g').classed('midGroup', true);

          let hiddenActivityGroups = underGroup.selectAll('g.hidden-activity')
          .data(d => d)
          .join('g')
          .attr('class', 'hidden-activity');

          hiddenActivityGroups.attr('transform', d => `translate(${d.x}, ${d.y})`);

          let hiddenBubbles = new Bubbles(
            hiddenActivityGroups,
            true,
            'hidden'
          );

          hiddenBubbles.bubbles.attr('fill', d3co.hsl('#d3d3d3').copy({l: .94})) .attr('stroke', '#d3d3d3').attr('stroke-width', .4);
          
          let hiddenCircles = hiddenActivityGroups.selectAll('circle.artifact').data(d => d.files).join('circle').classed('artifact', true);
          hiddenCircles.attr('r', d => (3)).attr('cx', d => d.x).attr('cy', d => d.y);
          hiddenCircles.attr('fill', '#d3d3d3');

          let topWrap = groupGroups.selectAll('g.topWrap').data((d)=> {
            
            let temp = forced.nodes.filter(f => d.activities.indexOf(f.title) > -1).map(m => {
              let ob = {...m}
              ob.color = d.color;
              ob.rt_id = d.id;
              return ob;
            })
            return [temp];
          }).join('g').classed('topWrap', true);

          let activityGroups = topWrap.selectAll('g.activity-g')
          .data(d => d)
          .join('g')
          .attr('class', 'activity-g');

          activityGroups.attr('transform', d => `translate(${d.x}, ${d.y})`);

          let actBubbles = new Bubbles(
            activityGroups,
            true,
            'activity'
          );

          let artifactCircles = activityGroups.selectAll('circle.artifact')
            .data(d => d.files)
            .join('circle').classed('artifact', true);

          artifactCircles.attr('r', d => (3)).attr('cx', d => d.x).attr('cy', d => d.y);
          artifactCircles.attr('fill', '#fff');
          
          //COLOR AND STYLING
          actBubbles.bubbles.attr('fill', (d)=> d3co.hsl(d.color).copy({l:.9}))
          .attr('stroke', '#d3d3d3').attr('stroke-width', .4);
          
          groupGroups.each((gData, i:number, nodes:any) => {
           
            let chosenR = researchThreads.research_threads.filter(rt => rt.rt_id === gData.id)[0];

            let linkDataBefore = [];
            let linkDataAfter = [];

            let parentGroup = d3.select(nodes[i]);

            let divideDate = new Date(chosenR.actions.filter(f => f.action === 'created')[0].when);


            chosenR.evidence.forEach((r:any, j:number)=> {
              let actG = parentGroup.selectAll('.activity-g').filter(ha => ha.title === r.activityTitle);
           
              if(r.type === 'activity'){
                actG.selectAll('circle.artifact')
                  .attr('fill', gData.color);
            
              }else if(r.type === 'artifact' || r.type === 'fragment'){

                actG.selectAll('circle.artifact').filter(art => art.title === r.artifactTitle)
                  .attr('fill', gData.color);
              }
    
              console.log('devide date',divideDate);

              if(new Date(actG.date) < divideDate){
                linkDataBefore.push({coord: [actG.data()[0].x, actG.data()[0].y], date: actG.data()[0].date})
              }else{
                linkDataAfter.push({coord: [actG.data()[0].x, actG.data()[0].y], date: actG.data()[0].date})
              }
          });

          var lineGenerator = d3.line();

          if(linkDataAfter.length > 0){

            linkDataAfter = linkDataAfter.sort((a, b) => new Date(a.date) - new Date(b.date));

            var pathStringSolid = lineGenerator(linkDataAfter.map(m=> m.coord));

            let pathThing = midG.filter(f => f.id === gData.id).append('path')
            .attr('d', pathStringSolid)
            .attr('fill', 'none')
            .attr('stroke', gData.color)
            .attr('stroke-width', 1);

          }
          if(linkDataBefore.length > 0){

            linkDataBefore = linkDataBefore.sort((a, b) => new Date(a.date) - new Date(b.date));
            if(linkDataAfter.length > 0) linkDataBefore.push(linkDataAfter[0])
            
            var pathStringDash = lineGenerator(linkDataBefore.map(m=> m.coord));
        
            let pathThing = midG.filter(f => f.id === gData.id).append('path')
              .attr('d', pathStringDash)
              .attr('fill', 'none')
              .attr('stroke', gData.color)
              .attr('stroke-width', 1)
              .style('stroke-dasharray', '5,5');

          }
        })
}