import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import * as d3 from 'd3';
import { Document, Page, pdfjs } from 'react-pdf/dist/esm/entry.webpack';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

import ThreadNav from './ThreadNav';
import { readProjectFile, useProjectState } from './ProjectContext';
import ForceMagic from '../ForceMagic';
import Bubbles from '../Bubbles';
import { calcCircles } from '../PackMagic';
import { dataStructureForTimeline } from './VerticalAxis';
import { getIndexOfMonth } from '../timeHelperFunctions';
import { joinPath, readFileSync } from '../fileUtil';

const BubbleVisPaper = (props: any) => {
  const {
    selectedThreadData,
    translateY,
    setTranslateY,
  } = props;

  const [{projectData, filteredActivities, researchThreads, selectedActivityURL, filterRT, selectedThread, filterType, filterTags}] = useProjectState();
 
  const {eventArray} = projectData;

  const svgBubbleRef = React.useRef(null);
 
  const width = 300;
  const height = 1000;

  let packedCircData = useMemo(() => calcCircles([...projectData.entries]), [projectData.entries.length, projectData.entries.flatMap(f => f.files).length]);
  const forced = useMemo(() => new ForceMagic(packedCircData, width, height), [packedCircData, width, height]);

  d3.select('#tooltip').style('opacity', 0);

  const svgWrapTest = d3.select(svgBubbleRef.current).select('#bubble-wrap');
  const svgWrap = svgWrapTest.empty() ? d3.select(svgBubbleRef.current).append('g').attr('id', 'bubble-wrap') : svgWrapTest;

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
  
  activityBubbles.bubbles.attr('fill', '#d3d3d3').attr('opacity', .3).attr('stroke', '#d3d3d3').attr('stroke-width', .4);
  let artifactCircles = allActivityGroups.selectAll('circle.artifact').data(d => d.files).join('circle').classed('artifact', true);
  artifactCircles.attr('r', d => (3)).attr('cx', d => d.x).attr('cy', d => d.y);
  
  let highlightedActivities = (selectedActivityURL !== null) ? allActivityGroups.filter((ac) => ac.activity_uid === selectedActivityURL)
  : allActivityGroups.filter((ac) => filteredActivities.map((m:any) => m.title).includes(ac.title));
 
   highlightedActivities.select('.all-activities')
   .on('mouseover', (event, d) => {
     if(filterRT){
       d3.select(event.target).attr('stroke', 'gray').attr('stroke-width', 2);
     }else if(filterType || filterTags.length > 0){
       d3.select(event.target).attr('stroke', 'gray').attr('stroke-width', 1);
     }else if(selectedActivityURL !== null){
       highlightedActivities.select('.all-activities').attr('fill-opacity', 1);
       highlightedActivities.select('.all-activities').attr('stroke-width', 1).attr('stroke', 'red');
       let highlightedCircles = highlightedActivities.selectAll('circle.artifact');
       highlightedCircles.attr('fill', 'white');
     }else{
       d3.select(event.target).attr('fill', 'gray');
     }
    
   }).on('mouseout', (event, d) => {
     if(filterRT){
     d3.select(event.target).attr('stroke-width', 0);
     }else if(filterType || filterTags.length > 0){
 
     d3.select(event.target).attr('fill', 'gray').attr('fill-opacity', .5);
     d3.select(event.target).attr('stroke', 'gray').attr('stroke-width', 0);
 
     }else if(selectedActivityURL !== null){
      highlightedActivities.select('.all-activities').attr('fill-opacity', .5);
      let highlightedCircles = highlightedActivities.selectAll('circle.artifact');
      highlightedCircles.attr('fill', 'gray');
     }else{
     d3.select(event.target).attr('fill', '#d3d3d3').attr('stroke', '#d3d3d3').attr('stroke-width', .5);
     }
   });

   if(filterType){
    highlightedActivities.select('.all-activities').attr('fill', 'gray').attr('fill-opacity', .5);
    highlightedActivities.select('.all-activities').attr('stroke-width', 0);
    let highlightedCircles = highlightedActivities.selectAll('circle.artifact').filter(f=> f.artifactType === filterType);
    highlightedCircles.attr('fill', 'gray').attr('fill-opacity', 1);
    let highlightedCirclesNOT = highlightedActivities.selectAll('circle.artifact').filter(f=> f.artifactType != filterType);
    highlightedCirclesNOT.attr('fill', '#fff').attr('fill-opacity', .7);
  }else if(filterTags.length > 0){
    highlightedActivities.select('.all-activities').attr('fill', 'gray').attr('fill-opacity', .5);
    highlightedActivities.select('.all-activities').attr('stroke-width', 0);
    let highlightedCircles = highlightedActivities.selectAll('circle.artifact');
    highlightedCircles.attr('fill', 'gray');
  }else if(selectedActivityURL !== null){
    highlightedActivities.select('.all-activities').attr('fill', 'red').attr('fill-opacity', .5);
    highlightedActivities.select('.all-activities').attr('stroke-width', 1).attr('stroke', 'red');
    let highlightedCircles = highlightedActivities.selectAll('circle.artifact');
    highlightedCircles.attr('fill', 'gray');
  }else{
    let highlightedCircles = highlightedActivities.selectAll('circle.artifact');
    highlightedCircles.attr('fill', 'gray');
  }

  let hiddenCircles = (selectedActivityURL !== null) ? allActivityGroups.filter((ac) => ac.activity_uid !== selectedActivityURL)
  : allActivityGroups.filter((ac) => filteredActivities.map((m:any) => m.title).indexOf(ac.title) === -1).selectAll('circle.artifact');

  hiddenCircles.attr('fill', 'gray')
  .attr('fill-opacity', .3);

  if(filterRT && researchThreads?.research_threads[selectedThread].evidence.length > 0){
   
    let linkDataBefore = [];
    let linkDataAfter = [];

    researchThreads?.research_threads[selectedThread].evidence.forEach(f => {
      let temp = highlightedActivities.filter(ha => ha.title === f.activityTitle);
    
      let chosenActivityData = temp.select('.all-activities').data()[0];

    
  //   if(f.type === 'activity'){
  //     temp.select('.all-activities')
  //       .attr('fill', researchThreads?.research_threads[selectedThread].color);
    
  //   }else if(f.type === 'artifact' || f.type === 'fragment'){
     
  //     temp
  //       .select('circle.background')
  //       .attr('fill-opacity', 1);
  //     temp.selectAll('circle.artifact')
  //       .filter(art => art.title === f.artifactTitle)
  //       .attr('fill', researchThreads?.research_threads[selectedThread].color);
  //     temp.select('circle.all-activities')
  //       .attr('fill', researchThreads?.research_threads[selectedThread].color);
  //   }
      
  //   let divideDate = new Date(researchThreads?.research_threads[selectedThread].actions.filter(f => f.action === 'created')[0].when);

  //   if(new Date(chosenActivityData.date) < divideDate){
  //     linkDataBefore.push({coord: [chosenActivityData.x, chosenActivityData.y], date: chosenActivityData.date})
  //   }else{
  //     linkDataAfter.push({coord: [chosenActivityData.x, chosenActivityData.y], date: chosenActivityData.date})
  //   }
  })

  // var lineGenerator = d3.line();

  //   if(linkDataAfter.length > 0){

  //     linkDataAfter = linkDataAfter.sort((a, b) => new Date(a.date) - new Date(b.date));

  //     var pathStringSolid = lineGenerator(linkDataAfter.map(m=> m.coord));

  //     underWrap.append('path')
  //     .attr('d', pathStringSolid)
  //     .attr('fill', 'none')
  //     .attr('stroke', researchThreads?.research_threads[selectedThread].color)
  //     .attr('stroke-width', 2);

  //   }
  //   if(linkDataBefore.length > 0){

  //     linkDataBefore = linkDataBefore.sort((a, b) => new Date(a.date) - new Date(b.date));
  //     if(linkDataAfter.length > 0) linkDataBefore.push(linkDataAfter[0])
      
  //     var pathStringDash = lineGenerator(linkDataBefore.map(m=> m.coord));
      
  //     underWrap.append('path')
  //       .attr('d', pathStringDash)
  //       .attr('fill', 'none')
  //       .attr('stroke', researchThreads?.research_threads[selectedThread].color)
  //       .attr('stroke-width', 2)
  //       .style('stroke-dasharray', '5,5');
    // }
  }

highlightedActivities
    // .on('mouseover', (event, d) => {
      
    //   setToolPosition([d.x, d.y])
    //   setHoverData(d);
    //   d3.select('#tooltip').style('opacity', 1);

    //   let labelGTest = wrap.select('.timeline-wrap').select('#label-group');
    //   let labelG = labelGTest.empty() ? svg.select('.timeline-wrap').append('g').attr('id', 'label-group') : labelGTest;
    //   labelG.attr('transform', `translate(0, ${forced.yScale(new Date(d.date))})`)

    //   let rect = labelG.append('rect')
    //   rect.attr('width', 50)
    //   .attr('height', 15)
    //   .attr('fill', '#fff')
    //   .attr('fill-opacity', .9);
    //   rect.attr('x', -50).attr('y', -12);

    //   let text = labelG
    //   .append('text')
    //   .text(new Date(d.date).toLocaleDateString('en-us', {
    //     weekday: 'long',
    //     year: 'numeric',
    //     month: 'short',
    //     day: 'numeric',
    //   })).style('font-size', 9)
    //   .style('text-anchor', 'end')
    //   .style('font-weight', 600)

    //     underWrap.append('line')
    //     .attr('id', 'date_line')
    //     .attr('y1', d.y)
    //     .attr('x2', (0-70))
    //     .attr('y2', forced.yScale(new Date(d.date)))
    //     .attr('x1', (+d.x))
    //     .attr('stroke', 'black')
    //     .attr('stroke-width', 1)
      
    // })
    // .on('mouseout', (event:any, d:any) => {
  
    //   d3.select('#tooltip').style('opacity', 0);
    //   d3.select('#date_line').remove();
    //   d3.select('#label-group').remove();
  
    // }).on('click', (event:any, d:any)=> {
     
    //   let activities = d3.selectAll('.list-activity').filter((f, i, n)=> {
    //     return d3.select(n[i]).attr('id') === d.title;
    //   });
    //   activities.nodes()[0].scrollIntoView({ behavior: 'smooth', block: 'start' })
    // })


    return (
      <svg 
      height={height}
      width={width+200}
      ref={svgBubbleRef}
      />
    )
};

