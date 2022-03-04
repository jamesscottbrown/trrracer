import React, { useEffect, useState } from 'react';
import path from 'path';
import {
  Flex,
  Box,
  Button,
  Spacer,
  Textarea,
  Popover,
  PopoverTrigger,
  PopoverArrow,
  PopoverContent,
  PopoverBody
} from '@chakra-ui/react';

import { FaFill } from 'react-icons/fa';
import { openFile } from './ProjectListView';

import TopTimeline from './TopTimeline';
import ReadonlyEntry from './ReadonlyEntry';
import DetailPreview from './DetailPreview';
import { useProjectState } from './ProjectContext';
import QueryBar from './QueryBar';

interface DetailProps {
    setViewType: (view: string) => void;
    folderPath: string;
    projectData: any;
}

const ArtifactToThread = (props:any) => {

    const [{ }, dispatch] = useProjectState();

    const {thread, threadIndex, activity, artifactIndex} = props;

    const [showDesc, setShowDesc] = useState(false);
    const [threadRat, setThreadRat] = useState(null);

    let handleDescriptionChange = (e) => {
        let inputValue = e.target.value
        setThreadRat(inputValue)
    }

    return(
        <Box key={`t-${threadIndex}`} 
            style={{border:"1px solid gray", borderRadius:"5px", cursor:"pointer", textAlign:"center"}}>
            <div onClick={()=> showDesc ? setShowDesc(false) : setShowDesc(true)}>{`Add to "${thread.title}"`}</div>
            {
                showDesc && (
                    <>
                    <Textarea
                        placeholder='Why are you including this?'
                        onChange={handleDescriptionChange}
                    ></Textarea>
                    <Button
                    onClick={()=> {
                        setShowDesc(false);
                        dispatch({type: "ADD_ARTIFACT_TO_THREAD", activity: activity, rationale:threadRat, artifactIndex: artifactIndex, threadIndex: threadIndex})}}
                    >{"Add"}</Button>
                    </>
                )
            }
        </Box>
    )
}

