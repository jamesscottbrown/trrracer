import React, { useState } from 'react';
import {
  Box,
  Button,
  Input,
  Textarea
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash, FaPlus, FaFillDrip } from 'react-icons/fa';
import { useProjectState } from './ProjectContext';

const ThreadNav = () => {
    const [{ researchThreads }, dispatch] = useProjectState();
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
            { researchThreads ? (

                <Box  style={{marginTop:10, marginBottom:10}}>
                    {researchThreads.research_threads.map((rt:any, i:number)=>(
                        <div key={`rt-${i}`} style={{borderLeft: '2px solid gray', paddingLeft:3}}>
                            <span>{`${rt.title} `}<FaFillDrip style={{color: rt.color, display:"inline"}}/></span>
                            <div><svg style={{height:'20px', width:"100%"}}></svg></div>
                            {rt.associated_tags.map((t, i)=>
                                <div key={`tag-${i}`} style={{backgroundColor:"#d3d3d3", fontSize:'11px', display:"inline-block", margin:3, padding:2}}>{t}</div>
                            )}
                        </div>
                    ))
                    }
                </Box>
                ) : <span style={{marginTop:5, marginBottom:5}}>{"No research threads yet."}</span>}
            </Box>

            <Button style={{fontSize:'11px'}} onClick={()=> showCreateThread ? setShowCreateThread(false) : setShowCreateThread(true)}>{showCreateThread ? "Cancel thread" : `Start a thread `}{<FaPlus style={{paddingLeft:5}}/>}</Button>
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