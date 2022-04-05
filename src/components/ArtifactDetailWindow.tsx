import React, { useEffect, useState } from 'react';

import { Flex, Box, Button, Spacer, Textarea } from '@chakra-ui/react';

import { openFile } from '../fileUtil';

import TopTimeline from './TopTimeline';
import ReadonlyEntry from './ReadonlyEntry';
import DetailPreview from './DetailPreview';
import { useProjectState } from './ProjectContext';
import QueryBar from './QueryBar';
import ThreadNav from './ThreadNav';
import type { ResearchThread, ResearchThreadEvidence } from './types';
import ActivityWrap from './ActivityWrap';

interface DetailProps {
  setViewType: (view: string) => void;
  folderPath: string;
  projectData: any;
}

const ArtifactToThread = (props: any) => {
  const [, dispatch] = useProjectState();

  const { thread, threadIndex, activity, artifactIndex } = props;

  const [showDesc, setShowDesc] = useState(false);
  const [threadRat, setThreadRat] = useState(null);

  const handleDescriptionChange = (e: any) => {
    const inputValue = e.target.value;
    setThreadRat(inputValue);
  };

  return (
    <Box
      key={`t-${threadIndex}`}
      style={{
        border: '1px solid gray',
        borderRadius: '5px',
        cursor: 'pointer',
        textAlign: 'center',
      }}
    >
      <div
        onClick={() => (showDesc ? setShowDesc(false) : setShowDesc(true))}
      >{`Add to "${thread.title}"`}</div>
      {showDesc && (
        <>
          <Textarea
            placeholder="Why are you including this?"
            onChange={handleDescriptionChange}
          />
          <Button
            onClick={() => {
              setShowDesc(false);
              dispatch({
                type: 'ADD_ARTIFACT_TO_THREAD',
                activity,
                rationale: threadRat,
                artifactIndex,
                threadIndex,
              });
            }}
          >
            Add
          </Button>
        </>
      )}
    </Box>
  );
};

