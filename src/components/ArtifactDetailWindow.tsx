import React, { useEffect, useState } from 'react';
import { Flex, Box, Button, Spacer, Textarea, Badge, Tag, TagLabel, TagCloseButton, Tooltip } from '@chakra-ui/react';
import { WithContext as ReactTags } from 'react-tag-input';
import { FaArrowLeft, FaArrowRight, FaEye, FaEyeSlash, FaMapPin } from 'react-icons/fa';

import { openFile } from '../fileUtil';
import DetailPreview from './DetailPreview';
import { useProjectState } from './ProjectContext';
import QueryBar from './QueryBar';
import type {
  ResearchThread,
  ResearchThreadEvidence,
  ReactTag,
} from './types';
import DetailBubble from './DetailSvg';
import ActivityTitlePopoverLogic from './PopoverTitle';

interface DetailProps {
  setViewType: (view: string) => void;
  folderPath: string;
  projectData: any;
  selectedArtifactEntry:any;
  selectedArtifactIndex:any;
  goBackView:any;
  hopArray:any;
  researchThreads:any;
  googleData:any;
  txtData:any;
  dispatch: (dis: any) => void;
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
const FragmentToBookmark = (props: any) => {
  const [, dispatch] = useProjectState();

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

const FragmentToThread = (props: any) => {
  const [, dispatch] = useProjectState();

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

 
  const tagMatches = projectData.entries.filter(
    (f: any) => f.tags.indexOf(tag) > -1
  );

  return (
    <Box
      key={`tag-sel-${index}`}
      style={{
        padding: 5,
        backgroundColor: '#F5F5F5',
        borderRadius: 5,
        margin: 5,
        verticalAlign: 'middle',
        lineHeight: 'normal',
        boxShadow: "1px 1px 2px #A3AAAF"
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
              const newHop = [...hopArray, {
                activity: tagMatches[tagMatches.length - 1], 
                artifactUid: tagMatches[tagMatches.length - 1].files[0].artifact_uid,
                hopReason: 'tag',
                tag: tag,
              }];
              dispatch({
                type: 'SELECTED_ARTIFACT',
                selectedArtifactEntry: tagMatches[tagMatches.length - 1],
                selectedArtifactIndex: 0,
                hopArray: newHop,
              });
            } else {
              const newHop = [...hopArray, {
                activity: tagMatches[indexOfE - 1], 
                artifactUid: tagMatches[indexOfE - 1].files[0].artifact_uid,
                hopReason: 'tag',
                tag: tag,
              }];
              dispatch({
                type: 'SELECTED_ARTIFACT',
                selectedArtifactEntry: tagMatches[indexOfE - 1],
                selectedArtifactIndex: 0,
                hopArray: newHop,
              });
            }
          }}
        >
          <FaArrowLeft />
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
              const newHop = [...hopArray, {
                activity: tagMatches[0], 
                artifactUid: tagMatches[0].files[0].artifact_uid,
                hopReason: 'tag',
                tag: tag,
              }];
              dispatch({
                type: 'SELECTED_ARTIFACT',
                selectedArtifactEntry: tagMatches[0],
                selectedArtifactIndex: 0,
                hopArray: newHop,
              });
            } else {
              const newHop = [...hopArray,  {
                activity: tagMatches[indexOfE + 1], 
                artifactUid: tagMatches[indexOfE + 1].files[0].artifact_uid,
                hopReason: 'tag',
                tag: tag,
              }];
              dispatch({
                type: 'SELECTED_ARTIFACT',
                selectedArtifactEntry: tagMatches[indexOfE + 1],
                selectedArtifactIndex: 0,
                hopArray: newHop,
              });
            }
          }}
        >
          <FaArrowRight />
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
                    cursor: 'pointer',
                  }}
                  key={`match-${i}`}
                  onClick={() => {
                    const newHop = [...hopArray,  { 
                      activity: t, 
                      artifactUid: t.files[0].artifact_uid,
                      hopReason: 'tag',
                      tag: tag
                    }];
                    dispatch({
                      type: 'SELECTED_ARTIFACT',
                      selectedArtifactEntry: t,
                      selectedArtifactIndex: 0,
                      hopArray: newHop,
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
    researchThreads, 
    projectData, 
    hopArray
  } = props;

  

  // const [{ researchThreads, projectData, hopArray }, dispatch] = useProjectState();

  const KeyCodes = {
    comma: 188,
    enter: 13,
  };

  const selectedArtifact = selectedArtifactEntry.files.length > 0 ? selectedArtifactEntry[selectedArtifactIndex] : null;

  const [showThreadAdd, setShowThreadAdd] = useState(false);
  const [showTagAdd, setShowTagAdd] = useState(false);
  const [showFileList, setShowFileList] = useState(true);
  const [showTagList, setShowTagList] = useState(true);

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
      width="300px"
      flexDirection="column"
      h="calc(100vh - 75px)"
      overflow="auto"
    >
      <Box 
        flex="2" 
        overflowY="auto" 
        boxShadow={"3px 3px 8px #A3AAAF"}
        border={"1px solid #A3AAAF"}
        borderRadius={6}
        p={5}
      >
        <Box style={{ marginBottom: 20 }}>
          <div>
            <span style={{ fontSize: 20, fontWeight: 700 }}>
              {`Artifacts associated with ${selectedArtifactEntry.title}`}
              <span
                style={{cursor:'pointer', display:'inline', marginLeft:10}}
                onClick={()=> showFileList ? setShowFileList(false) : setShowFileList(true)}
              >{showFileList ? <FaEye style={{cursor:'pointer', display:'inline'}}/> : <FaEyeSlash style={{cursor:'pointer', display:'inline'}}/>}</span>
            </span>
          </div>
            {
              showFileList && (
                <Box
                marginLeft="3px"
                borderLeftColor="black"
                borderLeftWidth="1px"
                padding="3px"
              >{
                selectedArtifactEntry.files.map((f: any, i: number) => (
                  <React.Fragment key={`fi-${f.title}-${i}`}>
                    {i === selectedArtifactIndex ? (
                      <div style={{ backgroundColor: '#FFFBC8', fontWeight: 600 }}>
                        {selectedArtifactEntry.files[i].title}
                      </div>
                    ) : (
                      <div
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          dispatch({
                            type: 'SELECTED_ARTIFACT',
                            selectedArtifactEntry,
                            selectedArtifactIndex: i,
                            hopArray: [
                              ...hopArray,
                              { activity: 
                                selectedArtifactEntry, 
                                artifactUid: selectedArtifactEntry.files[i].artifact_uid,
                                hopReason: 'another artifact in activity',
                              },
                            ]
                          });
                        }}
                      >
                        {selectedArtifactEntry.files[i].title}
                      </div>
                    )}
                  </React.Fragment>
                ))}
                </Box>
              )
            }
            
         
        </Box>
      </Box>
      {
        selectedArtifact && (
          <Box>
            <span style={{marginTop:10, fontSize:12, fontWeight:400, display:'block'}}>Copy to cite this artifact:</span>
            <Badge
            style={{wordWrap:'break-word'}}
            >{selectedArtifact ?  selectedArtifact.artifact_uid : "No Artifact to Cite"}</Badge>
          </Box>
        )
      }
     
      <Box>
        <div style={{ fontSize: 20, fontWeight: 700, marginTop: 20 }}>
          Activity Tags
          <Button
            style={{ marginLeft: '10px' }}
            onClick={() => {
              showTagAdd ? setShowTagAdd(false) : setShowTagAdd(true);
            }}
          >
            Edit
          </Button>
          <Button
            style={{cursor:'pointer', display:'inline', marginLeft:10}}
            onClick={()=> showTagList ? setShowTagList(false) : setShowTagList(true)}
          >{showTagList ? <FaEye style={{cursor:'pointer', display:'inline'}}/> : <FaEyeSlash style={{cursor:'pointer', display:'inline'}}/>}</Button>
            
        </div>
        {showTagAdd && (
          <div>
            <ReactTags
              tags={projectData.entries[selectedArtifactEntry.index].tags.map(
                (t) => ({ id: t, text: t })
              )}
              suggestions={projectData.tags.map((t) => ({
                id: t.title,
                text: t.title,
              }))}
              delimiters={[KeyCodes.comma, KeyCodes.enter]}
              handleDelete={(i: number) =>
                updateEntryField(
                  selectedArtifactEntry.index,
                  'tags',
                  selectedArtifactEntry.tags.filter(
                    (_tag: any, index: number) => index !== i
                  )
                )
              }
              handleAddition={(tag: ReactTag) => {
                dispatch({
                  type: 'ADD_TAG_TO_ENTRY',
                  newTag: tag,
                  entryIndex: selectedArtifactEntry.index,
                });
                dispatch({
                  type: 'SELECTED_ARTIFACT',
                  selectedArtifactEntry:
                    projectData.entries[selectedArtifactEntry.index],
                  selectedArtifactIndex,
                  hopArray:hopArray
                });
              }}
            />
          </div>
        )}
        {
          showTagList && (
            <React.Fragment>
              {selectedArtifactEntry.tags.map((t: any, i: number) => (
                <InteractiveActivityTag
                  key={`it-${i}`}
                  selectedArtifactEntry={selectedArtifactEntry}
                  selectedArtifactIndex={selectedArtifactIndex}
                  tag={t}
                  index={i}
                />
              ))}
            </React.Fragment>
          )
        }
      </Box>

      {(fragSelected != null && fragSelected.length > 1) && (
        <div style={{ padding: '5px', marginTop:10 }}>
          <div
          style={{ fontSize:20, fontWeight:600 }}
          >Selected Fragment:</div>
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
            // console.log(selectedArtifactIndex, selectedArtifactEntry, fragSelected)
            dispatch({
              type: 'BOOKMARK_FRAGMENT',
              selectedArtifactEntry: selectedArtifactEntry,
              selectedArtifactIndex: selectedArtifactIndex,
              bookmarkFragment: fragSelected,
            });
          }}
        >
          {fragSelected && (
            'Bookmark this fragment'
          )}
        </span>
      </Box>

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
            <span style={{ fontWeight: 600, fontSize:20, marginTop: 10, marginBottom: 10 }}>
              This artifact is associated with:
            </span>
              {
                isArtifactInThread.map((a, i)=> (
                  <div
                    key={`thread-${i}`}
                  >

                    <div
                    style={{backgroundColor: `${a.color}50`}}
                    >{a.title}</div>
                    {
                      a.evidence.filter((e)=> e.artifactTitle === selectedArtifactEntry.files[selectedArtifactIndex].title).map((m, j) => (
                        <React.Fragment key={`evi-${j}`}>
                        {m.type === "fragment" && (
                          <span>{m.anchors[0].frag_type}</span>
                        )}
                        {
                          <span>{m.rationale}</span>
                        }
                        </React.Fragment>
                      ))
                    }
                  </div>
                ))
              }
            {/* <ThreadNav researchTs={isArtifactInThread} viewType="detail" /> */}
          </div>
        )}
      </Box>
    </Box>
  );
};

