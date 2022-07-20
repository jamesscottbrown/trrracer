import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { background, Box, calc, Flex } from '@chakra-ui/react';
import * as d3 from 'd3';
import * as hsv from 'd3-hsv';
import * as d3co from 'd3-color';
import { Document, Page, pdfjs } from 'react-pdf/dist/esm/entry.webpack';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
import { readProjectFile, useProjectState } from './ProjectContext';
import { joinPath, readFileSync } from '../fileUtil';
import BubbleVis from './BubbleVis';
import DetailBubble from './DetailSvg';
import DetailPreview from './DetailPreview';
import ProjectListView from './ProjectListView';
import ArtifactDetailSidebar from './ArtifactDetailSidebar';
import ThreadNav from './ThreadNav';
import { IconChartDots3, IconCircle, IconCircles } from '@tabler/icons';
const queryString = require('query-string');

const getName = (parsed: any, activities: any, researchThreads: any) => {
  if (parsed.granularity === 'thread') {
    return researchThreads?.research_threads.filter(
      (f) => f.rt_id === parsed.id
    )[0].title;
  } else if (parsed.granularity === 'activity') {
    return activities.filter((f) => f.activity_uid === parsed.id)[0].title;
  } else if (parsed.granularity === 'artifact') {
    let temp = activities.filter((act) =>
      act.files.map((f) => f.artifact_uid).includes(parsed.id)
    );

    let file = temp[0].files.filter((f) => f.artifact_uid)[0];
    return file.title;
  }
};

const PageNavigation = (props: any) => {
  const {
    pageData,
    pageNumber,
    numPages,
    pageRectData,
    anno,
    onDocumentLoadSuccess,
    previousPage,
    nextPage,
    perf,
    index,
    setToolHtml,
    setPosition,
  } = props;
  const [
    { projectData, researchThreads, folderPath, isReadOnly },
  ] = useProjectState();

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

  useEffect(() => {
    const svgAnno = d3.select(annoSvgRef.current);
    svgAnno.selectAll('*').remove();

    if (pageRectData.length > 0) {
      const currentRectData = pageRectData.filter(
        (f) => f.pageIndex === pageNumber
      )[0];

      const overlayRectA = svgAnno
        .selectAll('rect.annotation_overlay')
        .data(currentRectData ? currentRectData.anno : [])
        .join('a')
        .attr('xlink:href', (d) => d.url);
      const overlayRect = overlayRectA
        .selectAll('rect')
        .data((d) => [d])
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
          .style('cursor', 'pointer');

        overlayRect
          .on('mouseover', (event, d) => {
            let parsed = queryString.parse(d.url);

            setPosition([600, event.clientY]);
            setToolHtml(`<div>
          <span
          style="font-weight:800"
          >Cited ${parsed.granularity}: ${getName(
              parsed,
              projectData.entries,
              researchThreads
            )}</span><br />
          <span
          style="font-style:italic; font-size: 11px"; line-height:1
          >"${d.text[0]}"</span><div>`);
            d3.select('#tooltip-cite').style('opacity', 1);
          })
          .on('mouseout', (event, d) => {
            d3.select('#tooltip-cite').style('opacity', 0);
            setPosition([0, 0]);
          });
      }
    }
  }, [numPages, pageNumber, anno]);

  return (
    <div
      id="pdf-wrap"
      style={{
        width: '650px',
        height: 'auto',
      }}
    >
      <Document
        file={
          isReadOnly ? `data:application/pdf;base64,${pageData}` : { url: perf }
        }
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
        <p style={{ textAlign: 'center', fontSize: '12px', padding: '5px' }}>
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
  );
};

const DetailComponent = (props: any) => {
  const [
    { selectedActivityURL, viewParams, researchThreads, projectData },
  ] = useProjectState();

  let associatedThreads = useMemo(() => {
    console.log(
      'IN DETAIL COMP',
      researchThreads?.research_threads,
      projectData.entries.filter((f) => f.activity_uid === viewParams.id)[0]
    );
    if (viewParams.granularity === 'activity') {
      let proj = projectData.entries.filter(
        (f) => f.activity_uid === viewParams.id
      )[0];
      let temp = researchThreads?.research_threads.filter((rt) => {
        let test = rt.evidence.map((m) => m.activityTitle);
        console.log('TEST', test);
        return test.includes(proj.title);
      });
      return [];
    } else {
      return [];
    }
  }, [viewParams.granularity]);

  if (viewParams.granularity === 'artifact') {
    return (
      <div>
        <ArtifactDetailSidebar />
      </div>
    );
  }
  return (
    <div style={{ height: '100vh' }}>
      {viewParams.granularity === 'thread' && <ThreadNav viewType={'paper'} />}
      <div style={{ overflow: 'auto', height: '100vh' }}>
        <ProjectListView />
      </div>
      {associatedThreads.length > 0 && viewParams.granularity === 'activity' ? (
        <Box
          flex="2"
          overflowY="auto"
          boxShadow={'3px 3px 8px #A3AAAF'}
          border={'1px solid #A3AAAF'}
          borderRadius={6}
          p={5}
        >
          ACTIVITY HAS A THRED
        </Box>
      ) : (
        <Box
          flex="2"
          overflowY="auto"
          boxShadow={'3px 3px 8px #A3AAAF'}
          border={'1px solid #A3AAAF'}
          borderRadius={6}
          p={5}
        >
          Activity is not associated with any threads
        </Box>
      )}
    </div>
  );
};