const FragmentToThread = (props: any) => {
  const [ , dispatch] = useProjectState();

  const {
    thread,
    threadIndex,
    activity,
    artifactIndex,
    fragSelected,
    setFragSelected,
  } = props;

  const [showDesc, setShowDesc] = useState(false);
  const [threadRat, setThreadRat] = useState(null);

  const handleDescriptionChange = (e: any) => {
    const inputValue = e.target.value;
    setThreadRat(inputValue);
  };

  return (
    <Box
      key={`t-${threadIndex}`}
      style={{
        border: '1px solid gray',
        borderRadius: '5px',
        cursor: 'pointer',
        textAlign: 'center',
      }}
    >
      <div
        onClick={() => (showDesc ? setShowDesc(false) : setShowDesc(true))}
      >{`Add to "${thread.title}"`}</div>
      {showDesc && (
        <>
          <Textarea
            placeholder="Why are you including this?"
            onChange={handleDescriptionChange}
          />
          <Button
            onClick={() => {
              setShowDesc(false);
              dispatch({
                type: 'ADD_FRAGMENT_TO_THREAD',
                activity,
                rationale: threadRat,
                artifactIndex,
                threadIndex,
                fragment: fragSelected,
                fragmentType: 'text',
              });
              setFragSelected(null);
            }}
          >
            Add
          </Button>
        </>
      )}
    </Box>
  );
};
const InteractiveActivityTag = (props: any) => {
  const { selectedArtifactEntry, index, tag } = props;
  const [{ projectData }, dispatch] = useProjectState();
  const [expandedTag, setExpandedTag] = useState(false);

  const tagMatches = projectData.entries.filter(
    (f: any) => f.tags.indexOf(tag) > -1
  );

  return (
    <Box
      key={`tag-sel-${index}`}
      style={{
        padding: 5,
        backgroundColor: '#D3D3D3',
        borderRadius: 5,
        margin: 5,
      }}
    >
      <Flex>
        <span
          style={{ cursor: 'pointer' }}
          onClick={() => {
            const indexOfE = tagMatches
              .map((m: any) => m.title)
              .indexOf(selectedArtifactEntry.title);

            if (indexOfE === 0) {
              dispatch({
                type: 'SELECTED_ARTIFACT',
                selectedArtifactEntry: tagMatches[tagMatches.length - 1],
                selectedArtifactIndex: 0,
              });
            } else {
              dispatch({
                type: 'SELECTED_ARTIFACT',
                selectedArtifactEntry: tagMatches[indexOfE - 1],
                selectedArtifactIndex: 0,
              });
            }
          }}
        >
          {'<< '}
        </span>
        <Spacer />
        <span
          onClick={() =>
            expandedTag ? setExpandedTag(false) : setExpandedTag(true)
          }
          style={{ alignSelf: 'center', cursor: 'pointer' }}
        >
          {tag}
        </span>
        <Spacer />

        <span
          style={{ cursor: 'pointer' }}
          onClick={() => {
            const indexOfE = tagMatches
              .map((m: any) => m.title)
              .indexOf(selectedArtifactEntry.title);
            if (indexOfE === tagMatches.length - 1) {
              dispatch({
                type: 'SELECTED_ARTIFACT',
                selectedArtifactEntry: tagMatches[0],
                selectedArtifactIndex: 0,
              });
            } else {
              dispatch({
                type: 'SELECTED_ARTIFACT',
                selectedArtifactEntry: tagMatches[indexOfE + 1],
                selectedArtifactIndex: 0,
              });
            }
          }}
        >
          {' >>'}
        </span>
      </Flex>
      {expandedTag && (
        <div>
          {tagMatches.map((t: any, i: number) => (
            <React.Fragment key={`tag-match-${i}`}>
              {t.title === selectedArtifactEntry.title ? (
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    borderBottom: '1px solid black',
                    padding: 3,
                  }}
                  key={`match-${i}`}
                >
                  {t.title}
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 10,
                    borderBottom: '1px solid black',
                    padding: 3,
                    cursor:'pointer'
                  }}
                  key={`match-${i}`}
                  onClick={()=> {
                    dispatch({
                      type: 'SELECTED_ARTIFACT',
                      selectedArtifactEntry: t,
                      selectedArtifactIndex: 0,
                    });
                  }}
                >
                  {t.title}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </Box>
  );
};
const DetailSidebar = (props: any) => {
  const {
    fragSelected,
    setFragSelected,
    selectedArtifactEntry,
    selectedArtifactIndex,
  } = props;
  const [{ researchThreads }] = useProjectState();

  const [showThreadAdd, setShowThreadAdd] = useState(false);

  const isArtifactInThread = researchThreads.research_threads.filter(
    (f: ResearchThread) => {
      let temp = f.evidence.filter(
        (e: ResearchThreadEvidence) => e.type === 'artifact'
      );
      temp =
        temp.length > 0
          ? temp.filter(
              (tm: ResearchThreadEvidence) =>
                tm.activityTitle === selectedArtifactEntry.title &&
                tm.artifactIndex === selectedArtifactIndex
            )
          : [];
      return temp.length > 0;
    }
  );

  return (
    <Box
      marginLeft="8px"
      marginRight="8px"
      
      flex="2"
      flexDirection="column"
      h="calc(100vh - 250px)"
      overflow="auto"
    >

      <Box>
        <div style={{ fontSize: 20, fontWeight: 700, marginTop:20 }}>Activity Tags</div>
        {selectedArtifactEntry.tags.map((t: any, i: number) => (
          <InteractiveActivityTag
            key={`it-${i}`}
            selectedArtifactEntry={selectedArtifactEntry}
            selectedArtifactIndex={selectedArtifactIndex}
            tag={t}
            index={i}
          />
        ))}
      </Box>

      {fragSelected && (
        <div style={{ padding: '5px' }}>
          <span style={{ backgroundColor: '#FFFBC8' }}>{fragSelected}</span>
        </div>
      )}
      <Box
        style={{
          backgroundColor: '#ececec',
          borderRadius: 5,
          marginTop: 15,
          marginBottom: 15,
        }}
      >
        <span
          style={{
            fontSize: 17,
            fontWeight: 700,
            cursor: 'pointer',
            padding: 3,
            textAlign: 'center',
          }}
          onClick={() => {
            showThreadAdd ? setShowThreadAdd(false) : setShowThreadAdd(true);
          }}
        >
          {fragSelected
            ? 'Add this fragment to a thread +'
            : 'Add this artifact to a thread +'}
        </span>
        <div>
          {showThreadAdd && (
            <>
              {researchThreads &&
              researchThreads.research_threads.length > 0 ? (
                <div>
                  {researchThreads.research_threads.map(
                    (thread: any, ti: number) => (
                      <React.Fragment key={`tr-${ti}`}>
                        {fragSelected ? (
                          <FragmentToThread
                            thread={thread}
                            threadIndex={ti}
                            activity={selectedArtifactEntry}
                            artifactIndex={selectedArtifactIndex}
                            fragSelected={fragSelected}
                            setFragSelected={setFragSelected}
                          />
                        ) : (
                          <ArtifactToThread
                            thread={thread}
                            threadIndex={ti}
                            activity={selectedArtifactEntry}
                            artifactIndex={selectedArtifactIndex}
                          />
                        )}
                      </React.Fragment>
                    )
                  )}
                </div>
              ) : (
                <div>No research threads yet.</div>
              )}
            </>
          )}{' '}
        </div>
      </Box>

      <Box>
        {isArtifactInThread.length > 0 && (
          <div>
            <span style={{ fontWeight: 600, marginTop: 10, marginBottom: 10 }}>
              This artifact is associated with:
            </span>
            <ThreadNav researchTs={isArtifactInThread} viewType="detail" />
          </div>
        )}
      </Box>
    </Box>
  );
};

const ArtifactDetailWindow = (props: DetailProps) => {
  const { setViewType, folderPath, projectData } = props;

  const [{ selectedArtifactEntry, selectedArtifactIndex, goBackView }, dispatch] =
    useProjectState();

  const [editable, setEditable] = useState<boolean[]>(
    Array.from(Array(projectData.entries.length), (_) => false)
  );

  const [fragSelected, setFragSelected] = useState(null);

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

  return (
    <div style={{ height: '100vh', position: 'fixed', top: 0, bottom: 0 }}>
      <Box
        position="fixed"
        left={0}
        right={0}
        flexFlow="row wrap"
        zIndex={1000}
        height={200}
      >
        <Flex
          minH="60px"
          py={{ base: 2 }}
          px={{ base: 4 }}
          borderBottom={1}
          borderStyle="solid"
          borderColor="gray.200"
          alignSelf="center"
          alignContent="center"
        >
          <Button
            onClick={() => {
              dispatch({
                type: 'SELECTED_ARTIFACT',
                selectedArtifactEntry: null,
                selectedArtifactIndex: null,
              });
              setViewType(goBackView);
            }}
          >
            {`Go back to ${goBackView} view`}
          </Button>
          <Spacer/>
          <div style={{fontSize:18, alignContent:'center', paddingTop:5}}>{`Activity: ${selectedArtifactEntry.title}`}</div>
          <Spacer/>
          <div style={{fontSize:18, fontWeight:700, alignContent:'center', paddingTop:5}}>{`Artifact: ${selectedArtifactEntry.files[selectedArtifactIndex].title}`}</div>
        </Flex>
        <Flex alignContent="center">
          <Spacer />
          <Box flexGrow={4} minWidth="50%">
            <TopTimeline viewType="detail" />
          </Box>
          <Spacer />
        </Flex>
      </Box>
      <Flex
        position="relative"
        top={220}
        bottom={0}
        height="calc(100% - 150px)"
      >
      <DetailSidebar
        fragSelected={fragSelected}
        setFragSelected={setFragSelected}
        selectedArtifactEntry={selectedArtifactEntry}
        selectedArtifactIndex={selectedArtifactIndex}
      />

      <Box flex="2" h="calc(100vh - 250px)" overflowY="auto">
          
        <Box style={{marginBottom:20}}>
          <div>
            <span style={{ fontSize: 20, fontWeight: 700 }}>
              {`Artifacts associated with ${selectedArtifactEntry.title}`}
            </span>
          </div>
          <Box
            marginLeft="3px"
            borderLeftColor="black"
            borderLeftWidth="1px"
            padding="3px"
          >
          {selectedArtifactEntry.files.map((f: any, i: number) => (
            <React.Fragment key={`fi-${f.title}-${i}`}>
              {i === selectedArtifactIndex ? (
                <div style={{ backgroundColor: '#FFFBC8', fontWeight: 600 }}>
                  {selectedArtifactEntry.files[i].title}
                </div>
              ) : (
                <div>{selectedArtifactEntry.files[i].title}</div>
              )}
            </React.Fragment>
          ))}
          </Box>
        </Box>

          <ActivityWrap 
          key={`${selectedArtifactEntry.title}-${selectedArtifactEntry.index}`}
          activityData={selectedArtifactEntry} 
          editable={false}
          setEditableStatus={setEditableStatus} 
          setViewType={setViewType}
          setSelectedArtifactIndex={null}
          setSelectedArtifactEntry={null}
          index={selectedArtifactEntry.index}
          hoverActivity={null}
          viewType={"detail"}
          />
        </Box>


        <Box flex="4">
          {(selectedArtifactEntry.files[selectedArtifactIndex].fileType ===
            'txt' ||
            selectedArtifactEntry.files[selectedArtifactIndex].fileType ===
              'gdoc') && (
            <Flex p={5} width="100%" alignItems="center" alignContent="center">
              <QueryBar
                marginLeft={60}
                artifactData={
                  selectedArtifactEntry.files[selectedArtifactIndex]
                }
              />
            </Flex>
          )}

          <Flex
            style={{
              justifyContent: 'center',
              alignItems: 'stretch',
              height: '90%',
              paddingLeft:20,
              paddingRight:20
            }}
          >
            <Flex style={{ alignItems: 'center' }}>
              {/* <span
                onClick={() => {
                  const entryIndex = selectedArtifactEntry.index;
                  if (entryIndex === 0) {
                    dispatch({
                      type: 'SELECTED_ARTIFACT',
                      selectedArtifactEntry:
                        projectData.entries[projectData.entries.length - 1],
                      selectedArtifactIndex: 0,
                    });
                  } else {
                    dispatch({
                      type: 'SELECTED_ARTIFACT',
                      selectedArtifactEntry:
                        projectData.entries[entryIndex - 1],
                      selectedArtifactIndex: 0,
                    });
                  }
                }}
                style={{ fontWeight: 700, fontSize: '24px', padding: '3px' }}
              >
                {'<<'}
              </span>
              <span
                onClick={() => {
                  if (selectedArtifactIndex > 0) {
                    dispatch({
                      type: 'SELECTED_ARTIFACT',
                      selectedArtifactEntry,
                      selectedArtifactIndex: selectedArtifactIndex - 1,
                    });
                  } else {
                    dispatch({
                      type: 'SELECTED_ARTIFACT',
                      selectedArtifactEntry,
                      selectedArtifactIndex:
                        selectedArtifactEntry.files.length - 1,
                    });
                  }
                }}
                style={{ fontWeight: 500, fontSize: '16px', padding: '3px' }}
              >
                {'<<'}
              </span> */}
            </Flex>

            <DetailPreview
              setFragSelected={setFragSelected}
              folderPath={folderPath}
              artifact={selectedArtifactEntry.files[selectedArtifactIndex]}
              activity={selectedArtifactEntry}
              artifactIndex={selectedArtifactIndex}
              openFile={openFile}
            />

            <Flex style={{ alignItems: 'center' }}>
              {/* <span
                onClick={() => {
                  const len = selectedArtifactEntry.files.length;
                  if (selectedArtifactIndex < len - 1) {
                    dispatch({
                      type: 'SELECTED_ARTIFACT',
                      selectedArtifactEntry,
                      selectedArtifactIndex: selectedArtifactIndex + 1,
                    });
                  } else {
                    dispatch({
                      type: 'SELECTED_ARTIFACT',
                      selectedArtifactEntry,
                      selectedArtifactIndex: 0,
                    });
                  }
                }}
                style={{ fontWeight: 500, fontSize: '16px', padding: '3px' }}
              >
                {'>>'}
              </span>

              <span
                onClick={() => {
                  console.log(selectedArtifactEntry.index);
                  const entryIndex = selectedArtifactEntry.index;
                  if (entryIndex === projectData.entries.length - 1) {
                    dispatch({
                      type: 'SELECTED_ARTIFACT',
                      selectedArtifactEntry: projectData.entries[0],
                      selectedArtifactIndex: 0,
                    });
                  } else {
                    dispatch({
                      type: 'SELECTED_ARTIFACT',
                      selectedArtifactEntry:
                        projectData.entries[entryIndex + 1],
                      selectedArtifactIndex: 0,
                    });
                  }
                }}
                style={{ fontWeight: 700, fontSize: '24px', padding: '3px' }}
              >
                {'>>'}
              </span> */}
            </Flex>
          </Flex>
        </Box>

      </Flex>
    </div>
    // </div>
  );
};

export default ArtifactDetailWindow;
