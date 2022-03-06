import React, { useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Spacer,
  SimpleGrid,
  PopoverTrigger,
} from '@chakra-ui/react';

import { FaExternalLinkAlt, FaLock } from 'react-icons/fa';

import { useProjectState } from './ProjectContext';
import ThreadNav from './ThreadNav';
import GoogDriveParagraph from './GoogDriveElements';
import FileTextRender from './FileTextRender';
import AttachmentPreview from './AttachmentPreview';
import { openFile } from './ProjectListView';


const ThreadedActivity = (props:any) => {
  const {projectData, evidence, folderPath} = props;
 
  let activity = projectData.entries.filter(f=> f.title === evidence.title)[0];

  console.log('activity threaded', activity, evidence, folderPath);
  return (
    <div>
      <SimpleGrid columns={1} spacing={3}>
        {activity.files.map((f, i) => (
          <React.Fragment key={`fr-${f.title}-${i}`}>
            <Box key={`${f.title}-${i}`} p={3}>
                <span
                  style={{ fontSize: 18, fontWeight: 500, marginBottom: 5 }}
                >
                  {' '}
                  {f.title}{' '}
                </span>

              <FaExternalLinkAlt
                // onClick={() => openFile(f.title, folderPath)}
                title="Open file externally"
                size="13px"
                style={{ display: 'inline' }}
              />
              <AttachmentPreview
                  folderPath={folderPath}
                  title={f.title}
                  openFile={openFile}
                  size={100}
                /> 
          </Box>
          
        </React.Fragment>
        ))}

      </SimpleGrid>
    </div>
  )
}

const ThreadedArtifact = (props:any) => {
  const {projectData, evidence, googleData, txtData} = props;
  let activity = projectData.entries.filter(f=> f.title === evidence.activityTitle)[0];
  let artifactChosen = activity.files.filter(a=> a.title === evidence.artifactTitle)[0];


  if(artifactChosen.fileType === 'gdoc'){

    let goog = googleData[artifactChosen.fileId];
    let gContent = goog["body"]["content"].filter(f => f.startIndex);
   
    return <Flex flexDirection={'row'} alignItems={'center'} justifyContent={'space-around'}>
            <div style={{ height:'400px', overflow:'auto', fontSize:'11px', width:'60%'}}>
            {
              gContent.map((m:any, i:number)=> (
                <GoogDriveParagraph key={`par-${i}`} parData={m} index={i} />
              ))}
          </div>
          <div>
            <span style={{display:'block', fontWeight:700}}>{'Why was this included:'}</span>
            <span>{evidence.rationale}</span>
          </div>
        </Flex>
  }
  
  if(artifactChosen.filetType === 'txt'){
    let temp = txtData['text-data'].filter(f=> f['entry-title'] === activity.title);

    return <Flex flexDirection={'row'} alignItems={'center'} justifyContent={'space-around'}>
              <div style={{ height:'90%', overflow:'auto'}}>
              {temp[0].text}
              </div>
              <div>
            <span style={{display:'block', fontWeight:700}}>{'Why was this included:'}</span>
            <span>{evidence.rationale}</span>
            </div>
           </Flex>
  }

  return (
    <div>{'FILE NOT FOUND'}</div>
  )

  
}

const ThreadedFragment = (props:any) => {
  const {projectData, evidence, googleData, txtData} = props;
  let activity = projectData.entries.filter(f=> f.title === evidence.activityTitle)[0];
  let artifactChosen = activity.files.filter(a=> a.title === evidence.artifactTitle)[0];
  if(artifactChosen.fileType === 'gdoc'){
    let goog = googleData[artifactChosen.fileId];
    let gContent = goog["body"]["content"].filter(f => f.startIndex);
   
    return <Flex flexDirection={'row'} alignItems={'center'} justifyContent={'space-around'}>
            <div style={{ height:'400px', overflow:'auto', fontSize:'11px', width:'60%'}}>
            {
              gContent.map((m:any, i:number)=> (
                <GoogDriveParagraph key={`par-${i}`} parData={m} index={i} />
              ))}
          </div>
          <div>
            <span style={{display:'block', fontWeight:700}}>{'Why was this included:'}</span>
            <span>{evidence.rationale}</span>
          </div>
        </Flex>
  }
  if(artifactChosen.fileType === 'txt'){
    let temp = txtData['text-data'].filter(f=> f['entry-title'] === activity.title)[0];
    console.log('evidence',evidence.anchors[0].frag_type);

    console.log(temp.text.split(evidence.anchors[0].frag_type));
    let txtArray = temp.text.split(evidence.anchors[0].frag_type);

    return <Flex flexDirection={'row'} alignItems={'center'} justifyContent={'space-around'}>
              <div style={{ height:'400px', overflow:'auto', fontSize:'11px', width:'60%'}}>
              
                <span>{txtArray[0]}</span>
                <span style={{fontWeight:800}}>{evidence.anchors[0].frag_type}</span>
                <span>{txtArray[1]}</span>
              </div>
              <div>
            <span style={{display:'block', fontWeight:700}}>{'Why was this included:'}</span>
            <span>{evidence.rationale}</span>
            </div>
           </Flex>
  }
  return (
    <div>
      {'fragment threaded'}
    </div>
  )
}

const ThreadView = () => {

  const [{projectData, folderPath, researchThreads, googleData, txtData}, dispatch] = useProjectState();
  const [selectedThread, setSelectedThread] = useState(0);

    const headerStyle = {fontSize:'19px', fontWeight:600}

    return(
      <Flex position={'relative'} top={220} >
          <Box margin="8px" p={5} flex={1} flexDirection='column' h='calc(100vh - 250px)' overflow="auto">
        <ThreadNav/>
        </Box>
        <Box flex={3} h='calc(100vh - 250px)' overflowY='auto' marginTop={15}>
          {researchThreads && (
            <Flex flexDirection={'column'}>
            <span style={headerStyle}>{researchThreads.research_threads[selectedThread].title}</span>
            {
              researchThreads.research_threads[selectedThread].evidence.sort((a, b) => b.dob - a.dob)
              .map((e:any, i:number)=> (
                <div key={`evi-${i}`} style={{margin:5, borderBottom:'solid 1px gray'}}>
                  <div>
                    {e.type === 'activity' ? 
                    <span style={{fontWeight: 700}}>{e.title}</span> : 
                    <span><span style={{fontWeight: 700}}>{e.artifactTitle}</span>{` (from ${e.activityTitle})`}</span>}
                    <Spacer/>
                    <span style={{fontSize:'12px', color:'gray', textAlign:'right'}}>{e.dob}</span>
                  </div>
                  {
                    e.type === 'activity' ? 
                    <span>{e.type}</span> :
                    <span>{`${'test'} ${e.type}`}</span>
                  }
                  
                  <div>
                    { e.type === 'activity' && (
                      <ThreadedActivity projectData={projectData} evidence={e} folderPath={folderPath} />
                    )}
                    {
                      e.type === 'artifact' && (
                        <ThreadedArtifact projectData={projectData} evidence={e} googleData={googleData} txtData={txtData}/>
                      )
                    }
                    {
                      e.type === 'fragment' && (
                        <ThreadedFragment projectData={projectData} evidence={e} googleData={googleData} txtData={txtData} />
                      )
                    }
                  </div>
                 
                </div>
              ))
            }
            </Flex>
          )}
        </Box>
      </Flex>
    )
}

export default ThreadView;