const FragmentToThread = (props:any) => {
    const [{ }, dispatch] = useProjectState();

    const {thread, threadIndex, activity, artifactIndex, fragSelected, setFragSelected} = props;

    const [showDesc, setShowDesc] = useState(false);
    const [threadRat, setThreadRat] = useState(null);

    let handleDescriptionChange = (e) => {
        let inputValue = e.target.value
        setThreadRat(inputValue)
    }

    return(
        <Box key={`t-${threadIndex}`} 
            style={{border:"1px solid gray", borderRadius:"5px", cursor:"pointer", textAlign:"center"}}>
            <div onClick={()=> showDesc ? setShowDesc(false) : setShowDesc(true)}>{`Add to "${thread.title}"`}</div>
            {
                showDesc && (
                    <>
                    <Textarea
                        placeholder='Why are you including this?'
                        onChange={handleDescriptionChange}
                    ></Textarea>
                    <Button
                    onClick={()=> {
                        console.log(fragSelected)
                        setShowDesc(false);
                        dispatch({type: "ADD_FRAGMENT_TO_THREAD", activity: activity, rationale:threadRat, artifactIndex: artifactIndex, threadIndex: threadIndex, fragment:fragSelected, fragmentType:'text'})
                        setFragSelected(null)
                    }}
                        
                    >{"Add"}</Button>
                    </>
                )
            }
        </Box>
    )
}
const InteractiveActivityTag = (props:any) => {
    const {selectedArtifactEntry, selectedArtifactIndex, index, tag} = props;
    const [{ projectData }, dispatch] = useProjectState();
    const [expandedTag, setExpandedTag] = useState(false);

    let tagMatches = projectData.entries.filter(f => f.tags.indexOf(tag) > -1);
    console.log('tagmatches', tagMatches);
    let indexOfE = tagMatches.map(m=> m.title).indexOf(selectedArtifactEntry.title)
    console.log('index of e', indexOfE);
    return (
 
            <Box key={`tag-sel-${index}`} style={{padding:5, backgroundColor:'#D3D3D3', borderRadius:5, margin:5}}>
                <Flex>
                <span 
                    style={{cursor:'pointer'}} 
                    onClick={()=> {
                        let indexOfE = tagMatches.map((m:any)=> m.title).indexOf(selectedArtifactEntry.title)
                    
                        if(indexOfE === 0){
                            dispatch({type:'SELECTED_ARTIFACT', selectedArtifactEntry: tagMatches[tagMatches.length - 1], selectedArtifactIndex: 0})
                        }else{
                            dispatch({type:'SELECTED_ARTIFACT', selectedArtifactEntry: tagMatches[indexOfE - 1], selectedArtifactIndex: 0})
                        }
                }}>{"<< "}</span>
                <Spacer></Spacer>
                <span onClick={()=> expandedTag ? setExpandedTag(false) : setExpandedTag(true)} style={{alignSelf:'center', cursor:'pointer'}}>{tag}</span>
                <Spacer></Spacer>
            
                    <span style={{cursor:'pointer'}} onClick={()=> {
                        let indexOfE = tagMatches.map((m:any)=> m.title).indexOf(selectedArtifactEntry.title)
                        if(indexOfE === (tagMatches.length - 1)){
                            dispatch({type:'SELECTED_ARTIFACT', selectedArtifactEntry: tagMatches[0], selectedArtifactIndex: 0})
                        }else{
                            dispatch({type:'SELECTED_ARTIFACT', selectedArtifactEntry: tagMatches[indexOfE + 1], selectedArtifactIndex: 0})
                        }
                    }}>{" >>"}</span>
           
               
                </Flex>
                {
                    expandedTag && (
                        <div>{tagMatches.map((t:any, i:number)=>(
                            <React.Fragment key={`tag-match-${i}`}>{
                                t.title === selectedArtifactEntry.title ?
                                <div style={{fontSize:11, fontWeight:900, borderBottom:'1px solid black', padding:3}} key={`match-${i}`}>{t.title}</div>
                                : <div style={{fontSize:10, borderBottom:'1px solid black', padding:3}} key={`match-${i}`}>{t.title}</div>}
                            </React.Fragment>
                            
                        ))}</div>
                    )
                }
            </Box>
        
    )
}
const DetailSidebar = (props:any) => {

    const {fragSelected, setFragSelected, selectedArtifactEntry, selectedArtifactIndex} = props;
    const [{ projectData, researchThreads }, dispatch] = useProjectState();

    const [showThreadAdd, setShowThreadAdd] = useState(false);

    console.log('FRAG SELETEDDD', fragSelected);

    let isArtifactInThread = researchThreads.research_threads.filter((f)=>{
        let temp = f.evidence.filter((e:any)=> e.type === 'artifact');
        temp = temp.length > 0 ? temp.filter((tm:any) => tm.activityTitle === selectedArtifactEntry.title && tm.artifactIndex === selectedArtifactIndex) : [];
        return temp.length > 0;
    });

    return(
        <Box margin="8px" p={5} flex='2' flexDirection='column' h='calc(100vh - 250px)' overflow="auto">
        <Box>
        <div><span style={{fontSize:20, fontWeight:700}} >{selectedArtifactEntry.title}</span></div>
        <Box marginLeft="3px" borderLeftColor={"black"} borderLeftWidth="1px" padding="3px">
            {selectedArtifactEntry.files.map((f:any, i:number)=> (
                <React.Fragment key={`fi-${f.title}-${i}`}>
                {
                (i === selectedArtifactIndex) ?
                <div style={{backgroundColor:'#FFFBC8', fontWeight:600}}>{selectedArtifactEntry.files[i].title}</div>
                : <div>{selectedArtifactEntry.files[i].title}</div>
                }
                </React.Fragment>
            ))}
        </Box>
    </Box>
        {
            <Box>
                <span style={{fontSize:20, fontWeight:700}}>Activity Tags</span>
                {selectedArtifactEntry.tags.map((t:any, i:number)=> ( 
                    <InteractiveActivityTag selectedArtifactEntry={selectedArtifactEntry} selectedArtifactIndex={selectedArtifactIndex} tag={t} index={i}/>
                ))
            }</Box>
        }
   
    {
        fragSelected && (
            <div style={{padding:'5px'}}>
                <span style={{backgroundColor: '#FFFBC8'}}>{fragSelected}</span>
            </div>
        )
    }
    <Box style={{backgroundColor:'#D3D3D3', borderRadius:5, marginTop:15, marginBottom:15}}>
        <span style={{fontSize:17, fontWeight:700, cursor:'pointer', padding:3, textAlign:'center'}} onClick={()=> {
            showThreadAdd ? 
            setShowThreadAdd(false) 
            : setShowThreadAdd(true)}}>{fragSelected ? 'Add this fragment to a thread +': 'Add this artifact to a thread +'}
        </span>
            <div>
        {showThreadAdd && (
            <>{(researchThreads && researchThreads.research_threads.length > 0) ? 
            <div>{
                researchThreads.research_threads.map((thread:any, ti:number)=>(
                    <React.Fragment key={`tr-${ti}`}>
                    {
                        fragSelected ?
                        <FragmentToThread thread={thread} threadIndex={ti} activity={selectedArtifactEntry} artifactIndex={selectedArtifactIndex} fragSelected={fragSelected} setFragSelected={setFragSelected}/>:
                        <ArtifactToThread thread={thread} threadIndex={ti} activity={selectedArtifactEntry} artifactIndex={selectedArtifactIndex}/>
                    }
                   </React.Fragment>
                ))
            }</div>
            :<div>{"No research threads yet."}</div>}
            </> 
        )}  </div>
    </Box>

    <Box>
        {
            isArtifactInThread.length > 0 && (
                <div>
                    <span style={{fontWeight:600, marginTop:10, marginBottom:10}}>{"This artifact is associated with:"}</span>
                {isArtifactInThread.map((at:any, i:number)=> (
                    <Box key={`in-thread-${i}`}>
                        <span>{at.title}<FaFill style={{color: at.color, display:"inline", marginLeft:5}}/></span>
                        <div style={{padding:5, borderLeft: "1px solid gray"}}>{
                            at.evidence.map((e:any, j:number)=>(
                                <React.Fragment key={`evid-${j}`}>{
                                e.artifactIndex === selectedArtifactIndex ? 
                                <div><span style={{fontWeight:600, display:"block"}}>{e.artifactTitle}</span>{e.rationale}</div> 
                                :<div><span style={{fontSize:11, color:'gray'}}>{e.type}</span></div>}
                                </React.Fragment>
                            ))
                        }</div>
                    </Box>
                ))}
                </div>
            )
        }
    </Box>
    </Box>
    )
}