const SmallPageNavigation = (props: any) => {

  const { anno, pageNumber, index, pageRectData } = props;
  const [{researchThreads}] = useProjectState();

  let selectedThreadData = researchThreads?.research_threads[index];

  const svgSmallPagesRef = React.useRef(null);
  const smallRectHeight = 70;

  const yScaleSmall = d3
  .scaleLinear()
  .domain([0, anno[0][1][0]['pdf-dim'][3]])
  .range([smallRectHeight, 0]);

  const groupTest = d3.select(svgSmallPagesRef.current).select('.text-group');
  
  const group = groupTest.empty()
      ? d3.select(svgSmallPagesRef.current).append('g').classed('text-group', true)
      : groupTest;
  
  group.attr('transform', 'translate(5, 100)');
  
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

  return (
    <div
      style={{
        height:"100%",
        position:'absolute',
        right:650
      }}
    >
      <svg 
        ref={svgSmallPagesRef} 
        style={{
          height:"100%",
          width:"70px",
        }}
      />
    </div>
  )
}

const PageNavigation = (props:any) => {

  const { pageData, pageNumber, numPages, pageRectData, anno, onDocumentLoadSuccess, previousPage, nextPage, perf, index } = props;
  const [{researchThreads, folderPath, isReadOnly}] = useProjectState();
  
  const bigRectHeight = 792;
  const bigRectWidth = 612;
  const annoSvgRef = React.useRef(null);

  const yScaleBig = d3
  .scaleLinear()
  .domain([0, anno[0][1][0]['pdf-dim'][3]])
  .range([bigRectHeight, 0]);

  const xScaleBig = d3
    .scaleLinear()
    .domain([0, anno[0][1][0]['pdf-dim'][2]])
    .range([0, bigRectWidth]);

  useEffect(()=> {

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
          .attr('fill', 'red')
          .style('fill-opacity', 0.5)
          .attr("xlink:href", (d)=> d.url);

        overlayRect.on('mouseover', (event, d)=> {
          console.log(d);
        }).on('click', (event, d)=> {
          console.log(d.url)
        })
      }
  }

}, [numPages, pageNumber, anno])

  return(
    <div
      id="pdf-wrap"
      style={{
        width: '650px',
        height: 'auto'
      }}
    >
      <Document 
        file={isReadOnly ? `data:application/pdf;base64,${pageData}`: {url: perf}}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={() => `ERRORRR ${console.error}`}
      >
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
  )

}

