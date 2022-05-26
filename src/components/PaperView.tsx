import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import * as d3 from 'd3';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';
import ThreadNav from './ThreadNav';
import { useProjectState } from './ProjectContext';
import ForceMagic from '../ForceMagic';
import Bubbles from '../Bubbles';
// import { joinPath } from '../fileUtil';
// import { readFileSync } from '../fileUtil';
import { calcCircles } from '../PackMagic';
import { dataStructureForTimeline } from './VerticalAxis';
import { getIndexOfMonth } from '../timeHelperFunctions';


const BubbleVisPaper = (props: any) => {
  const {
    svg,
    filteredActivities,
    setHoverActivity,
    flexAmount,
    selectedThreadData,
    projectData,
    translateY,
    setTranslateY,
    hoverData,
    setHoverData,
    toolPosition,
    setToolPosition,
  } = props;
  
  const {eventArray} = projectData;

  const width = 200;
  const height = 1000;
 
  let packedCircData = calcCircles(projectData.entries);

  d3.select('#tooltip').style('opacity', 0);

  const forced = new ForceMagic(packedCircData, width, height);

  const svgWrap = svg;
  svgWrap.selectAll('*').remove();

  const underWrap = svgWrap.append('g').classed('path-wrap', true)
  underWrap.attr('transform', `translate(180, ${translateY})`);//.attr('transform', .attr('transform', `translate(0, ${translateY})`);)
  
  const wrapTest = svgWrap.select('.wrapper');
  const wrap = wrapTest.empty() ? svgWrap.append('g').classed('wrapper', true).attr('transform', `translate(180, ${translateY})`) : wrapTest;

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

  const filteredActivitiesExtent = d3.extent(
    filteredActivities.map((m: any) => new Date(m.date))
  );

    let checkGroup = svgWrap.select('g.timeline-wrap');
    let wrapAxisGroup = checkGroup.empty() ? svgWrap.append('g').attr('class', 'timeline-wrap') : checkGroup;
    
    wrapAxisGroup.selectAll('*').remove();
    wrapAxisGroup.attr('transform', `translate(110, ${translateY})`);

    const yAxis = d3.axisLeft(yScale).ticks(40).tickSize(10);

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

    const eventRectGroups = wrap
    .selectAll('g.event')
    .data(eventArray)
    .join('g')
    .classed('event', true);

    if (eventArray.length > 0) {

        eventRectGroups.attr('transform', (d)=> `translate(-70, ${yScale(new Date(d.time[0]))})`)
        const eventRects = eventRectGroups.selectAll('rect').data(d => [d]).join('rect');

        eventRects.attr(
        'height',
        (d: any) => yScale(new Date(d.time[1])) - yScale(new Date(d.time[0]))
        );

        eventRects.attr('width', 900);
        eventRects.style('fill-opacity', 0.05);

        let eventLine = eventRectGroups
          .append('line')
          .attr('x1', 0)
          .attr('x2', 300)
          .attr('y1', 0)
          .attr('y2', 0)
          .attr('stroke', 'gray')
          .attr('stroke-width', 1)

        let eventText = eventRectGroups
          .selectAll('text')
          .data((d) => [d])
          .join('text')
          .text((d) => d.event);

        eventText.attr('x', 305);
        eventText.attr('y', 4);
        eventText.style('font-size', 10);
        eventText.style('fill', 'gray');
        
    }

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

      activityBubbles.bubbles.attr('fill', "#d3d3d3").attr('fill-opacity', .3).attr('stroke', '#d3d3d3').attr('stroke-width', .4);
      
      let artifactCircles = allActivityGroups.selectAll('circle.artifact').data(d => d.files).join('circle').classed('artifact', true);
      artifactCircles.attr('r', d => (3)).attr('cx', d => d.x).attr('cy', d => d.y);

      let highlightedActivities = allActivityGroups.filter((ac) => selectedThreadData.evidence.map((m:any) => m.activityTitle).includes(ac.title));
      
      highlightedActivities.select('.all-activities')
      .on('mouseover', (event, d) => {
        d3.select(event.target).attr('stroke', 'gray').attr('stroke-width', 2);
      }).on('mouseout', (event, d) => {
        d3.select(event.target).attr('stroke-width', 0);
      });

      let highlightedCircles = highlightedActivities.selectAll('circle.artifact');
      highlightedCircles.attr('fill', 'gray');

      let hiddenCircles = allActivityGroups.filter(ac => selectedThreadData.evidence.map((m:any) => m.activityTitle).indexOf(ac.title) === -1)
      .selectAll('circle.artifact');

      hiddenCircles.attr('fill', 'gray')
      .attr('fill-opacity', .3);

      let linkDataBefore = [];
      let linkDataAfter = [];

      console.log('selected_thread', selectedThreadData)
      selectedThreadData.evidence.forEach(f => {
        console.log()
        let temp = highlightedActivities.filter(ha => ha.title === f.activityTitle);
      
      let chosenActivityData = temp.select('.all-activities').data()[0];
      
      if(f.type === 'activity'){
        temp.select('.all-activities')
          .attr('fill', selectedThreadData.color);
      
      }else if(f.type === 'artifact' || f.type === 'fragment'){
         
        let artifactCoord = temp.selectAll('circle.artifact').filter(art => art.title === f.artifactTitle);
        temp
          .select('circle.background')
          .attr('fill-opacity', 1);
        temp.selectAll('circle.artifact')
          .filter(art => art.title === f.artifactTitle)
          .attr('fill', selectedThreadData.color);
        temp.select('circle.all-activities')
          .attr('fill', selectedThreadData.color);
        
        let divideDate = new Date(selectedThreadData.actions.filter(f => f.action === 'created')[0].when);

        if(new Date(chosenActivityData.date) < divideDate){
          linkDataBefore.push({coord: [chosenActivityData.x, chosenActivityData.y], date: chosenActivityData.date})
        }else{
          linkDataAfter.push({coord: [chosenActivityData.x, chosenActivityData.y], date: chosenActivityData.date})
        }
        
      }
    })

    var lineGenerator = d3.line();
    linkDataAfter = linkDataAfter.sort((a, b) => new Date(a.date) - new Date(b.date));
    linkDataBefore = linkDataBefore.sort((a, b) => new Date(a.date) - new Date(b.date));

    linkDataBefore.push(linkDataAfter[0])

    var pathStringDash = lineGenerator(linkDataBefore.map(m=> m.coord));
    var pathStringSolid = lineGenerator(linkDataAfter.map(m=> m.coord));

    underWrap.append('path')
      .attr('d', pathStringDash)
      .attr('fill', 'none')
      .attr('stroke', selectedThreadData.color)
      .attr('stroke-width', 2)
      .style('stroke-dasharray', '5,5');

      underWrap.append('path')
        .attr('d', pathStringSolid)
        .attr('fill', 'none')
        .attr('stroke', selectedThreadData.color)
        .attr('stroke-width', 2);
    
      highlightedActivities
          .on('mouseover', (event, d) => {
            setToolPosition([d.x, d.y])
            setHoverData(d);
            d3.select('#tooltip').style('opacity', 1);

      underWrap.append('line')
        .attr('id', 'date_line')
        .attr('y1', d.y)
        .attr('x2', (0-70))
        .attr('y2', forced.yScale(new Date(d.date)))
        .attr('x1', (+d.x))
        .attr('stroke', 'black')
        .attr('stroke-width', 1)

    let textWrap = wrap.append('rect').attr('id', 'date_label_bg');

      let text = wrap.append('text')
        .attr('id', 'date_label')
        .text(new Date(d.date).toLocaleDateString('en-us', {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }))
        .attr('text-anchor', 'end')
        .attr('font-size', 9)
        .attr('x', (0-70))
        .attr('y', forced.yScale(new Date(d.date)))
      
      let bB = text.node().getBoundingClientRect();
      
      textWrap.attr('width', bB.width)
      textWrap.attr('height', bB.height)
      .attr('x', (0-(70+ bB.width)))
      .attr('y', (forced.yScale(new Date(d.date)) - bB.height))
      textWrap.attr('fill', '#fff')

    })
    .on('mouseout', (event:any, d:any) => {

      d3.select('#tooltip').style('opacity', 0);
      d3.select('#date_line').remove();
      d3.select('#date_label').remove();
      d3.select('#date_label_bg').remove();

    }).on('click', (event:any, d:any)=> {
      setHoverActivity(d);
    })
  // }, [filteredActivities, eventArray]);

  // return (
  //   <div style={{ flex: flexAmount, paddingTop:'10px', width:svgWidth, display:'inline-block' }}>
  //     <svg
  //       ref={svgRef}
  //       width={svgWidth}
  //       height={height}
  //       style={{ display: 'inline' }}
  //     />
  //     {/* <ToolTip activityData={hoverData} position={toolPosition}/> */}
  //   </div>
  // );
    return svgWrap;
};

