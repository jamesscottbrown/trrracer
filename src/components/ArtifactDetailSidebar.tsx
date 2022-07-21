import React, { useState } from 'react';
import { Flex, Box, Button, Spacer, Textarea } from '@chakra-ui/react';
import { WithContext as ReactTags } from 'react-tag-input';
import { FaArrowLeft, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useProjectState } from './ProjectContext';

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
        boxShadow: '1px 1px 2px #A3AAAF',
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
              const newHop = [
                ...hopArray,
                {
                  activity: tagMatches[tagMatches.length - 1],
                  artifactUid:
                    tagMatches[tagMatches.length - 1].files[0].artifact_uid,
                  hopReason: 'tag',
                  tag,
                },
              ];
              dispatch({
                type: 'SELECTED_ARTIFACT',
                selectedArtifactEntry: tagMatches[tagMatches.length - 1],
                selectedArtifactIndex: 0,
                hopArray: newHop,
              });
            } else {
              const newHop = [
                ...hopArray,
                {
                  activity: tagMatches[indexOfE - 1],
                  artifactUid: tagMatches[indexOfE - 1].files[0].artifact_uid,
                  hopReason: 'tag',
                  tag,
                },
              ];
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
              const newHop = [
                ...hopArray,
                {
                  activity: tagMatches[0],
                  artifactUid: tagMatches[0].files[0].artifact_uid,
                  hopReason: 'tag',
                  tag,
                },
              ];
              dispatch({
                type: 'SELECTED_ARTIFACT',
                selectedArtifactEntry: tagMatches[0],
                selectedArtifactIndex: 0,
                hopArray: newHop,
              });
            } else {
              const newHop = [
                ...hopArray,
                {
                  activity: tagMatches[indexOfE + 1],
                  artifactUid: tagMatches[indexOfE + 1].files[0].artifact_uid,
                  hopReason: 'tag',
                  tag,
                },
              ];
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
                    const newHop = [
                      ...hopArray,
                      {
                        activity: t,
                        artifactUid: t.files[0].artifact_uid,
                        hopReason: 'tag',
                        tag: tag,
                      },
                    ];
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

const ArtifactDetailSidebar = (props: any) => {
  const { fragSelected, setFragSelected } = props;

  const [
    {
      researchThreads,
      projectData,
      hopArray,
      selectedArtifactEntry,
      selectedArtifactIndex,
      isReadOnly,
      viewParams,
    },
    dispatch,
  ] = useProjectState();

  const KeyCodes = {
    comma: 188,
    enter: 13,
  };

  console.log(
    'selected in sidebar detail',
    selectedArtifactEntry,
    researchThreads
  );

  const selectedArtifact =
    selectedArtifactEntry.files.length > 0
      ? selectedArtifactEntry.files[selectedArtifactIndex]
      : null;
  let isArtifactInThread = researchThreads?.research_threads.filter((f) => {
    const test = f.evidence.filter(
      (e) => e.activityTitle === selectedArtifactEntry.title
    );
    return test.length > 0;
  });

  console.log('in in??', isArtifactInThread);
  const [showThreadAdd, setShowThreadAdd] = useState(false);
  const [showTagAdd, setShowTagAdd] = useState(false);
  const [showFileList, setShowFileList] = useState(true);
  const [showTagList, setShowTagList] = useState(true);

  const updateEntryField = (fieldName: string, newValue: any) => {
    dispatch({
      type: 'UPDATE_ENTRY_FIELD',
      fieldName,
      newValue,
      activityID: selectedArtifactEntry.activity_uid,
    });
  };

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
        boxShadow="3px 3px 8px #A3AAAF"
        border="1px solid #A3AAAF"
        borderRadius={6}
        p={5}
      >
        <Box style={{ marginBottom: 20 }}>
          <div>
            <span style={{ fontSize: 20, fontWeight: 700 }}>
              {`Artifacts associated with ${selectedArtifactEntry.title}`}
              <span
                style={{ cursor: 'pointer', display: 'inline', marginLeft: 10 }}
                onClick={() =>
                  showFileList ? setShowFileList(false) : setShowFileList(true)
                }
              >
                {showFileList ? (
                  <FaEye style={{ cursor: 'pointer', display: 'inline' }} />
                ) : (
                  <FaEyeSlash
                    style={{ cursor: 'pointer', display: 'inline' }}
                  />
                )}
              </span>
            </span>
          </div>
          {showFileList && (
            <Box
              marginLeft="3px"
              borderLeftColor="black"
              borderLeftWidth="1px"
              padding="3px"
            >
              {selectedArtifactEntry.files.map((f: any, i: number) => (
                <React.Fragment key={`fi-${f.title}-${i}`}>
                  {i === selectedArtifactIndex ? (
                    <div
                      style={{ backgroundColor: '#FFFBC8', fontWeight: 600 }}
                    >
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
                            {
                              activity: selectedArtifactEntry,
                              artifactUid:
                                selectedArtifactEntry.files[i].artifact_uid,
                              hopReason: 'another artifact in activity',
                            },
                          ],
                        });
                      }}
                    >
                      {selectedArtifactEntry.files[i].title}
                    </div>
                  )}
                </React.Fragment>
              ))}
            </Box>
          )}
        </Box>
      </Box>
      {selectedArtifact && !isReadOnly && (
        <Box>
          <Button
            onClick={() => {
              const indexTest = projectData.citations
                .map((c) => c.id)
                .indexOf(selectedArtifact.artifact_uid);
              const index =
                indexTest > -1
                  ? indexTest + 1
                  : projectData.citations.length + 1;
              navigator.clipboard.writeText(
                String.raw`\trrracer{detail view}{artifact}{${selectedArtifact.artifact_uid}}{${index}}`
              );
              if (indexTest === -1) {
                let newCitations = [
                  ...projectData.citations,
                  { id: selectedArtifact.artifact_uid, cIndex: index },
                ];
                dispatch({ type: 'ADD_CITATION', citations: newCitations });
              }
            }}
          >
            Copy this ref
          </Button>

          <span
            style={{
              marginTop: 10,
              fontSize: 12,
              fontWeight: 400,
              display: 'block',
            }}
          >
            Copy to cite this artifact:
          </span>
          {selectedArtifact
            ? String.raw`\trrracer{detail view}{artifact}{${selectedArtifact.artifact_uid}}`
            : 'No Artifact to Cite'}
        </Box>
      )}
      {(!viewParams || (viewParams && viewParams.view !== 'paper')) && (
        <Box>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 20 }}>
            Activity Tags
            {!isReadOnly && (
              <Button
                style={{ marginLeft: '10px' }}
                onClick={() => {
                  showTagAdd ? setShowTagAdd(false) : setShowTagAdd(true);
                }}
              >
                Edit
              </Button>
            )}
            <Button
              style={{ cursor: 'pointer', display: 'inline', marginLeft: 10 }}
              onClick={() =>
                showTagList ? setShowTagList(false) : setShowTagList(true)
              }
            >
              {showTagList ? (
                <FaEye style={{ cursor: 'pointer', display: 'inline' }} />
              ) : (
                <FaEyeSlash style={{ cursor: 'pointer', display: 'inline' }} />
              )}
            </Button>
          </div>
          {showTagAdd && (
            <div>
              <ReactTags
                tags={projectData.entries[
                  selectedArtifactEntry.index
                ].tags.map((t) => ({ id: t, text: t }))}
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
                    hopArray: hopArray,
                  });
                }}
              />
            </div>
          )}
          {showTagList && (
            <>
              {selectedArtifactEntry.tags.map((t: any, i: number) => (
                <InteractiveActivityTag
                  key={`it-${i}`}
                  selectedArtifactEntry={selectedArtifactEntry}
                  selectedArtifactIndex={selectedArtifactIndex}
                  tag={t}
                  index={i}
                />
              ))}
            </>
          )}
        </Box>
      )}
      {!isReadOnly && fragSelected != null && fragSelected.length > 1 && (
        <div style={{ padding: '5px', marginTop: 10 }}>
          <div style={{ fontSize: 20, fontWeight: 600 }}>
            Selected Fragment:
          </div>
          <span style={{ backgroundColor: '#FFFBC8' }}>{fragSelected}</span>
        </div>
      )}
      {!isReadOnly && (
        <>
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
                dispatch({
                  type: 'BOOKMARK_FRAGMENT',
                  selectedArtifactEntry: selectedArtifactEntry,
                  selectedArtifactIndex: selectedArtifactIndex,
                  bookmarkFragment: fragSelected,
                });
              }}
            >
              {fragSelected && 'Bookmark this fragment'}
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
              onClick={() => setShowThreadAdd(!showThreadAdd)}
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
        </>
      )}
      <Box>
        {isArtifactInThread && isArtifactInThread?.length > 0 ? (
          <div>
            <span
              style={{
                fontWeight: 600,
                fontSize: 20,
                marginTop: 10,
                marginBottom: 10,
              }}
            >
              This artifact is associated with:
            </span>
            {isArtifactInThread?.map((a, i) => (
              <div
                key={`thread-${i}`}
                style={{
                  border: '1px solid gray',
                  borderRadius: 5,
                  marginBottom: 3,
                }}
              >
                <div
                  style={{
                    padding: 6,
                    backgroundColor: `${a.color}50`,
                  }}
                >
                  {a.title}
                </div>
                {a.evidence
                  .filter(
                    (e) =>
                      e.artifactTitle ===
                      selectedArtifactEntry.files[selectedArtifactIndex].title
                  )
                  .map((m, j) => (
                    <div key={`evi-${j}`} style={{ padding: 4 }}>
                      {m.type === 'fragment' && (
                        <div
                          style={{ fontSize: 11, fontStyle: 'italic' }}
                        >{`"${m.anchors[0].frag_type}"`}</div>
                      )}

                      <div style={{ fontSize: 12, fontWeight: 700 }}>
                        {m.rationale}
                      </div>
                    </div>
                  ))}
              </div>
            ))}
            {/* <ThreadNav researchTs={isArtifactInThread} viewType="detail" /> */}
          </div>
        ) : (
          <Box
            flex="2"
            overflowY="auto"
            boxShadow="3px 3px 8px #A3AAAF"
            border="1px solid #A3AAAF"
            borderRadius={6}
            p={5}
          >
            <span>Activity not yet associated with a research thread.</span>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ArtifactDetailSidebar;
