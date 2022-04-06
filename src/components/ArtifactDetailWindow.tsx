import React, { useEffect, useState } from 'react';
import { Flex, Box, Button, Spacer, Textarea } from '@chakra-ui/react';
import { openFile } from '../fileUtil';
import DetailPreview from './DetailPreview';
import { useProjectState } from './ProjectContext';
import QueryBar from './QueryBar';
import ThreadNav from './ThreadNav';
import type { ResearchThread, ResearchThreadEvidence, ReactTag, EntryPropTypes } from './types';
import VerticalAxis from './VerticalAxis';
import { WithContext as ReactTags } from 'react-tag-input';

interface DetailProps {
  setViewType: (view: string) => void;
  folderPath: string;
  projectData: any;
  filteredActivities:any;
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
  const [{ projectData, hopArray }, dispatch] = useProjectState();
  const [expandedTag, setExpandedTag] = useState(false);

  console.log('hop array', hopArray);

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
              const newHop = [...hopArray, tagMatches[tagMatches.length - 1]];
              dispatch({
                type: 'SELECTED_ARTIFACT',
                selectedArtifactEntry: tagMatches[tagMatches.length - 1],
                selectedArtifactIndex: 0,
                hopArray: newHop
              });
            } else {
              const newHop = [ ...hopArray, tagMatches[indexOfE - 1] ];
              dispatch({
                type: 'SELECTED_ARTIFACT',
                selectedArtifactEntry: tagMatches[indexOfE - 1],
                selectedArtifactIndex: 0,
                hopArray: newHop
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
              const newHop = [ ...hopArray, tagMatches[0] ];
              dispatch({
                type: 'SELECTED_ARTIFACT',
                selectedArtifactEntry: tagMatches[0],
                selectedArtifactIndex: 0,
                hopArray: newHop
              });
            } else {
              const newHop = [ ...hopArray, tagMatches[indexOfE + 1] ];
              dispatch({
                type: 'SELECTED_ARTIFACT',
                selectedArtifactEntry: tagMatches[indexOfE + 1],
                selectedArtifactIndex: 0,
                hopArray: newHop
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
                    const newHop = [ ...hopArray, t ];
                    console.log('T in tags', t, newHop);
                    dispatch({
                      type: 'SELECTED_ARTIFACT',
                      selectedArtifactEntry: t,
                      selectedArtifactIndex: 0,
                      hopArray: newHop
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

  const [{ researchThreads, projectData }, dispatch] = useProjectState();

  const KeyCodes = {
    comma: 188,
    enter: 13,
  };

  console.log('projectData!!', projectData.entries[selectedArtifactEntry.index])

  const [showThreadAdd, setShowThreadAdd] = useState(false);
  const [showTagAdd, setShowTagAdd] = useState(false);

  const updateEntryField = (
    entryIndex: number,
    fieldName: string,
    newValue: any
  ) => {
    dispatch({ type: 'UPDATE_ENTRY_FIELD', entryIndex, fieldName, newValue });
};

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
      h="calc(100vh - 150px)"
      overflow="auto"
    >
      <Box flex="2" overflowY="auto">  
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
                <div
                style={{cursor:'pointer'}}
                onClick={()=>{
                  dispatch({
                    type: 'SELECTED_ARTIFACT',
                    selectedArtifactEntry: selectedArtifactEntry,
                    selectedArtifactIndex: i,
                  });
                }}
                >{selectedArtifactEntry.files[i].title}</div>
              )}
            </React.Fragment>
          ))}
          </Box>
        </Box>

      </Box>
      <Box>
        <div style={{ fontSize: 20, fontWeight: 700, marginTop:20 }}>{'Activity Tags'}
        <Button
          style={{marginLeft:'10px'}}
          onClick={()=> {
            showTagAdd ? setShowTagAdd(false) : setShowTagAdd(true);
          }}
        >{"Edit"}</Button>
        </div>
        {
          showTagAdd && (
            <div>
              <ReactTags
                tags={projectData.entries[selectedArtifactEntry.index].tags.map((t) => ({ id: t, text: t }))}
                suggestions={projectData.tags.map((t) => ({ id: t.title, text: t.title }))}
                delimiters={[KeyCodes.comma, KeyCodes.enter]}
                handleDelete={(i: number) =>
                  updateEntryField(
                    selectedArtifactEntry.index,
                    'tags',
                    selectedArtifactEntry.tags.filter((_tag, index) => index !== i)
                  )
                }
                handleAddition={(tag: ReactTag) => {
                  dispatch({ type: 'ADD_TAG_TO_ENTRY', newTag: tag, entryIndex: selectedArtifactEntry.index });
                  dispatch({
                    type: 'SELECTED_ARTIFACT',
                    selectedArtifactEntry: projectData.entries[selectedArtifactEntry.index],
                    selectedArtifactIndex: selectedArtifactIndex,
                  });
                }}
      />
            </div>
          )
        }
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
  const { setViewType, folderPath, filteredActivities } = props;
  const [{ selectedArtifactEntry, selectedArtifactIndex, goBackView, projectData, hopArray }, dispatch] =
    useProjectState();

  const [editable, setEditable] = useState<boolean[]>(
    Array.from(Array(projectData.entries.length), (_) => false)
  );

  const width = 200;
  const height = 900;
  const svgRef = React.useRef(null);
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

  return (
    <div style={{ height: '100vh', position: 'fixed', top: 0, bottom: 0 }}>
      <Box
        position="fixed"
        left={0}
        right={0}
        flexFlow="row wrap"
        zIndex={1000}
        height={100}
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
                hopArray: []
              });
              setViewType(goBackView);
            }}
          >
            {`Go back to ${goBackView} view`}
          </Button>
          <Spacer/>
          <div style={{fontSize:18, alignContent:'center', paddingTop:5}}>
            <Button
            style={{marginRight:'10px'}}
            onClick={()=> {
              const newHop = [...hopArray, projectData.entries[(selectedArtifactEntry.index - 1)] ];
              dispatch({
                type: 'SELECTED_ARTIFACT',
                selectedArtifactEntry: selectedArtifactEntry.index > 0 ? projectData.entries[selectedArtifactEntry.index - 1] : projectData.entries[projectData.entries.length - 1],
                selectedArtifactIndex: 0,
                hopArray: newHop
              });
            }}
            >{'<<'}</Button>
            {` Activity: ${selectedArtifactEntry.title} `}
            <Button
              style={{marginLeft:'10px'}}
              onClick={()=> {
                let newHop = [...hopArray, projectData.entries[(selectedArtifactEntry.index + 1)] ];
              
                dispatch({
                  type: 'SELECTED_ARTIFACT',
                  selectedArtifactEntry: selectedArtifactEntry.index < projectData.entries.length - 1 ? projectData.entries[selectedArtifactEntry.index + 1] : projectData.entries[0],
                  selectedArtifactIndex: 0,
                  hopArray: newHop
                });
              }}
            >{'>>'}</Button>
            </div>
          <Spacer/>
          <div style={{fontSize:18, fontWeight:700, alignContent:'center', paddingTop:5}}>{`Artifact: ${selectedArtifactEntry.files[selectedArtifactIndex].title}`}</div>
        </Flex>
      </Box>
      <Flex
        position="relative"
        top={120}
        bottom={0}
        height="calc(100% - 150px)"
      >
      <DetailSidebar
        fragSelected={fragSelected}
        setFragSelected={setFragSelected}
        selectedArtifactEntry={selectedArtifactEntry}
        selectedArtifactIndex={selectedArtifactIndex}
      />

      <div style={{flex:1}}>
            <VerticalAxis filteredActivities={filteredActivities} height={height}/>
            {/* <svg ref={svgRef} width={'calc(100% - 200px)'} height={height} style={{display:'inline'}}/> */}
        </div>

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

            <DetailPreview
              setFragSelected={setFragSelected}
              folderPath={folderPath}
              artifact={selectedArtifactEntry.files[selectedArtifactIndex]}
              activity={selectedArtifactEntry}
              artifactIndex={selectedArtifactIndex}
              openFile={openFile}
            />

          </Flex>
        </Box>

      </Flex>
    </div>
    // </div>
  );
};

export default ArtifactDetailWindow;
