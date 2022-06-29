import * as d3 from 'd3';
import Bubbles from "../Bubbles";


export default function groupBubbles(groupBy, wrap, underWrap, forced, selectedActivityURL, filteredActivities, setTool) {
      
          const groupRTDATA = groupBy;

          d3.select('svg').attr('width', 1000)
          wrap.attr('transform', `translate(20, 50)`);
          underWrap.attr('transform', `translate(20, 50)`);
          d3.select('.timeline-wrap').attr('transform', `translate(50, 50)`);

          const groupGroups = wrap
            .selectAll('g.group')
            .data(groupRTDATA)
            .join('g')
            .attr('class', 'group');
      
          groupGroups.attr('transform', (d: any, i: any) => `translate(${(i * 210)}, 0)`);
      
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
      
        activityBubbles.bubbles.attr('fill', "gray").attr('fill-opacity', .1).attr('stroke', '#d3d3d3').attr('stroke-width', .5);
        let artifactCircles = allActivityGroups.selectAll('circle.artifact').data(d => d.files).join('circle').classed('artifact', true);
        artifactCircles.attr('r', d => (3)).attr('cx', d => d.x).attr('cy', d => d.y);
      
        let highlightedActivities = allActivityGroups.filter((ac) => filteredActivities.map((m:any) => m.title).includes(ac.title));
        
        groupGroups.each((d, i, n)=> {
          
          let chosenRT = d;//researchThreads?.research_threads.filter(f => f.title === d.label)[0];
          
          let linkDataBefore = [];
          let linkDataAfter = [];
      
          // let rtActivities = chosenRT.evidence.map(m => m.activityTitle);
          let rtActivities = chosenRT.activities;//chosenRT.evidence.map(m => m.activityTitle);
          let colorCirc = d3.select(n[i]).selectAll('circle.all-activities').filter(c => rtActivities.includes(c.title));
          colorCirc.attr('fill',  chosenRT.color);
          colorCirc.attr('stroke-width', 1).attr('stroke', 'gray');

          colorCirc.classed('group-highlight', true);
      
          d3.select(n[i]).selectAll('.artifact').attr('fill', chosenRT.color);
      
          let notColA = d3.select(n[i]).selectAll('.activity').filter(c => rtActivities.indexOf(c.title) === -1);
          notColA.selectAll('.artifact').attr('fill', '#d3d3d3');
      
          let notCol = d3.select(n[i]).selectAll('circle.all-activities').filter(c => rtActivities.indexOf(c.title) === -1);
          notCol.attr('fill', '#d3d3d3');

          /////
          let divideDate = new Date(chosenRT);

          colorCirc.data().forEach((c, j)=> {

          if(new Date(c.date) < divideDate){
            linkDataBefore.push({coord: [c.x, c.y], date: c.date})
          }else{
            linkDataAfter.push({coord: [c.x, c.y], date: c.date})
          }

          var lineGenerator = d3.line();
    
          if(linkDataAfter.length > 0){
      
            linkDataAfter = linkDataAfter.sort((a, b) => new Date(a.date) - new Date(b.date));
      
            var pathStringSolid = lineGenerator(linkDataAfter.map(m=> m.coord));
      
            let path = underWrap.append('path')
            .attr('d', pathStringSolid)
            .attr('fill', 'none')
            .attr('stroke', chosenRT.color)
            .attr('stroke-width', 1);

            path.attr('transform', `translate(${i*210}, 0)`)
          }
          if(linkDataBefore.length > 0){
      
            linkDataBefore = linkDataBefore.sort((a, b) => new Date(a.date) - new Date(b.date));
            if(linkDataAfter.length > 0) linkDataBefore.push(linkDataAfter[0])
            
            var pathStringDash = lineGenerator(linkDataBefore.map(m=> m.coord));
            
            let path = underWrap.append('path')
              .attr('d', pathStringDash)
              .attr('fill', 'none')
              .attr('stroke', chosenRT.color)
              .attr('stroke-width', 2)
              .style('stroke-dasharray', '5,5');
              path.attr('transform', `translate(${i*210}, 0)`)
          }
 
        });

      });

      d3.selectAll('.group-highlight')
      .on('mouseover', (event, n)=> {
    
        d3.selectAll('.all-activities').filter(f=> {
          return f.title === n.title;
        }).attr('stroke-width', 3);

      }).on('mouseout', (event, n) => {
      
        d3.selectAll('.all-activities').filter(f=> {
          return f.title === n.title;
        }).attr('stroke-width', 1);
      })

}