const ArtifactDetailWindow = (props: DetailProps) => {
  const { 
    setViewType, 
    folderPath, 
    selectedArtifactEntry,
    selectedArtifactIndex,
    goBackView,
    projectData,
    hopArray,
    researchThreads,
    googleData,
    txtData,
    dispatch  } = props;


  const [editable, setEditable] = useState<boolean[]>(
    Array.from(Array(projectData.entries.length), (_) => false)
  );

  const selectedArtifact = selectedArtifactEntry.files.length > 0 ? selectedArtifactEntry.files[selectedArtifactIndex] : null;

  const height = 900;
  const [fragSelected, setFragSelected] = useState(null);

  const [newHeight, setNewHeight] = useState('1000px');

  const viewheight = +newHeight.split('px')[0];
  const margin = viewheight * .15;

  useEffect(() => {
    if (editable.length === projectData.entries.length - 1) {
      // one more entry was added
      setEditable([...editable, true]);
    } else if (editable.length !== projectData.entries.length) {
      setEditable(
        Array.from(Array(projectData.entries.length), (_) => false)
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
                hopArray: [],
              });
              setViewType(goBackView);
            }}
          >
            {`Go back to ${goBackView} view`}
          </Button>
          <Spacer />
          <div style={{ fontSize: 18, alignContent: 'center', paddingTop: 5 }}>
            <Button
              style={{ marginRight: '10px' }}
              onClick={() => {
                const selectActivity = selectedArtifactEntry.index > 0
                ? projectData.entries[selectedArtifactEntry.index - 1]
                : projectData.entries[projectData.entries.length - 1];

                const newHop = [
                  ...hopArray,
                  { activity: 
                    selectActivity, 
                    artifactUid: selectActivity && selectActivity.files[0].artifact_uid ? selectActivity.files[0].artifact_uid : null,
                    hopReason: 'time hop back',
                  },
                ];
                dispatch({
                  type: 'SELECTED_ARTIFACT',
                  selectedArtifactEntry: selectActivity,
                  selectedArtifactIndex: 0,
                  hopArray: newHop,
                });
              }}
            >
              <FaArrowLeft />
            </Button>

            {` Activity:`}
              <ActivityTitlePopoverLogic activityData={selectedArtifactEntry} researchThreads={researchThreads} />
            <Button
              style={{ marginLeft: '10px' }}
              onClick={() => {
                const selectActivity = selectedArtifactEntry.index < projectData.entries.length - 1
                ? projectData.entries[selectedArtifactEntry.index + 1]
                : projectData.entries[0];

                const newHop = [
                  ...hopArray,
                  { activity: selectActivity, 
                    artifactUid: (selectActivity && selectActivity.files.length > 0 && selectActivity.files[0].artifact_uid) ? selectActivity.files[0].artifact_uid : null,
                    hopReason: 'time hop forward',
                  },
                ];
               
                dispatch({
                  type: 'SELECTED_ARTIFACT',
                  selectedArtifactEntry: selectActivity,
                  selectedArtifactIndex: 0,
                  hopArray: newHop,
                });
              }}
            >
              <FaArrowRight />
            </Button>
          </div>
          <Spacer />
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              alignContent: 'center',
              paddingTop: 5,
            }}
          >{`Artifact: ${selectedArtifact ? selectedArtifact.title : "No artifacts with this activity"}`}</div>
        </Flex>
      </Box>
      <Flex
        position="relative"
        top={70}
        bottom={0}
        height="calc(100% - 150px)"
      >
        <DetailSidebar
          fragSelected={fragSelected}
          setFragSelected={setFragSelected}
          selectedArtifactEntry={selectedArtifactEntry}
          selectedArtifactIndex={selectedArtifactIndex}
          researchThreads={researchThreads}
          projectData={projectData} 
          hopArray={hopArray}
        />

        <div style={{ width:260 }}>
          <DetailBubble 
            filteredActivities={projectData.entries}
            widthSvg={260}
            filterType={null}
          />
          {/* <svg ref={svgRef} width={'calc(100% - 200px)'} height={height} style={{display:'inline'}}/> */}
        </div>
        {
          selectedArtifact && (
            <Box flex="3.5">
              {(selectedArtifact.fileType ===
                'txt' ||
                selectedArtifact.fileType ===
                  'gdoc') && (
                <Flex p={5} width="100%" alignItems="center" alignContent="center">
              <QueryBar
                marginLeft={60}
                artifactData={
                  selectedArtifact
                }
              />
              <Box>
                {
                  selectedArtifact.bookmarks && (
                    selectedArtifact.bookmarks.map((f, i)=> (
                    //
                    <React.Fragment key={`pin-${i}`}>
                    <Tooltip 
                    style={{padding:5}}
                    label={`"${f.fragment}"`}>
                      
                    <Tag
                      size={'md'}
                      borderRadius='full'
                      variant='solid'
                      colorScheme='gray'
                      style={{cursor:'pointer', marginRight:5}}

                    > 
                    <TagLabel
                      onClick={()=> {
                        setFragSelected(f.fragment);
                      }}
                    ><FaMapPin/></TagLabel>
                    <TagCloseButton
                      onClick={()=> {
                        dispatch({
                          type: 'REMOVE_BOOKMARK',
                          selectedArtifactEntry: selectedArtifactEntry,
                          selectedArtifactIndex: selectedArtifactIndex,
                          fragIndex: i
                        });
                      }}
                    />
                  </Tag>
                    </Tooltip>
                    </React.Fragment>
                  )) )
                }
              </Box>
            </Flex>
          )}

            <Flex
              style={{
                justifyContent: 'center',
                alignItems: 'stretch',
                height: '90%',
                paddingLeft: 20,
                paddingRight: 20,
              }}
            >
              {
                selectedArtifact ?
                <DetailPreview
                  // artifactRenderedRef={artifactRenderedRef}
                  setFragSelected={setFragSelected}
                  fragSelected={fragSelected}
                  folderPath={folderPath}
                  artifact={selectedArtifactEntry.files[selectedArtifactIndex]}
                  activity={selectedArtifactEntry}
                  artifactIndex={selectedArtifactIndex}
                  openFile={openFile}
                  googleData={googleData}
                  txtData={txtData}
                /> : <div>{'No Artifact for this activity'}</div>
              }
              
            </Flex>
          </Box>
          )
        }
        
      </Flex>
    </div>
    // </div>
  );
};

export default ArtifactDetailWindow;
