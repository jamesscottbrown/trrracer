import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import * as d3 from 'd3';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';
import ThreadNav from './ThreadNav';
import { useProjectState } from './ProjectContext';
import ForceMagic from '../ForceMagic';
import Bubbles from '../Bubbles';
import { joinPath } from '../fileUtil';

// import { readFileSync } from '../fileUtil';
import {readSync} from 'to-vfile';

const PaperView = (props: any) => {
  const { folderPath } = props;

  // const perf = `${joinPath(folderPath, 'paper_2020_insights.pdf')}`;

  // const filePath = joinPath(folderPath, 'links.json');
  // const linkData = readFileSync(`${folderPath}links.json`);
  // const anno = d3.groups(JSON.parse(linkData), (d) => d.page);
  // console.log('folderpath',folderPath)

  const perf = `${path.join(folderPath, 'paper_2020_insights.pdf')}`;
  const linkData = readSync(`${folderPath}/links.json`);
  const anno = d3.groups(JSON.parse(linkData.value.toString()), (d) => d.page);

  console.log('ANNOO',anno)

  const [{ projectData, researchThreads, selectedThread }] = useProjectState();

  const index = selectedThread || 0;

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1); // setting 1 to show fisrt page

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

  const width = 200;
  const height = 900;

  const svgRef = React.useRef(null);
  const annoSvgRef = React.useRef(null);

  const forced = new ForceMagic(projectData.entries, width, height, false);
  const checktool = d3.select('#tooltip');

  const div = checktool.empty()
    ? d3
        .select('body')
        .append('div')
        .attr('id', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('text-align', 'center')
        .attr('max-width', '150px')
        .attr('height', 2)
        .style('padding', '10px')
        .style('font', '12px sans-serif')
        .style('background', 'white')
        .style('border', '2px solid gray')
        .style('border-radius', '10px')
        .style('pointer-events', 'none')
    : checktool;

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const wrap = svg.append('g').attr('transform', 'translate(0, 20)');

    const nodes = forced.nodes
      .filter((f) =>
        researchThreads.research_threads[index].evidence
          .map((m) => m.activityTitle)
          .includes(f.title)
      )
      .map((m) => {
        m.color = researchThreads.research_threads[index].color;
        return m;
      });

    const notNodes = forced.nodes.filter(
      (f) =>
        researchThreads.research_threads[index].evidence
          .map((m) => m.activityTitle)
          .indexOf(f.title) === -1
    );

    const activityNot = wrap
      .selectAll('g.activity_not')
      .data(notNodes)
      .join('g')
      .attr('class', 'activity_not');

    const activityGroups = wrap
      .selectAll('g.activity')
      .data(nodes)
      .join('g')
      .attr('class', 'activity');

    const bubbleHighlighted = new Bubbles(activityGroups, true, false, null);

    bubbleHighlighted.bubbles
      .on('mouseover', (event, d) => {
        d3.select(event.target)
          .attr('r', d.radius * 2)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);

        const htmlForm = () => {
          const test = researchThreads.research_threads[index].evidence.filter(
            (f) => f.activityTitle === d.title
          );

          let start = `<div style="margin-bottom:10px; font-weight:700">${d.title} <br/>`;
          test.forEach((t) => {
            const type =
              t.type === 'fragment' ? 'Fragment of Artifact' : t.type;
            const artifactTitle =
              t.type === 'fragment' || t.type === 'artifact'
                ? `: ${t.artifactTitle}`
                : '';
            start += `<div><span style="font-weight:700; font-size:14px">${type}</span>${artifactTitle}</div></br>`;
            if (t.type === 'fragment') {
              t.anchors.map((an) => {
                if (an.anchor_type === 'text') {
                  start += `<div style="margin-bottom:10px">${an.frag_type}</div>`;
                }
              });
            }
            start += `<div>Rationale: ${t.rationale}<div>`;
          });

          start += `</div>`;
          return start;
        };

        div.transition().duration(200).style('opacity', 0.9);
        div
          .html(htmlForm)
          .style('left', `${event.pageX}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', (event, d) => {
        d3.select(event.target).attr('r', d.radius).attr('stroke-width', 0);
        div.transition().duration(500).style('opacity', 0);
      });
  }, [projectData, selectedThread]);

  useEffect(() => {
    const pageRectData = [];
    for (let i = 1; i < numPages; i += 1) {
      const annoTemp = anno.filter((a: any) => a[0] === i);
      pageRectData.push({
        pageIndex: i,
        anno: annoTemp.length > 0 ? annoTemp[0][1] : [],
      });
    }

    console.log('page rect data', pageRectData);
    const smallRectHeight = 70;
    const bigRectHeight = 792;
    const bigRectWidth = 612;

    const yScaleSmall = d3
      .scaleLinear()
      .domain([0, anno[0][1][0]['pdf-dim'][3]])
      .range([smallRectHeight, 0]);
    const yScaleBig = d3
      .scaleLinear()
      .domain([0, anno[0][1][0]['pdf-dim'][3]])
      .range([bigRectHeight, 0]);
    const xScaleBig = d3
      .scaleLinear()
      .domain([0, anno[0][1][0]['pdf-dim'][2]])
      .range([0, bigRectWidth]);

    const groupTest = d3.select(svgRef.current).select('.text-group');

    const group = groupTest.empty()
      ? d3.select(svgRef.current).append('g').classed('text-group', true)
      : groupTest;

    group.attr('transform', 'translate(240, 10)');

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
      .attr('fill', researchThreads.research_threads[index].color)
      .attr('fill-opacity', 1);

    selectedPage
      .selectAll('rect.anno')
      .attr('fill', '#FFF')
      .attr('opacity', 0.4);

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
            style={{ display: 'inline' }}
            ref={svgRef}
            width={360}
            height="100%"
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