const CitationIcon = (props: any) => {
  const { link, setPosition, setHTML, index, rectWidth } = props;
  const [{ projectData, researchThreads }] = useProjectState();

  let moveBack = rectWidth - 20;
  const parsed = queryString.parse(link.url);

  const calcPos = (i: number) => {
    let xMove = i < 9 ? i * 22 : (i - 9) * 22;
    let x = moveBack - xMove;
    let y = i < 9 ? 0 : 22;
    return `translate(${x},${y})`;
  };

  return (
    <g
      onMouseOver={(event) => {
        setPosition([200, event.clientY - 50]);
        setHTML(`<div>
      <span
      style="font-weight:800"
      >Cited ${parsed.granularity}: ${getName(
          parsed,
          projectData.entries,
          researchThreads
        )}</span><br />
      <span
      style="font-style:italic; font-size: 11px"; line-height:1
      >"${link.text[0]}"</span><div>`);
        d3.select('#tooltip-cite').style('opacity', 1);
      }}
      onMouseOut={() => {
        d3.select('#tooltip-cite').style('opacity', 0);
        setPosition([0, 0]);
      }}
      transform={calcPos(index)}
    >
      <a href={link.url}>
        <WhichFA link={link} index={index} />
      </a>
    </g>
  );
};

const WhichFA = (props: any) => {
  const { link, index } = props;
  const [{ viewParams }] = useProjectState();

  let param = queryString.parse(link.url);

  if (param.granularity === 'thread') {
    return (
      <g>
        <circle
          r={10}
          cx={10}
          cy={10}
          fill={+viewParams.cIndex === +param.cIndex ? '#ff2626' : '#d3d3d3'}
        />
        <IconChartDots3
          size={20}
          color={+viewParams.cIndex === +param.cIndex ? '#ffffff' : 'gray'}
        />
      </g>
    );
  }
  if (param.granularity === 'activity') {
    return (
      <g>
        <circle
          r={10}
          cx={10}
          cy={10}
          fill={+viewParams.cIndex === +param.cIndex ? '#ff2626' : '#d3d3d3'}
        />
        <IconCircles
          size={20}
          color={+viewParams.cIndex === +param.cIndex ? '#ffffff' : 'gray'}
        />
      </g>
    );
  }
  return (
    <g transform={'translate(2, 2)'}>
      <circle
        r={8}
        cx={10}
        cy={10}
        fill={+viewParams.cIndex === +param.cIndex ? '#ff2626' : '#d3d3d3'}
      />
      <g transform={'translate(4, 4)'}>
        <IconCircle
          size={13}
          color={+viewParams.cIndex === +param.cIndex ? '#ffffff' : 'gray'}
        />
      </g>
    </g>
  );
};

