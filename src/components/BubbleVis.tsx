import path from 'path';
import * as d3 from 'd3';
import React, { useEffect, useState } from 'react';
import { useProjectState } from './ProjectContext';
import ForceMagic from '../ForceMagic';
import Bubbles from '../Bubbles';
import VerticalAxis from './VerticalAxis';
import type { EntryType } from './types';
import { Box, Button, FormControl, FormLabel, Spacer, Switch } from '@chakra-ui/react';



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
  ] = useProjectState();
  
  const {eventArray} = projectData;

  const [newHeight, setNewHeight] = useState('1000px');
  const [translateY, setTranslateY] = useState(35);

  const width = 200;
  const height = +newHeight.split('px')[0];

  const svgRef = React.useRef(null);

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

  const bubbleData = splitBubbs
    ? projectData.entries.flatMap((pd: any) => {
        const files = [...pd.files];
        files.map((f) => {
          f.activityTitle = pd.title;
          f.date = pd.date;
          return f;
        });
        return files;
      })
    : projectData.entries;

  const forced = new ForceMagic(bubbleData, width, height, splitBubbs);

  useEffect(() => {
    if (svgRef.current) {
      setNewHeight(window.getComputedStyle(svgRef.current).height);
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const underWrap = svg.append('g').classed('path-wrap', true)
    underWrap.attr('transform', `translate(0, ${translateY})`);//.attr('transform', .attr('transform', `translate(0, ${translateY})`);)
    const wrap = svg.append('g').attr('transform', `translate(0, ${translateY})`);
    const { yScale, margin } = forced;
    setTranslateY(margin / 3);

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
  
          eventText.attr('x', 200);
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
      const highlightedForFirst = forced.nodes.filter((f: any) =>
        filteredActivities.map((m: any) => m.title).includes(f.title)
      );
      const notHighlightedForFirst = forced.nodes.filter(
        (f: any) => filteredActivities.map((m: any) => m.title).indexOf(f.title) == -1
      );

      let groups = [
        {
          label: 'all',
          color: 'gray',
          highlighted: highlightedForFirst,
          notHighlighted: notHighlightedForFirst,
        },
      ];
      if (groupBy.type === 'research_threads') {

        const tempgroups = groupBy.data.map((m: any) => {
          const group = { label: m.title, color: m.color };
          group.highlighted = [...nodes].filter(
            (n: any) =>
              m.evidence.map((e: any) => e.activityTitle).includes(n.title) ||
              m.tagged_activities
                .flatMap((fm: any) => fm.associatedActivities.map((m: any) => m.title))
                .includes(n.title)
          );
          group.highlighted = group.highlighted.map((h: any) => {
            h.rtTitle = m.title;
            h.evidence =
              m.evidence.filter((e: any) => e.activityTitle === h.title)
                .length === 0
                ? null
                : m.evidence.filter((e: any) => e.activityTitle === h.title);
            return h;
          });

          group.notHighlighted = nodes.filter(
            (n: any) =>
              m.evidence.map((e: any) => e.activityTitle).indexOf(n.title) === -1
          );
          return group;
        });

        groups = [...groups, ...tempgroups];

        const groupGroups = wrap
          .selectAll('g.group')
          .data(groups)
          .join('g')
          .attr('class', 'group');

        groupGroups.attr('transform', (d: any, i: any) => `translate(${i * 170}, 0)`);

        let underGroup = groupGroups.append('g');

        const activityNotGroups = groupGroups
          .selectAll('g.activity_not')
          .data((d: any) => d.notHighlighted)
          .join('g')
          .attr('class', 'activity_not');

        const activityHighlightGroups = groupGroups
          .selectAll('g.activity')
          .data((d: any) => {
            const temp = d.highlighted.map((m: any) => {
              m.color = d.color;
              return m;
            });
            return temp;
          })
          .join('g')
          .attr('class', 'activity');

        const bubbleNotHighlighted = new Bubbles(
          activityNotGroups,
          false,
          splitBubbs,
          artifactTypes
        );
        
        bubbleNotHighlighted.bubbles
          .attr('fill', 'gray')
          .attr('fill-opacity', .2)

        const bubbleHighlighted = new Bubbles(
          activityHighlightGroups,
          true,
          splitBubbs,
          artifactTypes
        );

        bubbleHighlighted.bubbles.attr('fill', (d) => d.color);

        let rt = researchThreads?.research_threads.map(m => {
          let evid = m.evidence.map(e => e.activityTitle)
          return {rtTitle: m.title, dataTitle: evid};
        })

        bubbleHighlighted.bubbles.filter(f => {
          let tempCheck = rt?.filter(r => r.rtTitle === f.rtTitle)[0];
          return tempCheck?.dataTitle.indexOf(f.title) === -1;
        }).attr('fill-opacity', .6).attr('stroke', 'gray').attr('stroke-width', 1)

        bubbleHighlighted.bubbles.filter(f => {
          let tempCheck = rt?.filter(r => r.rtTitle === f.rtTitle)[0];
          return tempCheck?.dataTitle.indexOf(f.title) > -1;
        }).attr('stroke', 'black').attr('stroke-width', 2);

        let rtConnect = []

        rt?.forEach((r, i)=> {

          let linkData = [];

          let filterRTNodes = bubbleHighlighted.bubbles.filter(f=> f.rtTitle === r.rtTitle);

          rtConnect.push({title:r.rtTitle, names: filterRTNodes.data().map(m => m.title)})
      
          for(let j = 0; j < filterRTNodes.nodes().length; j = j+1){
            let bubbSel = d3.select(filterRTNodes.nodes()[j]);
            linkData.push({coord: [bubbSel.attr('cx'), bubbSel.attr('cy')], date: bubbSel.data()[0].date})
          }
          
         var lineGeneratorToo = d3.line();
          linkData = linkData.sort((a, b) => new Date(a.date) - new Date(b.date))
          var pathString = lineGeneratorToo(linkData.map(m=> m.coord));

          underGroup.filter(ug => ug.label === r.rtTitle).append('path')
            .attr('d', pathString)
            .attr('fill', 'none')
            .attr('stroke', 'gray')
            .attr('stroke-width', 1)//.attr('transform', `translate(${i * 170}, 0)`);
        });

        let nameSet = new Set(rtConnect.flatMap(fm => fm.names))

        let test = Array.from(nameSet).filter(ns => {
          let temp = rtConnect.flatMap(fm => fm.names).filter(fl => fl === ns);
          return temp.length > 2;
        })

        test.forEach((t, tIndex) => {
          let tPath = []
          let multiBubbles = bubbleHighlighted.bubbles.filter(f=> t === f.title);
          console.log('SVG', svg.node().getBoundingClientRect())
          let sub = svg.node().getBoundingClientRect();

          for(let mi = 0; mi < multiBubbles.nodes().length; mi = mi + 1){
            let tmp = multiBubbles.nodes()[mi].getBoundingClientRect();
            let trp = d3.select(multiBubbles.nodes()[mi])
          
            // tPath.push([tmp.x, tmp.y])
            tPath.push([tmp.x - sub.x, trp.attr('cy')])
          }

          var lineGeneratorDoo = d3.line();
          var pathString = lineGeneratorDoo(tPath);

          let moveX = (sub.x - 170)

          let conWrap = underWrap
          .append('g').classed('con', true)//.attr('transform', `translate(170, 0)`);;

          conWrap
          .append('path')
            .attr('d', pathString)
            .attr('fill', 'none')
            .attr('stroke', 'gray')
            .style("stroke-dasharray", ("3, 3"))
            .attr('stroke-width', 1)


        
        })

        let multiBubbles = bubbleHighlighted.bubbles.filter(f=> test.includes(f.title));

        console.log(multiBubbles.nodes())

        if(filterRT){

          let tagChecker = [...filterRT.associatedKey].filter(at => filterRT.key.indexOf(at) === -1);

          bubbleHighlighted.bubbles.filter(b => {
            return tagChecker.includes(b.title);
          }).attr('fill-opacity', .6)
            .attr('stroke', 'gray')
            .attr('stroke-width', 1);
  
          bubbleHighlighted.bubbles.filter(b => {
            return tagChecker.indexOf(b.title) === -1;
          }).attr('stroke', 'black')
          .attr('stroke-width', 2)
        }

        bubbleHighlighted.bubbles
          .on('mouseover', (event: any, d: any) => {
            d3.select(event.target)
              .attr('r', d.radius * 2)
              // .attr('stroke', '#fff')
              // .attr('stroke-width', 2)

            setHoverActivity(d);

            const htmlForm = () => {
              let start = `<div style="margin-bottom:10px; font-weight:700">`;
              if (!d.evidence) {
                start += `Activity: ${d.title} <br/>`;

                d.files.forEach((f: any) => {
                  start += `<div><span style="font-weight:700; font-size:14px">${f.artifactType}:  </span>${f.title}</div>`;
                });

                if (d.rtTitle) {
                  start += `</br><div style='font-weight:700'>This activity is tagged with a tag associated with ${d.rtTitle}</div>`;
                }
              } else {
                start += `Research Thread: ${d.rtTitle} - Activity: ${d.title} <br/>`;
                d.evidence.forEach((t: any) => {
                  const type =
                    t.type === 'fragment' ? 'Fragment of Artifact' : t.type;
                  const artifactTitle =
                    t.type === 'fragment' || t.type === 'artifact'
                      ? `: ${t.artifactTitle}`
                      : '';
                  start += `<div><span style="font-weight:700; font-size:14px">${type}</span>${artifactTitle}</div></br>`;
                  if (t.type === 'fragment') {
                    t.anchors.map((an: any) => {
                      if (an.anchor_type === 'text') {
                        start += `<div style="margin-bottom:10px">${an.frag_type}</div>`;
                      }
                    });
                  }
                  start += `<div>Rationale: ${t.rationale}<div>`;
                });
              }
              start += `</div>`;
              return start;
            };

            div.transition().duration(200).style('opacity', 0.9);
            div
              .html(htmlForm)
              .style('left', `${event.pageX}px`)
              .style('top', `${event.pageY - 28}px`);
          })
          .on('mouseout', (event: any, d: any) => {
            d3.select(event.target).attr('r', d.radius)
            //.attr('stroke-width', 0);
            div.transition().duration(500).style('opacity', 0);
          });
      }
    } else {
      const notNodes = forced.nodes.filter((f: any) => {
        if (splitBubbs) {
          return (
            filteredActivities.map((m:any) => m.title).indexOf(f.activityTitle) ===
            -1
          );
        }
        return filteredActivities.map((m:any) => m.title).indexOf(f.title) === -1;
      });

      const selectedNodes = forced.nodes
        .filter((f:any) => {
          if (splitBubbs) {
            return filteredActivities
              .map((m:any) => m.title)
              .includes(f.activityTitle);
          }
          return filteredActivities.map((m:any) => m.title).includes(f.title);
        })
        .map((m) => {
          if (splitBubbs) {
            const temp = artifactTypes.artifact_types.filter(
              (f:any) => f.type === m.artifactType
            );
            if (temp.length > 0) {
              m.color = temp[0].color;
            } else {
              m.color = 'black';
            }
          } else if(selectedThread){
            // console.log('selectedThread!!', researchThreads?.research_threads[selectedThread].color)
            m.color = researchThreads?.research_threads[selectedThread].color;
          } else {

            m.color = 'gray';
          }

          return m;
        });

      const activityNot = wrap
        .selectAll('g.activity_not')
        .data(notNodes)
        .join('g')
        .attr('class', 'activity_not');

      const activityGroups = wrap
        .selectAll('g.activity')
        .data(selectedNodes)
        .join('g')
        .attr('class', 'activity');

      const bubbleNotHighlighted = new Bubbles(
        activityNot,
        false,
        splitBubbs,
        artifactTypes
      );

      bubbleNotHighlighted.bubbles.attr('fill', 'gray').attr('fill-opacity', .2)
      // .attr('stroke', 'gray')
      // .attr('stroke-width', 1);

      const bubbleHighlighted = new Bubbles(
        activityGroups,
        true,
        splitBubbs,
        artifactTypes
      );

      bubbleHighlighted.bubbles.attr('fill', () => {
        let color = researchThreads.research_threads[selectedThread] ? researchThreads.research_threads[selectedThread].color : 'gray';
        return color;
      });

      if(filterRT){
        let tagChecker = [...filterRT.associatedKey].filter(at => filterRT.key.indexOf(at) === -1);

        bubbleHighlighted.bubbles.filter(b => {
          return tagChecker.includes(b.title);
        }).attr('fill-opacity', .6)
          .attr('stroke', 'gray')
          .attr('stroke-width', 1);

        bubbleHighlighted.bubbles.filter(b => {
          return tagChecker.indexOf(b.title) === -1;
        }).attr('stroke', 'black')
        .attr('stroke-width', 2);

      let linkData = [];
      
      for(let i = 0; i < bubbleHighlighted.bubbles.nodes().length; i = i+1){
        let bubbSel = d3.select(bubbleHighlighted.bubbles.nodes()[i]);
        linkData.push({coord: [bubbSel.attr('cx'), bubbSel.attr('cy')], date: bubbSel.data()[0].date})
      }

      var lineGenerator = d3.line();
      linkData = linkData.sort((a, b) => new Date(a.date) - new Date(b.date))
      var pathString = lineGenerator(linkData.map(m=> m.coord));

      underWrap.append('path')
        .attr('d', pathString)
        .attr('fill', 'none')
        .attr('stroke', 'gray')
        .attr('stroke-width', 1);
      }

      bubbleHighlighted.bubbles
        .on('mouseover', (event, d) => {
          d3.select(event.target)
            .attr('r', d.radius * 2)
            // .attr('stroke', '#fff')
            // .attr('stroke-width', 2)

          setHoverActivity(d);

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
            .style('left', `${event.pageX}px`)
            .style('top', `${event.pageY - 28}px`);
        })
        .on('mouseout', (event:any, d:any) => {
          d3.select(event.target).attr('r', d.radius)
          //.attr('stroke-width', 0);
          div.transition().duration(500).style('opacity', 0);
        });

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
      <VerticalAxis
        filteredActivities={filteredActivities}
        height={height}
        setDefineEvent={setDefineEvent}
        defineEvent={defineEvent}
        yScale={forced.yScale}
        translateY={translateY}
      />
      <svg
        ref={svgRef}
        width="calc(100% - 160px)"
        // width="500px"
        height={height}
        style={{ display: 'inline' }}
      />
    </div>
  );
};

export default BubbleVis;
