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

    const filePath = path.join(folderPath, 'links.json');
    const linkData = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const anno = d3.groups(JSON.parse(linkData), d => d.page);
 
    const [
        {
          projectData,
          researchThreads,
          selectedThread
        },
        dispatch,
      ] = useProjectState();

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
 
      let nodes = forced.nodes.filter(f => researchThreads.research_threads[index].evidence.map(m=> m.activityTitle).includes(f.title)).map(m => {
        m.color = researchThreads.research_threads[index].color;
        return m;
      });

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

        let pageRectData = []
        for(let i = 1; i < numPages; i = i + 1){
          let annoTemp = anno.filter((a: any) => a[0] === i);
          pageRectData.push({pageIndex: i, anno: annoTemp.length > 0 ? annoTemp[0][1] : []})
        }
        const rectHeight = 70;

        const yScale = d3.scaleLinear().domain([0, anno[0][1][0]['pdf-dim'][3]]).range([rectHeight, 0])
       
        let groupTest = d3.select(svgRef.current).select('.text-group');

        let group = groupTest.empty() ? d3.select(svgRef.current).append('g').classed('text-group', true) : groupTest;
        
        group.attr('transform', 'translate(240, 10)');

        let pages = group.selectAll('g.pages').data(pageRectData).join('g').classed('pages', true);
        pages.attr('transform', (d, i)=> `translate(0, ${(i * (rectHeight + 5))})`)

        let rect = pages.selectAll('rect.pag').data((d: any) => [d]).join('rect').classed('pag', true);

        rect.attr('width', 50).attr('height', rectHeight)
       
        rect.attr('fill', 'gray')
        rect.attr('fill-opacity', 0.5)

        let annog = pages.selectAll('rect.anno')
        .data((d: any) => d.anno)
        .join("rect")
        .classed('anno', true);

        annog.attr('width', 50);
        annog.attr('height', 5);

        annog.attr('y', (d)=> {
          return yScale(d.position['1']);
        });
        
        annog.attr('fill', researchThreads.research_threads[index].color);

        rect.filter((f:any) => f.pageIndex === pageNumber).attr('fill-opacity', 1);

    }, [numPages, pageNumber])

  
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
    
            <svg style={{display:'inline'}} ref={svgRef} width={360} height={'100%'}/>

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
                  <p style={{textAlign:'center', fontSize:'12px', padding:'5px'}}>
                    Page {pageNumber || (numPages ? 1 : "--")} of {numPages || "--"}
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
                    backgroundColor: '#818589',
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