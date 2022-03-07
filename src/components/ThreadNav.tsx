import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Input,
  Textarea
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash, FaPlus, FaFillDrip } from 'react-icons/fa';
import { useProjectState } from './ProjectContext';
import { jitter } from './TopTimeline';
import * as d3 from "d3";

const MiniTimline = (props:any) => {
    
    const {researchT, activities} = props;

    let lilSVG = React.useRef(null);
   
    React.useEffect(()=> {
        const xScale = d3.scaleTime()
        .domain(d3.extent(activities.map(m=> new Date(m.date))))
        .range([0, 150])
        .nice();

      // Create root container where we will append all other chart elements
      const svgEl = d3.select(lilSVG.current);
      svgEl.selectAll("*").remove(); // Clear svg content before adding new elements 

      const svg = svgEl
        .append("g")
        .attr("transform", `translate(0, 6)`);

      let circleG = svg.append('g').classed('circle-group', true);

      circleG.attr('transform', 'translate(0, 0)')

      let circles = circleG.selectAll('circle').data(activities).join('circle')
      .attr('cx', d=> xScale(new Date(d.date)))
      .attr('cy', ()=> jitter(10))
      .attr('r', 3)
      .attr('fill', 'gray')
      .attr('fill-opacity', .1)

      let circleResearch = circleG.selectAll('circle.research').data(researchT.evidence).join('circle')
      .attr('cx', d=> xScale(new Date(d.dob)))
      .attr('cy', ()=> jitter(10))
      .attr('r', 4.5)
      .attr('fill', researchT.color)
      .attr('fill-opacity', .8)
      .attr('stroke', '#ffffff')


    }, [activities])

    return (
        <div><svg ref={lilSVG} style={{height:'20px', width:"100%"}} /></div>
    )
}

const ThreadNav = (threadProps:any) => {
    const {researchTs, viewType} = threadProps;
    const [{ projectData }, dispatch] = useProjectState();
    const [showThreads, setShowThreads] = useState(false);
    const [showCreateThread, setShowCreateThread] = useState(false);

    let [threadName, setName] = React.useState(null);
    let [description, setDescription] = React.useState(null);

    let handleNameChange = (e) => {
        let inputValue = e.target.value
        setName(inputValue)
    }

    let handleDescriptionChange = (e) => {
        let inputValue = e.target.value
        setDescription(inputValue)
    }

    const headerStyle = {fontSize:'19px', fontWeight:600, cursor:'pointer'}

    return(
        <Box>
            <div style={headerStyle} onClick={()=>{
                showThreads ? setShowThreads(false) : setShowThreads(true);
            }}>
            <span style={{display:'inline'}}>{"Research Threads"}</span>
            <span style={{display:'inline'}}>
                {showThreads ? <FaEye /> : <FaEyeSlash />}</span>
            </div>
            <Box>
            { researchTs ? (

                <Box  style={{marginTop:10, marginBottom:10}}>
                    {researchTs.map((rt:any, i:number)=>(
                        <div key={`rt-${i}`} style={{borderLeft: '2px solid gray', paddingLeft:3}}>
                            <span>{`${rt.title} `}<FaFillDrip style={{color: rt.color, display:"inline"}}/></span>
                            <MiniTimline researchT={rt} activities={projectData.entries}/>
                            {rt.associated_tags.map((t, i)=>
                                <div key={`tag-${i}`} style={{backgroundColor:rt.color, fontSize:'11px', display:"inline-block", margin:3, padding:2, borderRadius:5, color:rt.color === "#3932a3" ? 'white':'black'}}>{t}</div>
                            )}
                        </div>
                    ))
                    }
                </Box>
                ) : <span style={{marginTop:5, marginBottom:5}}>{"No research threads yet."}</span>}
            </Box>

            <Button style={{fontSize:'11px', borderRadius:5, padding:5, border:'1px solid gray'}} onClick={()=> showCreateThread ? setShowCreateThread(false) : setShowCreateThread(true)}>{showCreateThread ? "Cancel thread" : `Start a thread `}{<FaPlus style={{paddingLeft:5}}/>}</Button>
            {
                showCreateThread && (
                    <Box style={{marginTop:10}}>

                        <span style={{fontSize:14, fontWeight:600}}>
                            <Input placeholder='Name your thread.' onChange={handleNameChange} />
                        </span>

                        <Textarea
                        placeholder='Describe what this thread is.'
                        onChange={handleDescriptionChange}
                        ></Textarea>

                        {
                            (threadName && description) && (
                                <Button onClick={()=>{
                                    setName(null)
                                    setDescription(null)
                                    setShowCreateThread(false)
                                    dispatch({type: 'CREATE_THREAD', threadName: threadName, threadDescription: description})
                                }}>{"CREATE"}</Button>
                            )
                        }

                    </Box> 
                )
            }
        </Box>
    )
}

export default ThreadNav;