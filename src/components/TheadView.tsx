import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Flex, Spacer, SimpleGrid, Button } from '@chakra-ui/react';

import { FaExternalLinkAlt, FaLock, FaTrash } from 'react-icons/fa';

import { useProjectState } from './ProjectContext';
import ThreadNav from './ThreadNav';
import GoogDriveParagraph from './GoogDriveElements';
import AttachmentPreview from './AttachmentPreview';
import { openFile } from './ProjectListView';
import DetailPreview from './DetailPreview';

const ThreadedActivity = (props: any) => {
  const { projectData, evidence, folderPath } = props;

  const activity = projectData.entries.filter(
    (f) => f.title === evidence.title
  )[0];

  return (
    <div>
      <SimpleGrid columns={1} spacing={3}>
        {activity.files.map((f, i) => (
          <React.Fragment key={`fr-${f.title}-${i}`}>
            <Box key={`${f.title}-${i}`} p={3}>
              <span style={{ fontSize: 18, fontWeight: 500, marginBottom: 5 }}>
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
  );
};

const ThreadedArtifact = (props: any) => {
  const { projectData, evidence, folderPath } = props;

  const [ showDoc, setShowDoc ] = useState(false);
  const [ buttonLabel, setButtonLabel ] = useState('Show');
  const [maxHeight, setMaxHeight] = useState(400);

  const activity = projectData.entries.filter(
    (f) => f.title === evidence.activityTitle
  )[0];
  const artifactChosen = activity.files.filter(
    (a) => a.title === evidence.artifactTitle
  )[0];

  return (
    <Flex flexDirection="row" alignItems="center" justifyContent="space-around">
     
      <div style={{ width: '60%', maxHeight: maxHeight, overflow: 'auto' }}>
        <DetailPreview
          setFragSelected={null}
          folderPath={folderPath}
          artifact={artifactChosen}
          activity={activity}
          openFile={openFile}
        />
      </div>
    
      <div
        style={{
          maxWidth: 200,
          borderRadius: 5,
          backgroundColor: '#ececec',
          padding: 10,
        }}
      >
        <span style={{ display: 'block', fontWeight: 700 }}>
          Why was this included:
        </span>
        <span>{evidence.rationale}</span>
      </div>
    </Flex>
  );
};

const ThreadedFragment = (props: any) => {
  const { projectData, evidence, googleData, txtData } = props;
  const [ showDoc, setShowDoc ] = useState(false);
  const [ buttonLabel, setButtonLabel ] = useState('Show');
  const [height, setHeight] = useState(200);
  const [textColor, setTextColor] = useState('gray');

  useEffect(() => {
      const element = document.getElementById('highlighted')
      if (element)
          element.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const activity = projectData.entries.filter(
    (f) => f.title === evidence.activityTitle
  )[0];
  const artifactChosen = activity.files.filter(
    (a) => a.title === evidence.artifactTitle
  )[0];
  if (artifactChosen.fileType === 'gdoc') {
    const goog = googleData[artifactChosen.fileId];
    const gContent = goog.body.content.filter((f) => f.startIndex);

    return (
      <Flex
        flexDirection="row"
        alignItems="center"
        justifyContent="space-around"
      >
        <div style={{
          width: '60%',
          height:height + 'px',
          padding:3
          }}>

          <div>
            
              <div
              style={{fontWeight:600, fontSize:24}}
              >{"Threaded Fragment: "}</div>
              {
                evidence.anchors.map((a, i)=> (
                  <div key={`frag-${i}`}>
                    <span style={{backgroundColor:'#FFFCBB'}}>
                    {a.frag_type}
                    </span>
                    </div>
                ))
              }
          </div>
          <div
            style={{
              height:height + 'px',
              overflow: 'auto',
              fontSize: '11px',
              
            }}
          >
          <div
          style={{marginTop:15, marginBottom:15}}
          >
            <Button 
              onClick={()=> {
                showDoc ? setShowDoc(false) : setShowDoc(true);
                buttonLabel === 'Show' ? setButtonLabel('Hide') : setButtonLabel('Show'); 
                height === 200 ? setHeight(400) : setHeight(200);
            }}
            >{`${buttonLabel} Google Doc`}</Button>
            </div>
            {
              showDoc && (
                gContent.map((m: any, i: number) => (
                <GoogDriveParagraph key={`par-${i}`} parData={m} index={i} comments={artifactChosen.comments.comments} />
              ))
            )}
          </div>

        </div>

        <div
          style={{
            maxWidth: 200,
            borderRadius: 5,
            backgroundColor: '#ececec',
            padding: 5,
          }}
        >
          <span style={{ display: 'block', fontWeight: 700 }}>
            Why was this included:
          </span>
          <span>{evidence.rationale}</span>
        </div>
      </Flex>
    );
    }
    if (artifactChosen.fileType === 'txt') {
      const temp = txtData['text-data'].filter(
        (f) => f['entry-title'] === activity.title
      )[0];

    const txtArray = temp.text.split(evidence.anchors[0].frag_type);

    return (
      <Flex
        flexDirection="row"
        alignItems="center"
        justifyContent="space-around"
      >
        <div
          style={{
            width: '60%',
            height:height + 'px',
            padding:3
            }}
        >

          <div
            style={{marginTop:15, marginBottom:15}}
            >
              <Button 
              onClick={()=> {
                showDoc ? setShowDoc(false) : setShowDoc(true);
                buttonLabel === 'Show' ? setButtonLabel('Hide') : setButtonLabel('Show'); 
                height === 200 ? setHeight(400) : setHeight(200);
                textColor === 'gray'? setTextColor('black') : setTextColor('gray');
              }}
              >{`${buttonLabel} Text File`}</Button>
          </div>
          <div
            style={{
              height:(height- 75) + 'px',
              overflow: 'auto',
            }}
          >
            <span style={{color:textColor}}>{txtArray[0]}</span>
            <span style={{ fontWeight: 800, backgroundColor:'#FFFCBB' }} id={'highlighted'}>
              {evidence.anchors[0].frag_type}
            </span>
            <span style={{color:textColor}}>{txtArray[1]}</span>
          </div>

        </div>



        <div
          style={{
            maxWidth: 200,
            borderRadius: 5,
            backgroundColor: '#ececec',
            padding: 5,
          }}
        >
          <span style={{ display: 'block', fontWeight: 700 }}>
            Why was this included:
          </span>
          <span>{evidence.rationale}</span>
        </div>
      </Flex>
    );
  }
  return <div>fragment threaded</div>;
};

const ThreadView = () => {
  const [
    {
      projectData,
      folderPath,
      researchThreads,
      selectedThread,
      googleData,
      txtData,
    },
    dispatch,
  ] = useProjectState();

  const headerStyle = { fontSize: '30px', fontWeight: 700, marginBottom:20 };

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
        {researchThreads && (
          <Flex flexDirection="column">
            <span style={headerStyle}>
              {`${researchThreads.research_threads[selectedThread].title} Reserach Thread`}
            </span>
            {researchThreads.research_threads[selectedThread].evidence
              .sort((a, b) => b.dob - a.dob)
              .map((e: any, i: number) => (
                <div
                  key={`evi-${i}`}
                  style={{ margin: 5, borderBottom: 'solid 1px gray' }}
                >
                  <div>
                    {e.type === 'activity' ? (
                      <span style={{ fontWeight: 700 }}>{`Threaded Activity: ${e.title}`}</span>
                    ) : (
                      <span>
                        <span style={{ fontWeight: 700 }}>
                          {`Threaded Artifact: ${e.artifactTitle}`}
                        </span>
                        {` (from ${e.activityTitle})`}
                      </span>
                    )}
                    <span
                      onClick={() => {
                        const newEv = researchThreads.research_threads[
                          selectedThread
                        ].evidence.filter((f, j) => j != i);
                        researchThreads.research_threads[
                          selectedThread
                        ].evidence = newEv;
                        dispatch({
                          type: 'DELETE_EVIDENCE_FROM_THREAD',
                          researchThreads,
                        });
                      }}
                    >
                      <FaTrash
                        style={{
                          cursor: 'pointer',
                          fill: 'red',
                          display: 'inline',
                          float: 'inline-end',
                          marginRight: 10,
                          marginLeft: 10,
                        }}
                      />
                    </span>
                    <Spacer />
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'gray',
                        textAlign: 'right',
                      }}
                    >
                      {e.dob}
                    </span>
                  </div>

                  <div style={{ marginTop: 20 }}>
                    {e.type === 'activity' && (
                      <ThreadedActivity
                        projectData={projectData}
                        evidence={e}
                        folderPath={folderPath}
                      />
                    )}
                    {e.type === 'artifact' && (
                      <ThreadedArtifact
                        projectData={projectData}
                        evidence={e}
                        folderPath={folderPath}
                      />
                    )}
                    {e.type === 'fragment' && (
                      <ThreadedFragment
                        projectData={projectData}
                        evidence={e}
                        googleData={googleData}
                        txtData={txtData}
                        folderPath={folderPath}
                      />
                    )}
                  </div>
                </div>
              ))}
          </Flex>
        )}
      </Box>
    </Flex>
  );
};

export default ThreadView;