const PaperView = (props: any) => {
  const { folderPath, granularity, cIndex, id } = props;
  const perf = joinPath(folderPath, 'paper_2020_insights.pdf');
  
  const [{ projectData, researchThreads, selectedThread, linkData, filteredActivities, isReadOnly }, dispatch] = useProjectState();

  let passedLink = linkData ? linkData.filter(f=> f.cIndex === cIndex) : linkData;

  const anno = linkData ? d3.groups(linkData, (d) => d.page): null;
 
  const index = selectedThread || 0;
  const svgWidth = 600;

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1); // setting 1 to show fisrt page
  
  const [translateY, setTranslateY] = useState(35);
  const [hoverData, setHoverData] = useState(projectData.entries[0]);
  const [toolPosition, setToolPosition] = useState([0, 0]);

  function onDocumentLoadSuccess({ numPages }) {
    console.log('ID THIS WORKING??')
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

  const pageRectData = useMemo(() => {

    const pageData = [];

    for (let i = 1; i < numPages; i += 1) {
      const annoTemp = anno.filter((a: any) => a[0] === i);
      pageData.push({
        pageIndex: i,
        anno: annoTemp.length > 0 ? annoTemp[0][1] : [],
      });
    }

    return pageData;
  }, [numPages]);  

  const [pageData, setPageData] = useState('');
  
 useEffect(() => {

  if(isReadOnly){

    readFileSync(perf)
    .then((res) => res.text())
    .then((pap)=> {
      setPageData(pap);
  });
  }else{
    setPageData(perf);
  }

 }, [folderPath, perf]);

 
  
  useEffect(() => {
    console.log(pageData, 'pageData');
  }, [pageData]);
  
    return (
      linkData ? 
      <div style={{position:"relative", top:70, width:'100%'}}>
        <div
          style={{display:"block", margin:20}}
        >   
        {
          passedLink.length > 0 && (
            <React.Fragment>
              {
                passedLink.map((m, i) => (
                  <div>
                    <div
                      style={{display:'inline', paddingRight:10}}
                    >
                      <div
                      style={{display: 'inline', fontWeight:800, fontSize:30}}
                      >{`T${m.cIndex}-`}</div>
                      <div
                      style={{display: 'inline', fontWeight:800, fontSize:30}}
                      >{granularity}</div>
                    </div>
                    {
                      m.text.map((t, j) => (
                        <div
                          style={{display:'inline', fontSize:20, fontStyle:'italic'}}
                        >{
                          `"${t}"`
                        }</div>
                      ))
                    }
                  </div>
                ))
              }
            </React.Fragment>
          )
        }
          
          </div>
        <Flex>
          <Box
            margin="8px"
            p={5}
            flex={1}
            flexDirection="column"
            h="calc(100vh - 80px)"
            overflow="auto"
       
          >
            <ThreadNav
              viewType="research threads"
            />
          </Box>
          <Box flex={4} h="calc(100vh - 80px)" 
          
          overflowY="auto" marginTop={5}>
            {/* <SmallPageNavigation 
              anno={anno} 
              pageNumber={pageNumber} 
              pageRectData={pageRectData}
              index={index}
            /> */}
            {pageData !== '' && (<PageNavigation
              pageData={pageData} 
              index={index}
              onDocumentLoadSuccess={onDocumentLoadSuccess} 
              pageNumber={pageNumber} 
              numPages={numPages} 
              previousPage={previousPage} 
              nextPage={nextPage}
              pageRectData={pageRectData}
              perf={perf}
              anno={anno}
            />)}

            <BubbleVisPaper  
              selectedThreadData={selectedThread}
              setTranslateY={setTranslateY}
              translateY={translateY}
            />
          
          </Box>
        </Flex>
      </div> : <div
      style={{display:'flex', paddingTop:200, fontSize:30, fontWeight:800, justifyContent:'center'}}
      
      >{"Oops! There is not a paper to explore for this project yet. Check back later!"}</div>
    );
  };
  
export default PaperView;