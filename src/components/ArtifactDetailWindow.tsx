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

interface DetailProps {
    selectedArtifactIndex : any;
    setSelectedArtifactIndex : (index: any) => void; 
    selectedArtifactEntry : any;
    setSelectedArtifactEntry : (entry: any) => void;
    setViewType: (view: string) => void;
    folderPath: string;
    projectData: any;
}

const ArtifactDetailWindow = (props: DetailProps) => {

    const { selectedArtifactIndex, setSelectedArtifactIndex, selectedArtifactEntry, setSelectedArtifactEntry, setViewType, folderPath, projectData} = props;

    const [editable, setEditable] = useState<boolean[]>(
        Array.from(Array(projectData.entries.length), (_, x) => false)
      );

    console.log('fffff', selectedArtifactEntry[selectedArtifactIndex])
    
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

    console.log('SELECTED ARTIFACT', selectedArtifactIndex, selectedArtifactEntry.files[selectedArtifactIndex])

    return(

        <div style={{height: '100vh', position:'fixed', top:0, bottom:0}}>
        <Box position={"fixed"} left={0} right={0} flexFlow={'row wrap'} zIndex={1000} height={200}>
        <Flex  
            // bg={useColorModeValue('white', 'gray.800')}
            // color={useColorModeValue('gray.600', 'white')}
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
                setSelectedArtifactIndex(null);
                setSelectedArtifactEntry(null);
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
                    <span>{"<< "}</span><Spacer></Spacer><span style={{alignSelf:'center'}}>{t}</span><Spacer></Spacer><span>{" >>"}</span>
                    </Flex>
                </Box>
            ))}
            </Box>

           
        </Box>
        <Box flex="4">
           
           <DetailPreview folderPath={folderPath} file={selectedArtifactEntry.files[selectedArtifactIndex]} openFile={openFile}></DetailPreview>
        
        </Box>
       
        <Box flex="2" h='calc(100vh - 250px)' overflowY={'auto'}>
            <ReadonlyEntry
                /* eslint-disable-next-line react/no-array-index-key */
                key={`${selectedArtifactEntry.title}-${selectedArtifactEntry.index}`}
                entryData={selectedArtifactEntry}
                openFile={openFile}
                setViewType={setViewType}
                setSelectedArtifactIndex={setSelectedArtifactIndex}
                setSelectedArtifactEntry={setSelectedArtifactEntry}
                makeEditable={() => setEditableStatus(selectedArtifactEntry.index, true)}
            />
        </Box>
        </Flex>
        </div>
    )
}

export default ArtifactDetailWindow;