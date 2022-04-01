import React, { useEffect, useLayoutEffect, useState } from "react";
import * as fs from 'fs';
import { Box, Flex } from "@chakra-ui/react";
import ThreadNav from "./ThreadNav";
import { useProjectState } from "./ProjectContext";
import * as d3 from 'd3';
import ForceMagic from '../ForceMagic';
import Bubbles from '../Bubbles';
import path from "path";
import { openFile } from "./ActivityWrap";


const PaperView = (props:any) => {
    const {folderPath} = props;

    const perf = `${path.join(folderPath, 'trevo-html-test.html')}`;

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
  
      let nodes = forced.nodes.filter(f => researchThreads.research_threads[selectedThread].evidence.map(m=> m.activityTitle).includes(f.title)).map(m => {
        m.color = researchThreads.research_threads[selectedThread].color;
        return m;
      })
      let notNodes = forced.nodes.filter(f => researchThreads.research_threads[selectedThread].evidence.map(m=> m.activityTitle).indexOf(f.title) === -1)
  
      let activityNot = wrap.selectAll('g.activity_not')
      .data(notNodes).join('g').attr('class', 'activity_not');
  
      let activityGroups = wrap.selectAll('g.activity')
      .data(nodes).join('g').attr('class', 'activity');
  
      let bubbleNotHighlighted = new Bubbles(activityNot, false, false, null);
      let bubbleHighlighted = new Bubbles(activityGroups, true, false, null);
  
      bubbleHighlighted.bubbles.on('mouseover', (event, d)=> {
        d3.select(event.target).attr('r', (d.radius * 2)).attr('stroke', '#fff').attr('stroke-width', 2);
  
        // setHoverActivity(d);
  
        let htmlForm = () => {
          let test = researchThreads.research_threads[selectedThread].evidence.filter(f => f.activityTitle === d.title)
        
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
        let rect = group.selectAll('rect.text').data(paragraphData).join('rect').classed('text', true);
        console.log(rect)
        rect.attr('width', 100).attr('height', 10)

    }, [iframeRef.current])

    useLayoutEffect(()=> {

        // console.log(iframeRef.current)
        // console.log(d3.select(iframeRef.current))
       
       // let test = d3.select("#divtext").selectAll('p').nodes()
        // let test = d3.select(fileContents).selectAll('p').nodes()
       
        // setParagraphData(test.map(t => t.innerText))
    })

    // const onIframeRef = (node)=> {
    //     if (!node) {
    //       return;
    //     }
    //     node.contentWindow.addEventListener("load", () => {
    //       console.log(node.contentWindow.document.getElementById("some").value);
    //     });
    
    //     this.Iframe = node;
    //   };

    return (
        <Flex position="relative" top={220}>
          <Box
            margin="8px"
            p={5}
            flex={1}
            flexDirection="column"
            h="calc(100vh - 250px)"
            overflow="auto"
          >
            <ThreadNav
              researchTs={researchThreads ? researchThreads.research_threads : null}
              viewType="research threads"
            />
          </Box>
          <Box flex={3} h="calc(100vh - 250px)" overflowY="auto" marginTop={15}>
    
            <svg style={{backgroundColor:'blue', display:'inline'}} ref={svgRef} width={400} height={'100%'}/>

            <iframe style={{display:'inline', width:650, height:'100%'}} src={perf} id={'test'} ref={iframeRef}></iframe>
         <div dangerouslySetInnerHTML={{ __html: fileContents }} id={'divtext'}></div>
          </Box>
        </Flex>
      );

}

export default PaperView;