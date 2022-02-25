import React, { useEffect, useState } from 'react';
import path from 'path';
import {
  Flex,
  Box,
  Button,
  Image,
  Spacer,
} from '@chakra-ui/react';
import { EntryType } from './types';
import ProjectListView, { openFile } from './ProjectListView';

import TopTimeline from './TopTimeline';
import ReadonlyEntry from './ReadonlyEntry';
import DetailPreview from './DetailPreview';
import { useProjectState } from './ProjectContext';

interface DetailProps {
    // selectedArtifactIndex : any;
    // setSelectedArtifactIndex : (index: any) => void; 
    // selectedArtifactEntry : any;
    // setSelectedArtifactEntry : (entry: any) => void;
    setViewType: (view: string) => void;
    folderPath: string;
    projectData: any;
}

const ArtifactDetailWindow = (props: DetailProps) => {

    const { setViewType, folderPath, projectData } = props;

    const [{ selectedArtifactEntry, selectedArtifactIndex }, dispatch] = useProjectState();

    const [editable, setEditable] = useState<boolean[]>(
        Array.from(Array(projectData.entries.length), (_, x) => false)
    );

    // console.log('fffff', selectedArtifactEntry[selectedArtifactIndex])
    
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

    const makeAllEditable = () => {
        setEditable(Array.from(Array(projectData.entries.length), (_, x) => true));
    };
    
    const makeAllNonEditable = () => {
        setEditable(Array.from(Array(projectData.entries.length), (_, x) => false));
    };
    
    const setEditableStatus = (index: number, isEditable: boolean) => {
        setEditable((oldEditable) =>
          oldEditable.map((d, i) => (i === index ? isEditable : d))
        );
    };

    // console.log('SELECTED ARTIFACT', selectedArtifactIndex, selectedArtifactEntry.files[selectedArtifactIndex])

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
       

        <Flex position={'relative'} top={220}>

        <Box margin="8px" p={5} flex='2' flexDirection='column' h='calc(100vh - 250px)' overflow="auto">
            <Box>
                <div><span style={{fontSize:20, fontWeight:700}} >{selectedArtifactEntry.title}</span></div>
                <Box marginLeft="3px" borderLeftColor={"black"} borderLeftWidth="1px" padding="3px">
                    {selectedArtifactEntry.files.map((f, i)=> (
                        
                        (i === selectedArtifactIndex) ?
                        <div style={{backgroundColor:'#RRGGBB'}}>{selectedArtifactEntry.files[i].title}</div>
                        : <div>{selectedArtifactEntry.files[i].title}</div>
                        
                    ))}
                </Box>
            </Box>

            <Box>
            <span style={{fontSize:20, fontWeight:700, fontColor:'red'}}>Activity Tags</span>
            {selectedArtifactEntry.tags.map((t, i)=> (
                <Box style={{padding:5, backgroundColor:'#D3D3D3', borderRadius:5, margin:5}}>
                    <Flex>
                    <span onClick={()=> {
                        let test = projectData.entries.filter(f => f.tags.indexOf(t) > -1)
                        let indexOfE = test.map(m=> m.title).indexOf(selectedArtifactEntry.title)
                        if(indexOfE === 0){
                            dispatch({type:'SELECTED_ARTIFACT', selectedArtifactEntry: test[test.length - 1], selectedArtifactIndex: 0})
                        }else{
                            dispatch({type:'SELECTED_ARTIFACT', selectedArtifactEntry: test[indexOfE - 1], selectedArtifactIndex: 0})
                        }
                    }}>{"<< "}</span>
                    <Spacer></Spacer>
                    <span style={{alignSelf:'center'}}>{t}</span>
                    <Spacer></Spacer>
                    <span onClick={()=> {
                        let test = projectData.entries.filter(f => f.tags.indexOf(t) > -1)
                        let indexOfE = test.map(m=> m.title).indexOf(selectedArtifactEntry.title)
                        if(indexOfE === (test.length - 1)){
                            dispatch({type:'SELECTED_ARTIFACT', selectedArtifactEntry: test[0], selectedArtifactIndex: 0})
                        }else{
                            dispatch({type:'SELECTED_ARTIFACT', selectedArtifactEntry: test[indexOfE + 1], selectedArtifactIndex: 0})
                        }
                    }}>{" >>"}</span>
                    </Flex>
                </Box>
            ))}
            </Box>

           
        </Box>
        <Box flex="4" >
        <Flex style={{justifyContent: 'center', alignItems:'center', height:'90%'}}>
        <span onClick={()=>{ 
            console.log(selectedArtifactEntry.index)
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
           <DetailPreview folderPath={folderPath} file={selectedArtifactEntry.files[selectedArtifactIndex]} openFile={openFile}></DetailPreview>
          
        <span onClick={
        ()=>{
          
            let len = selectedArtifactEntry.files.length;
            if(selectedArtifactIndex < len - 1){
                dispatch({type:'SELECTED_ARTIFACT', selectedArtifactEntry: selectedArtifactEntry, selectedArtifactIndex: (selectedArtifactIndex + 1)})
            }else{
                dispatch({type:'SELECTED_ARTIFACT', selectedArtifactEntry: selectedArtifactEntry, selectedArtifactIndex: 0})
            }
        }
        } style={{fontWeight:500, fontSize:'16px', padding:'3px'}}>{">>"}</span>
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
    )
}

export default ArtifactDetailWindow;