const ArtifactDetailWindow = (props: DetailProps) => {

    const { setViewType, folderPath, projectData } = props;

    const [{ selectedArtifactEntry, selectedArtifactIndex }, dispatch] = useProjectState();

    const [editable, setEditable] = useState<boolean[]>(
        Array.from(Array(projectData.entries.length), (_, x) => false)
    );

    const [fragSelected, setFragSelected] = useState(null);
    console.log('testing', selectedArtifactEntry.files[selectedArtifactIndex])

    useEffect(() => {
        if (editable.length === projectData.entries.length - 1) {
          // one more entry was added
          setEditable([...editable, true]);
        } else if (editable.length !== projectData.entries.length) {
          setEditable(
            Array.from(Array(projectData.entries.length), (_, x) => false)
          );
        }
    }, [projectData]);
    
    const setEditableStatus = (index: number, isEditable: boolean) => {
        setEditable((oldEditable) =>
          oldEditable.map((d, i) => (i === index ? isEditable : d))
        );
    };

    return(

        <div style={{height: '100vh', position:'fixed', top:0, bottom:0}}>
        <Box position={"fixed"} left={0} right={0} flexFlow={'row wrap'} zIndex={1000} height={200}>
        <Flex  
            minH={'60px'}
            py={{ base: 2 }}
            px={{ base: 4 }}
            borderBottom={1}
            borderStyle={'solid'}
            borderColor={'gray.200'}
            alignSelf={'center'}
            alignContent={'center'}
            >
                
            <Button onClick={()=>{
               
                dispatch({type:'SELECTED_ARTIFACT', selectedArtifactEntry:null, selectedArtifactIndex:null})
                setViewType("activity view");

            }}>{"<< GO BACK TO OVERVIEW"}</Button>
         </Flex>
         <Flex><Spacer></Spacer><TopTimeline projectData={projectData}/><Spacer></Spacer></Flex>
        </Box>
            <Flex position={'relative'} top={220} bottom={0} height={'calc(100% - 150px)'}>
                <DetailSidebar fragSelected={fragSelected} setFragSelected={setFragSelected} selectedArtifactEntry={selectedArtifactEntry} selectedArtifactIndex={selectedArtifactIndex} />
                <Box flex="4" >
                    {
                        (selectedArtifactEntry.files[selectedArtifactIndex].fileType === 'txt' || selectedArtifactEntry.files[selectedArtifactIndex].fileType === 'gdoc') && (
                            <Box p={5} width={'100%'} alignContent={'center'}>
                                <QueryBar artifactData={selectedArtifactEntry.files[selectedArtifactIndex]}/>
                            </Box>
                        )
                    }
                    
                    <Flex style={{justifyContent: 'center', alignItems:'stretch', height:'90%'}}>
                        <Flex style={{alignItems:'center'}}>
                            <span onClick={()=>{ 
                                let entryIndex = selectedArtifactEntry.index;
                                if(entryIndex === 0){
                                    dispatch({type:'SELECTED_ARTIFACT', selectedArtifactEntry: projectData.entries[projectData.entries.length - 1], selectedArtifactIndex: 0})
                                }else{
                                    dispatch({type:'SELECTED_ARTIFACT', selectedArtifactEntry: projectData.entries[entryIndex - 1], selectedArtifactIndex: 0})
                                }
                            }} style={{fontWeight:700, fontSize:'24px', padding:'3px'}}>{"<<"}</span>
                            <span onClick={
                            ()=>{
                                if(selectedArtifactIndex > 0){
                                    dispatch({type:'SELECTED_ARTIFACT', selectedArtifactEntry: selectedArtifactEntry, selectedArtifactIndex: (selectedArtifactIndex - 1)})
                                }else{
                                    dispatch({type:'SELECTED_ARTIFACT', selectedArtifactEntry: selectedArtifactEntry, selectedArtifactIndex: (selectedArtifactEntry.files.length - 1)})
                                    console.log(selectedArtifactIndex)
                                }
                            }
                            } style={{fontWeight:500, fontSize:'16px', padding:'3px'}}>{"<<"}</span>
                        </Flex>
                    
                        <DetailPreview setFragSelected={setFragSelected} folderPath={folderPath} artifact={selectedArtifactEntry.files[selectedArtifactIndex]} activity={selectedArtifactEntry} openFile={openFile}></DetailPreview>
                        
                        <Flex style={{alignItems:'center'}}>
                            <span onClick={
                            ()=>{
                                let len = selectedArtifactEntry.files.length;
                                if(selectedArtifactIndex < len - 1){
                                    dispatch({type:'SELECTED_ARTIFACT', selectedArtifactEntry: selectedArtifactEntry, selectedArtifactIndex: (selectedArtifactIndex + 1)})
                                }else{
                                    dispatch({type:'SELECTED_ARTIFACT', selectedArtifactEntry: selectedArtifactEntry, selectedArtifactIndex: 0})
                                }
                            }} style={{fontWeight:500, fontSize:'16px', padding:'3px'}}>{">>"}</span>
                            <span onClick={()=> {
                                console.log(selectedArtifactEntry.index)
                                let entryIndex = selectedArtifactEntry.index;
                                if(entryIndex === (projectData.entries.length - 1)){
                                    dispatch({type:'SELECTED_ARTIFACT', selectedArtifactEntry: projectData.entries[0], selectedArtifactIndex: 0})
                                }else{
                                    dispatch({type:'SELECTED_ARTIFACT', selectedArtifactEntry: projectData.entries[entryIndex + 1], selectedArtifactIndex: 0})
                                }
                            }} style={{fontWeight:700, fontSize:'24px', padding:'3px'}}>{">>"}</span>
                        </Flex>
            </Flex>
            </Box>
        
            <Box flex="2" h='calc(100vh - 250px)' overflowY={'auto'}>
                <ReadonlyEntry
                    /* eslint-disable-next-line react/no-array-index-key */
                    key={`${selectedArtifactEntry.title}-${selectedArtifactEntry.index}`}
                    entryData={selectedArtifactEntry}
                    openFile={openFile}
                    setViewType={setViewType}
                    makeEditable={() => setEditableStatus(selectedArtifactEntry.index, true)}
                />
            </Box>
            </Flex>
        </div>
        // </div>
    )
}

export default ArtifactDetailWindow;