const PaperView = (props: any) => {
  const { folderPath } = props;

  const perf = `${path.join(folderPath, 'paper_2020_insights.pdf')}`;
  const linkData = readSync(`${folderPath}/links.json`);
  const anno = d3.groups(JSON.parse(linkData.value.toString()), (d) => d.page);

  const [{ projectData, researchThreads, selectedThread }] = useProjectState();
  
  const index = selectedThread || 0;
  const svgWidth = 600;

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1); // setting 1 to show fisrt page

  const [translateY, setTranslateY] = useState(35);
  const [hoverData, setHoverData] = useState(projectData.entries[0]);
  const [toolPosition, setToolPosition] = useState([0, 0]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function changePage(offset: any) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  const svgRef = React.useRef(null);
  const annoSvgRef = React.useRef(null);
  
  useEffect(() => {

    const pageRectData = [];

    for (let i = 1; i < numPages; i += 1) {
      const annoTemp = anno.filter((a: any) => a[0] === i);
      pageRectData.push({
        pageIndex: i,
        anno: annoTemp.length > 0 ? annoTemp[0][1] : [],
      });
    }

    const bigRectHeight = 792;
    const bigRectWidth = 612;

    ////TRY THIS HERE
    let selectedThreadData = researchThreads?.research_threads[index];
   
    const smallRectHeight = 70;
    const yScaleSmall = d3
    .scaleLinear()
    .domain([0, anno[0][1][0]['pdf-dim'][3]])
    .range([smallRectHeight, 0]);
    
    const svgWrapTest = d3.select(svgRef.current).select('#bubble-wrap');
    const svgWrap = svgWrapTest.empty() ? d3.select(svgRef.current).append('g').attr('id', 'bubble-wrap') : svgWrapTest;

    svgWrap.selectAll('*').remove();

    BubbleVisPaper({
      svg:svgWrap, 
      filteredActivities:projectData.entries,
      setHoverActivity:2,
      flexAmount:2,
      selectedThreadData: selectedThreadData,
      projectData:projectData,
      translateY:translateY, 
      setTranslateY: setTranslateY,
      hoverData: hoverData, 
      setHoverData: setHoverData,
      toolPosition: toolPosition, 
      setToolPosition: setToolPosition
    });
  
    const groupTest = d3.select(svgRef.current).select('.text-group');
  
    const group = groupTest.empty()
      ? d3.select(svgRef.current).append('g').classed('text-group', true)
      : groupTest;
  
    group.attr('transform', 'translate(5, 100)');
  
    console.log('pagerectdata', pageRectData);
  
    const pages = group
      .selectAll('g.pages')
      .data(pageRectData)
      .join('g')
      .classed('pages', true);
    pages.attr(
      'transform',
      (d, i) => `translate(0, ${i * (smallRectHeight + 5)})`
    );
  
    const rect = pages
      .selectAll('rect.pag')
      .data((d: any) => [d])
      .join('rect')
      .classed('pag', true);
  
    rect.attr('width', 50).attr('height', smallRectHeight);
  
    rect.attr('fill', '#C5C5C5');
    rect.attr('fill-opacity', 0.5);
  
    const annog = pages
      .selectAll('rect.anno')
      .data((d: any) => d.anno)
      .join('rect')
      .classed('anno', true);
  
    annog.attr('width', 50);
    annog.attr('height', 5);
  
    annog.attr('y', (d) => {
      return yScaleSmall(d.position['1']);
    });
  
    annog.attr('fill', 'gray');
    annog.attr('opacity', 0.4);
  
    const selectedPage = pages.filter((f: any) => f.pageIndex === pageNumber);
  
    selectedPage
      .selectAll('rect.pag')
      .attr('fill', selectedThreadData.color)
      .attr('fill-opacity', 1);
  
    selectedPage
      .selectAll('rect.anno')
      .attr('fill', '#FFF')
      .attr('opacity', 0.4);

    const yScaleBig = d3
      .scaleLinear()
      .domain([0, anno[0][1][0]['pdf-dim'][3]])
      .range([bigRectHeight, 0]);
    const xScaleBig = d3
      .scaleLinear()
      .domain([0, anno[0][1][0]['pdf-dim'][2]])
      .range([0, bigRectWidth]);

    const svgAnno = d3.select(annoSvgRef.current);
    svgAnno.selectAll('*').remove();

    if (pageRectData.length > 0) {
      const currentRectData = pageRectData.filter(
        (f) => f.pageIndex === pageNumber
      )[0];

      const overlayRect = svgAnno
        .selectAll('rect.annotation_overlay')
        .data(currentRectData ? currentRectData.anno : [])
        .join('rect')
        .classed('annotation_overlay', true);

        if (currentRectData) {
          overlayRect
            .attr('width', (d: any) => d.position[2] - d.position[0])
            .attr('height', 10)
            .attr('x', (d: any) => xScaleBig(d.position[0]))
            .attr('y', (d: any) => yScaleBig(d.position[3]))
            .attr('fill', researchThreads.research_threads[index].color)
            .style('fill-opacity', 0.5);
        }
      }
    }, [numPages, pageNumber, anno]);
  
    return (
      <Flex position="relative" top={70}>
        <Box
          margin="8px"
          p={5}
          flex={1}
          flexDirection="column"
          h="calc(100vh - 80px)"
          overflow="auto"
        >
          <ThreadNav
            researchTs={researchThreads ? researchThreads.research_threads : null}
            viewType="research threads"
          />
        </Box>
        <Box flex={4} h="calc(100vh - 80px)" overflowY="auto" marginTop={15}>
         
          <svg 
            ref={svgRef} 
            style={{
              height:"100%",
              width:"100%"
            }}
          />
          <div
            id="pdf-wrap"
            style={{
              width: '650px',
              height: 'auto',
            }}
          >
            <Document file={perf} onLoadSuccess={onDocumentLoadSuccess}>
              <svg
                style={{
                  position: 'absolute',
                  width: 612,
                  height: 792,
                  zIndex: 1000,
                }}
                ref={annoSvgRef}
              />
              <Page pageNumber={pageNumber} />
            </Document>
  
            <div id="button-wrap" style={{ zIndex: 1050 }}>
              <p
                style={{ textAlign: 'center', fontSize: '12px', padding: '5px' }}
              >
                Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
              </p>
              <button
                type="button"
                disabled={pageNumber <= 1}
                onClick={previousPage}
                style={{
                  marginRight: '10px',
                  backgroundColor: '#818589',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  width: '100px',
                  cursor: 'pointer',
                  boxShadow: '2px 2px 2px 1px #ccc',
                }}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={pageNumber >= numPages}
                onClick={nextPage}
                style={{
                  marginRight: '10px',
                  backgroundColor: '#818589',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  width: '100px',
                  cursor: 'pointer',
                  boxShadow: '2px 2px 2px 1px #ccc',
                }}
              >
                Next
              </button>
            </div>
          </div>
        </Box>
      </Flex>
    );
  };
  
  export default PaperView;