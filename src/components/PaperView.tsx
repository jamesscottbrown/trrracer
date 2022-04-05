import React, { useEffect, useLayoutEffect, useState } from "react";
import * as fs from 'fs';
import { Box, Flex } from "@chakra-ui/react";
import ThreadNav from "./ThreadNav";
import { useProjectState } from "./ProjectContext";
import * as d3 from 'd3';
import ForceMagic from '../ForceMagic';
import Bubbles from '../Bubbles';
import path from "path";
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';


const PaperView = (props:any) => {
    const {folderPath} = props;

    const perf = `${path.join(folderPath, 'paper_2020_trevo_CR (1).pdf')}`;

    console.log('PERF',perf)

    const filePath = path.join(folderPath, 'trevo-html-test.html');
    const fileContents = fs.readFileSync(filePath, { encoding: 'utf-8' });
 
    const [
        {
          projectData,
          researchThreads,
          selectedThread
        },
        dispatch,
      ] = useProjectState();

    const [paragraphData, setParagraphData] = useState([]);

    let index = selectedThread ? selectedThread : 0;

    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1); //setting 1 to show fisrt page
  
    function onDocumentLoadSuccess({ numPages }) {
      setNumPages(numPages);
      setPageNumber(1);
    }
  
    function changePage(offset:any) {
      setPageNumber(prevPageNumber => prevPageNumber + offset);
    }
  
    function previousPage() {
      changePage(-1);
    }
  
    function nextPage() {
      changePage(1);
    }

    const headerStyle = { fontSize: '30px', fontWeight: 700, marginBottom:20 };
    const width = 200;
    const height = 900;
  
    const svgRef = React.useRef(null);
    const iframeRef = React.useRef(null);

    const forced = new ForceMagic(projectData.entries, width, height, false);
    const checktool = d3.select('#tooltip');
    const div = checktool.empty() ? 
      d3.select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("opacity", 0) 
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
  
    useEffect(()=> {

      let svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();
  
      let wrap = svg.append('g').attr('transform', 'translate(0, 20)');
    
      //researchThreads.research_threads[selectedThread]
      let nodes = forced.nodes.filter(f => researchThreads.research_threads[index].evidence.map(m=> m.activityTitle).includes(f.title)).map(m => {
        m.color = researchThreads.research_threads[index].color;
        return m;
      })
      let notNodes = forced.nodes.filter(f => researchThreads.research_threads[index].evidence.map(m=> m.activityTitle).indexOf(f.title) === -1)
  
      let activityNot = wrap.selectAll('g.activity_not')
      .data(notNodes).join('g').attr('class', 'activity_not');
  
      let activityGroups = wrap.selectAll('g.activity')
      .data(nodes).join('g').attr('class', 'activity');
  
      let bubbleNotHighlighted = new Bubbles(activityNot, false, false, null);
      let bubbleHighlighted = new Bubbles(activityGroups, true, false, null);
  
      bubbleHighlighted.bubbles.on('mouseover', (event, d)=> {
        d3.select(event.target).attr('r', (d.radius * 2)).attr('stroke', '#fff').attr('stroke-width', 2);
  
        let htmlForm = () => {
          let test = researchThreads.research_threads[index].evidence.filter(f => f.activityTitle === d.title)
        
          let start = `<div style="margin-bottom:10px; font-weight:700">${d.title} <br/>`
          test.forEach((t)=> {
            let type = t.type === 'fragment' ? 'Fragment of Artifact' : t.type;
            let artifactTitle = t.type === 'fragment' || t.type === 'artifact' ? `: ${t.artifactTitle}` : '';
            start = start + `<div><span style="font-weight:700; font-size:14px">${type}</span>${artifactTitle}</div></br>`
            if(t.type === 'fragment'){
              t.anchors.map(an => {
                if(an.anchor_type === 'text'){
                  start = start + `<div style="margin-bottom:10px">${an.frag_type}</div>`
                }
              })
            }
            start = start + `<div>Rationale: ${t.rationale}<div>`
          })
          
            start = start + `</div>`
            return start;
        }
  
        div.transition()
            .duration(200)
            .style("opacity", .9);
        div.html(htmlForm)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");
  
        }).on('mouseout', (event, d)=> {
            d3.select(event.target).attr('r', (d.radius)).attr('stroke-width', 0);
            div.transition()
            .duration(500)
            .style("opacity", 0);
        });
  
    }, [projectData, selectedThread]);


    useEffect(()=> {
        let test = d3.select("#divtext").selectAll('p').nodes()
        setParagraphData(test.map(t => t.innerText))

        console.log('paragraph', d3.select(svgRef.current).node().getBoundingClienRect)

        let group = d3.select(svgRef.current).append('g');

        group.attr('transform', 'translate(240, 10)')
        let rect = group.selectAll('rect.text').data([{},{},{},{},{},{},{},{},{},{}]).join('rect').classed('text', true);
        
        rect.attr('width', 50).attr('height', 70)
        rect.attr('y', (d, i)=> (i * 75))
        rect.attr('fill', 'gray')
        rect.attr('fill-opacity', 0.5)

    }, [numPages])

  
    return (
        <Flex position="relative" top={100}>
          <Box
            margin="8px"
            p={5}
            flex={1}
            flexDirection="column"
            h="calc(100vh - 120px)"
            overflow="auto"
          >
            <ThreadNav
              researchTs={researchThreads ? researchThreads.research_threads : null}
              viewType="research threads"
            />
          </Box>
          <Box flex={4} h="calc(100vh - 120px)" overflowY="auto" marginTop={15}>
    
            <svg style={{display:'inline', backgroundColor:'yellow'}} ref={svgRef} width={360} height={'100%'}/>

            <div 
              id="pdf-wrap"
              style={{
                width:'650px', 
                height:'auto'
              }}>
                <Document 
                  file={perf} 
                  onLoadSuccess={onDocumentLoadSuccess}>
                  <Page pageNumber={pageNumber} />
                </Document>
                
                <div id={"button-wrap"}>
                  <p>
                    Page {pageNumber || (numPages ? 1 : "--")} of {numPages || "--"}
                  </p>
                <button 
                  type="button" 
                  disabled={pageNumber <= 1} 
                  onClick={previousPage}
                  style={{ 
                    marginRight: '10px',
                    backgroundColor: '#3f51b5',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    width: '100px',
                    cursor: 'pointer',
                    boxShadow: '2px 2px 2px 1px #ccc'}}
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={pageNumber >= numPages}
                  onClick={nextPage}
                  style={{ 
                    marginRight: '10px',
                    backgroundColor: '#3f51b5',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    width: '100px',
                    cursor: 'pointer',
                    boxShadow: '2px 2px 2px 1px #ccc'}}
                >
                  Next
                </button>
                </div>
            </div>

          </Box>
        </Flex>
      );

}

export default PaperView;