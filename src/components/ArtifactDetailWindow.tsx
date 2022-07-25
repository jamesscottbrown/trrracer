import React, { useEffect, useMemo, useState } from 'react';
import {
  Flex,
  Box,
  Button,
  Spacer,
  Textarea,
  Badge,
  Tag,
  TagLabel,
  TagCloseButton,
  Tooltip,
} from '@chakra-ui/react';
import { WithContext as ReactTags } from 'react-tag-input';
import {
  FaArrowLeft,
  FaArrowRight,
  FaEye,
  FaEyeSlash,
  FaMapPin,
} from 'react-icons/fa';
import { openFile } from '../fileUtil';
import DetailPreview from './DetailPreview';
import ArtifactDetailSidebar from './ArtifactDetailSidebar';
import { useProjectState } from './ProjectContext';
import QueryBar from './QueryBar';
import ReactMde from 'react-mde';
import * as Showdown from 'showdown';

import type { ResearchThread, ResearchThreadEvidence, ReactTag } from './types';
import DetailBubble from './DetailSvg';
import ActivityTitlePopoverLogic from './PopoverTitle';

interface DetailProps {
  setViewType: (view: string) => void;
  goBackView: any;
}

const ArtifactDetailWindow = (props: DetailProps) => {
  const { setViewType, goBackView } = props;

  const [
    {
      projectData,
      selectedArtifactEntry,
      selectedArtifactIndex,
      hopArray,
      researchThreads,
      isReadOnly,
    },
    dispatch,
  ] = useProjectState();

  const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,
  });

  const [editable, setEditable] = useState<boolean[]>(
    Array.from(Array(projectData.entries.length), (_) => false)
  );

  const selectedArtifact = useMemo(() => {
    return selectedArtifactEntry.files.length > 0
      ? selectedArtifactEntry.files[selectedArtifactIndex]
      : null;
  }, [selectedArtifactEntry.activity_uid, selectedArtifactIndex]);

  const height = 900;
  const [fragSelected, setFragSelected] = useState(null);
  const [newHeight, setNewHeight] = useState('1000px');

  const viewheight = +newHeight.split('px')[0];
  const margin = viewheight * 0.15;

  console.log('SELECTED ARTIFACT', selectedArtifact);

  useEffect(() => {
    if (editable.length === projectData.entries.length - 1) {
      // one more entry was added
      setEditable([...editable, true]);
    } else if (editable.length !== projectData.entries.length) {
      setEditable(Array.from(Array(projectData.entries.length), (_) => false));
    }
  }, [projectData.entries.length]);

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
                const selectActivity =
                  selectedArtifactEntry.index > 0
                    ? projectData.entries[selectedArtifactEntry.index - 1]
                    : projectData.entries[projectData.entries.length - 1];

                const newHop = [
                  ...hopArray,
                  {
                    activity: selectActivity,
                    artifactUid:
                      selectActivity && selectActivity.files[0].artifact_uid
                        ? selectActivity.files[0].artifact_uid
                        : null,
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
            {!isReadOnly ? (
              <ActivityTitlePopoverLogic
                activityData={selectedArtifactEntry}
                researchThreads={researchThreads}
              />
            ) : (
              <span>{selectedArtifactEntry.title}</span>
            )}

            <Button
              style={{ marginLeft: '10px' }}
              onClick={() => {
                const selectActivity =
                  selectedArtifactEntry.index < projectData.entries.length - 1
                    ? projectData.entries[selectedArtifactEntry.index + 1]
                    : projectData.entries[0];

                const newHop = [
                  ...hopArray,
                  {
                    activity: selectActivity,
                    artifactUid:
                      selectActivity &&
                      selectActivity.files.length > 0 &&
                      selectActivity.files[0].artifact_uid
                        ? selectActivity.files[0].artifact_uid
                        : null,
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
          >{`Artifact: ${
            selectedArtifact
              ? selectedArtifact.title
              : 'No artifacts with this activity'
          }`}</div>
        </Flex>
      </Box>
      <Flex position="relative" top={70} bottom={0} height="calc(100% - 150px)">
        <ArtifactDetailSidebar
          fragSelected={fragSelected}
          setFragSelected={setFragSelected}
        />

        <div style={{ width: 260 }}>
          <DetailBubble widthSvg={360} filterType={null} />
        </div>
        {selectedArtifact ? (
          <Box flex="3.5">
            {(selectedArtifact.fileType === 'txt' ||
              selectedArtifact.fileType === 'gdoc') && (
              <Flex
                p={5}
                width="100%"
                alignItems="center"
                alignContent="center"
              >
                <QueryBar marginLeft={60} artifactData={selectedArtifact} />
                <Box>
                  {selectedArtifact.bookmarks &&
                    selectedArtifact.bookmarks.map((f, i) => (
                      //
                      <React.Fragment key={`pin-${i}`}>
                        <Tooltip
                          style={{ padding: 5 }}
                          label={`"${f.fragment}"`}
                        >
                          <Tag
                            size={'md'}
                            borderRadius="full"
                            variant="solid"
                            colorScheme="gray"
                            style={{ cursor: 'pointer', marginRight: 5 }}
                          >
                            <TagLabel
                              onClick={() => {
                                setFragSelected(f.fragment);
                              }}
                            >
                              <FaMapPin />
                            </TagLabel>
                            <TagCloseButton
                              onClick={() => {
                                dispatch({
                                  type: 'REMOVE_BOOKMARK',
                                  selectedArtifactEntry: selectedArtifactEntry,
                                  selectedArtifactIndex: selectedArtifactIndex,
                                  fragIndex: i,
                                });
                              }}
                            />
                          </Tag>
                        </Tooltip>
                      </React.Fragment>
                    ))}
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
              {selectedArtifact ? (
                <DetailPreview
                  setFragSelected={setFragSelected}
                  openFile={openFile}
                />
              ) : (
                <div>{'No Artifact for this activity'}</div>
              )}
            </Flex>
          </Box>
        ) : (
          <Flex
            style={{
              justifyContent: 'center',
              alignItems: 'stretch',
              height: '90%',
              paddingLeft: 20,
              paddingRight: 20,
              overflowY: 'scroll',
            }}
          >
            <div
              onMouseUp={() => {
                if (setFragSelected) {
                  const selObj = window.getSelection();
                  setFragSelected(selObj?.toString());
                } else {
                  console.log('mouseup');
                }
              }}
              style={{
                height: '100%',
                width: '700px',
                padding: 8,
                overflow: 'auto',
              }}
            >
              <ReactMde
                value={selectedArtifactEntry.description}
                // onChange={setValue}
                selectedTab={'preview'}
                onTabChange={() => null}
                generateMarkdownPreview={(markdown) =>
                  Promise.resolve(converter.makeHtml(markdown))
                }
                readOnly={true}
                style={{ height: '100%', overflowY: 'scroll'}}
              />
            </div>
          </Flex>
        )}
      </Flex>
    </div>
    // </div>
  );
};

export default ArtifactDetailWindow;
