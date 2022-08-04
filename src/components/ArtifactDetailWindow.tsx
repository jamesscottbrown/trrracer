import React, { useEffect, useState } from 'react';
import {
  Flex,
  Box,
  Button,
  Spacer,
  Tag,
  TagLabel,
  TagCloseButton,
  Tooltip,
} from '@chakra-ui/react';

import { FaArrowLeft, FaArrowRight, FaMapPin } from 'react-icons/fa';
import * as Showdown from 'showdown';

import { openFile } from '../fileUtil';
import DetailPreview from './DetailPreview';
import ArtifactDetailSidebar from './ArtifactDetailSidebar';
import { useProjectState } from './ProjectContext';
import QueryBar from './QueryBar';

import DetailBubble from './DetailSvg';
import ActivityTitlePopoverLogic from './PopoverTitle';

interface DetailProps {
  setViewType: (view: string) => void;
  goBackView: any;
}

const ArtifactDetailWindow = (props: DetailProps) => {
  const { setViewType, goBackView } = props;
 
  const [
    { projectData, 
      selectedArtifact, 
      hopArray, 
      researchThreads, 
      isReadOnly,
      query
    },
    dispatch,
  ] = useProjectState();

  const [searchTermArtifact, setSearchTermArtifact] = useState<null|string>(null);
 
  if(query != null && searchTermArtifact === null){
    setSearchTermArtifact(query.term);
  }

  const [editable, setEditable] = useState<boolean[]>(
    Array.from(Array(projectData.entries.length), (_) => false)
  );

  console.log('SELECTED ARTIFACT in detail window', selectedArtifact);

  const [fragSelected, setFragSelected] = useState(null);

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
              activity: null,
              artifactIndex: null,
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
                selectedArtifact.activity.index > 0
                  ? projectData.entries[selectedArtifact.artifactIndex - 1]
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
                activity: selectActivity,
                artifactIndex: 0,
                hopArray: newHop,
              });
            }}
          >
            <FaArrowLeft />
          </Button>

          {` Activity:`}
          {!isReadOnly ? (
            <ActivityTitlePopoverLogic
              activityData={selectedArtifact.activity}
              researchThreads={researchThreads}
            />
          ) : (
            <span>{selectedArtifact.activity.title}</span>
          )}

          <Button
            style={{ marginLeft: '10px' }}
            onClick={() => {
              const selectActivity =
                selectedArtifact.index < projectData.entries.length - 1
                  ? projectData.entries[selectedArtifact.artifactIndex + 1]
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
                activity: selectActivity,
                artifactIndex: 0,
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
          selectedArtifact.artifactIndex
            ? selectedArtifact.activity.files[selectedArtifact.artifactIndex]
                .title
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
          {(selectedArtifact.activity.files[selectedArtifact.artifactIndex].fileType === 'txt' ||
            selectedArtifact.activity.files[selectedArtifact.artifactIndex].fileType === 'gdoc') && (
            <Flex
              p={5}
              width="100%"
              alignItems="center"
              alignContent="center"
            >
              <QueryBar setViewType={null} setSearchTermArtifact={setSearchTermArtifact} filteredActivities={null} />
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
                          size="md"
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
                                selectedArtifactEntry:
                                  selectedArtifact.activity,
                                selectedArtifactIndex:
                                  selectedArtifact.artifactIndex,
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
                searchTermArtifact={searchTermArtifact}
                openFile={openFile}
              />
            ) : (
              <div>No Artifact for this activity</div>
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
            {'No artifact selected'}
            
          </div>
        </Flex>
      )}
    </Flex>
  </div>
  // </div>
  );
};

export default ArtifactDetailWindow;
