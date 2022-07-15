import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { background, Box, Flex } from '@chakra-ui/react';
import * as d3 from 'd3';
import * as hsv from 'd3-hsv';
import * as d3co from 'd3-color';
import { Document, Page, pdfjs } from 'react-pdf/dist/esm/entry.webpack';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

import { readProjectFile, useProjectState } from './ProjectContext';
import { joinPath, readFileSync } from '../fileUtil';
import BubbleVis from './BubbleVis';
import { DetailSidebar } from './ArtifactDetailWindow';
import DetailBubble from './DetailSvg';
import DetailPreview from './DetailPreview';
import ProjectListView from './ProjectListView';

const SmallPageNavigation = (props: any) => {

  const { anno, pageNumber, index, pageRectData } = props;
  const [{researchThreads}] = useProjectState();

  let selectedThreadData = researchThreads?.research_threads[index];

  const svgSmallPagesRef = React.useRef(null);
  const smallRectHeight = 60;

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
  
  rect.attr('width', 45).attr('height', smallRectHeight);
  
  rect.attr('fill', '#C5C5C5');
  rect.attr('fill-opacity', 0.5);

  const links = pages
  .selectAll('a.anno-link')
  .data((d: any) => d.anno)
  .join('a')
  .classed('anno-link', true);

  links.attr("xlink:href", (d)=> d.url);

  const annog = links
    .selectAll('rect.anno')
    .data((d: any) => [d])
    .join('rect')
    .classed('anno', true);
  
  annog.attr('width', 45);
  annog.attr('height', 5);

  annog.attr('y', (d) => {
    return yScaleSmall(d.position['1']);
  });

  annog.attr('fill', 'gray');
  annog.attr('opacity', 0.4);
  annog.style('cursor', 'pointer')

  annog.on('mouseover', (event, d)=>{
    console.log(event, d);
    let tool = d3.select('#tooltip')
    tool.style('opacity', 1).style('position', 'absolute').style('top', event.screenY).style('right', event.clientX);
    tool.html(`<div><div
    style="font-weight:800"
    >Citing Text:</div><span style="font-style: italic; font-size: 11px">${d.text[0]}</span></div>`)
    
  }).on('mouseout', (event, d)=> {
    let tool = d3.select('#tooltip')
    tool.style('opacity', 0)
  })

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
        top:'90px',
        right:'650px'
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

    const overlayRectA = svgAnno
      .selectAll('rect.annotation_overlay')
      .data(currentRectData ? currentRectData.anno : [])
      .join('a').attr("xlink:href", (d)=> d.url);
      const overlayRect = overlayRectA.selectAll('rect').data(d => [d]).join('rect')
      .classed('annotation_overlay', true); 

      if (currentRectData) {
        overlayRect
          .attr('width', (d: any) => d.position[2] - d.position[0])
          .attr('height', 10)
          .attr('x', (d: any) => xScaleBig(d.position[0]))
          .attr('y', (d: any) => yScaleBig(d.position[3]))
          .attr('fill', 'red')
          .style('fill-opacity', 0.5)
          .style('cursor', 'pointer')
          
        overlayRect.on('mouseover', (event, d)=> {
          console.log(d);
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

const DetailComponent = (props:any) => {
  const [{selectedArtifactEntry}] = useProjectState();
  if(selectedArtifactEntry){
    return (  
      <div>
        <DetailSidebar />
      </div>
    )
  }
  return  (
    <div>
      <ProjectListView />
    </div>
  )
  
}

const PaperView = (props: any) => {
  const { folderPath, granularity, cIndex, id } = props;
  const perf = joinPath(folderPath, 'paper_2020_insights.pdf');
  
  const [{ projectData, researchThreads, selectedThread, selectedArtifactIndex, selectedActivityURL, selectedArtifactEntry, linkData, filteredActivities, isReadOnly }, dispatch] = useProjectState();

  let passedLink = linkData ? linkData.filter(f=> f.cIndex === cIndex) : [];

  console.log('passedLink',passedLink)
  const anno = linkData ? d3.groups(linkData, (d) => d.page): null;
  const index = selectedThread || 0;
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(passedLink.length > 0 ? passedLink[0].page : 1); // setting 1 to show fisrt page
  const [bubbleDivWidth, setBubbleDivWidth] = useState(200);

  useEffect(()=> {
    passedLink.length > 0 ? setPageNumber(passedLink[0].page) : setPageNumber(1)
  }, [passedLink]);

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
  
    return (
      linkData ? 
      <div style={{position:"relative", top:70, width:'100%', height: 'calc(100% - 70px)'}}>
   
        <div style={{float:'left', width:'calc(100vw - 700px)', display:"block", margin:20}}>
          <div style={{display:'inline-block', height:'100vh', float:'left', width:'250px'}}>
            <DetailComponent />
          </div>
          <div style={{height: '100%', float:'left'}}>
            {
              selectedArtifactEntry ? 
              <div>
                <DetailPreview 
                 openFile={null} 
                />
                </div> :
                <BubbleVis 
                  groupBy={null}
                  setGroupBy={null}
                  flexAmount={null}
                  setDefineEvent={null}
                  defineEvent={null}
                  bubbleDivWidth={bubbleDivWidth}
                  setBubbleDivWidth={setBubbleDivWidth} />
              }
              {/* <SmallPageNavigation 
                anno={anno} 
                pageNumber={pageNumber} 
                pageRectData={pageRectData}
                index={index}
              /> */}
          </div>
          <Box flex={4} h="calc(100vh - 80px)" 
            overflowY="auto" marginTop={5}>
           
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
          </Box>
        </div>
      </div> : <div
      style={{display:'flex', paddingTop:200, fontSize:30, fontWeight:800, justifyContent:'center'}}
      
      >{"Oops! There is not a paper to explore for this project yet. Check back later!"}</div>
    );
  };
  
export default PaperView;