const CitationVis = (props: any) => {
  const {
    anno,
    pageNumber,
    index,
    pageRectData,
    setPosition,
    setToolHtml,
  } = props;
  const [{ linkData, viewParams }] = useProjectState();
  const svgRef = React.useRef(null);
  // const [position, setPosition] = useState([0,0]);
  // const [html, setHTML] = useState('<div>This is a start</div>')
  const iconSize = 20;
  const rectHeight = 792 / 10 - 10;
  const maxAnno = d3.max(pageRectData.map((m) => m.anno.length));

  const calWidth = (dataLen: any) => {
    if (dataLen > 8) {
      return 8 * (iconSize + 3);
    } else {
      return dataLen * (iconSize + 3);
    }
  };

  return (
    <div style={{ position: 'absolute', right: '650px', top: '90px' }}>
      {/* <div
        id={'tooltip-cite'}
        style={{
          position:'absolute',
          left: position[0],
          top: position[1] - 150,
          textAlign: 'center',
          width:450,
          minHeight:50,
          padding:10,
          backgroundColor: '#fff',
          border: '2px solid gray',
          borderRadius: 10,
          pointerEvents:'none',
          zIndex: 6000,
          opacity: 0
        }}
        dangerouslySetInnerHTML={{__html: html}}
      ></div> */}
      <svg
        style={{
          height: '800px',
          width: `${calWidth(maxAnno)}px`,
        }}
        ref={svgRef}
      >
        {pageRectData.map((prd, i) => (
          <g
            transform={`translate(${
              calWidth(maxAnno) - calWidth(prd.anno.length) - 10
            }, ${rectHeight * i + 2})`}
          >
            <rect
              height={rectHeight}
              width={prd.anno.length > 0 ? calWidth(prd.anno.length) + 10 : 23}
              fill={'#d3d3d3'}
              fillOpacity={i + 1 === pageNumber ? 0.7 : 0.25}
            />
            <g
              transform={`translate(0, ${
                prd.anno.length > 8 ? rectHeight / 4 : rectHeight / 3
              })`}
            >
              {prd.anno.map((link, j) => (
                <CitationIcon
                  link={link}
                  index={j}
                  setPosition={setPosition}
                  setHTML={setToolHtml}
                  granularity={viewParams.granularity}
                  rectH={rectHeight}
                  total={prd.anno.length}
                  rectWidth={calWidth(prd.anno.length)}
                />
              ))}
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
};

const PaperView = (props: any) => {
  const { folderPath } = props;
  // const perf = joinPath(folderPath, 'paper_2020_insights.pdf');
  const perf = joinPath(folderPath, '2022_trevo_new_links.pdf');
  const [
    { selectedThread, linkData, isReadOnly, viewParams },
    dispatch,
  ] = useProjectState();

  let passedLink = linkData
    ? linkData.filter((f) => f.cIndex === viewParams.cIndex)
    : [];
  const anno = linkData ? d3.groups(linkData, (d) => d.page) : null;
  const index = selectedThread || 0;
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1); // setting 1 to show fisrt page
  const [bubbleDivWidth, setBubbleDivWidth] = useState(200);
  const [pageData, setPageData] = useState('');
  const [htmlData, setHtmlData] = useState('');
  const [beenClicked, setBeenClicked] = useState(false);
  const [position, setPosition] = useState([0, 0]);
  const [toolhtml, setToolHtml] = useState('<div>This is a start</div>');

  // console.log('in paper view',viewParams);
  // if(isReadOnly){
  //   readFileSync('2020_trevo.html')
  //   .then((res) => res.text())
  //   .then((pap)=> {
  //     console.log('html!!!', pap);
  //     setHtmlData(pap);
  // });
  // }

  useEffect(() => {
    if (passedLink.length > 0 && !beenClicked)
      setPageNumber(passedLink[0].page);
  }, [passedLink]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function changePage(offset: any) {
    setBeenClicked(true);
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

  useEffect(() => {
    if (isReadOnly) {
      readFileSync(perf)
        .then((res) => res.text())
        .then((pap) => {
          setPageData(pap);
        });
    } else {
      setPageData(perf);
    }
  }, [folderPath, perf]);

  return linkData ? (
    <div
      style={{
        position: 'relative',
        top: 70,
        width: '100%',
        height: 'calc(100% - 70px)',
      }}
    >
      {/* <div style={{float:'left', width:'800px', border:'1px solid gray'}}>
        {htmlData != '' ? 
        <div style={{width:'95%', overflowY:'auto'}} dangerouslySetInnerHTML={{__html: htmlData}}></div> 
        : <div>{"NO PAPER LOADED"}</div>}
        </div> */}

      <div
        style={{
          float: 'left',
          width: 'calc(100vw - 700px)',
          display: 'block',
          margin: 20,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            height: '100vh',
            float: 'left',
            width: '350px',
          }}
        >
          <DetailComponent />
        </div>
        <div style={{ height: '100%', float: 'left' }}>
          {viewParams && viewParams.granularity === 'artifact' ? (
            <div>
              <DetailPreview openFile={null} />
            </div>
          ) : (
            <BubbleVis
              groupBy={null}
              setGroupBy={null}
              flexAmount={null}
              setDefineEvent={null}
              defineEvent={null}
              bubbleDivWidth={bubbleDivWidth}
              setBubbleDivWidth={setBubbleDivWidth}
            />
          )}
          <CitationVis
            anno={anno}
            pageNumber={pageNumber}
            pageRectData={pageRectData}
            index={index}
            setToolHtml={setToolHtml}
            setPosition={setPosition}
          />
        </div>
        <Box flex={4} h="calc(100vh - 80px)" overflowY="auto" marginTop={5}>
          {pageData !== '' && (
            <PageNavigation
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
              setToolHtml={setToolHtml}
              setPosition={setPosition}
            />
          )}
        </Box>
      </div>
      <div
        id={'tooltip-cite'}
        style={{
          position: 'absolute',
          right: position[0],
          top: position[1] - 150,
          textAlign: 'center',
          width: 450,
          minHeight: 50,
          padding: 10,
          backgroundColor: '#fff',
          border: '2px solid gray',
          borderRadius: 10,
          pointerEvents: 'none',
          zIndex: 6000,
          opacity: 0,
        }}
        dangerouslySetInnerHTML={{ __html: toolhtml }}
      ></div>
    </div>
  ) : (
    <div
      style={{
        display: 'flex',
        paddingTop: 200,
        fontSize: 30,
        fontWeight: 800,
        justifyContent: 'center',
      }}
    >
      {
        'Oops! There is not a paper to explore for this project yet. Check back later!'
      }
    </div>
  );
};

export default PaperView;
