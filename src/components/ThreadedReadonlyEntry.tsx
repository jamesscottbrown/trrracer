import React, { useState, useMemo } from 'react';
import * as d3 from 'd3';
import * as d3co from 'd3-color';
import {
  Button,
  ListItem,
  Tag,
  Text,
  UnorderedList,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Box,
  SimpleGrid,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { FaExternalLinkAlt, FaLock } from 'react-icons/fa';
import { GiCancel } from 'react-icons/gi';
import { format } from 'date-fns';
import AttachmentPreview from './AttachmentPreview';
import { EntryType, File } from './types';
import { useProjectState } from './ProjectContext';
import { IconChartDots3 } from '@tabler/icons';

interface ReadonlyArtifactPropTypes {
  thisEntry: EntryType;
  openFile: (a: string, fp: string) => void;
  setViewType: (viewType: string) => void;
  file: File;
  i: number;
}

const ReadonlyArtifact = (props: ReadonlyArtifactPropTypes) => {
  const { thisEntry, openFile, setViewType, file, i } = props;
  const [{ folderPath }, dispatch] = useProjectState();

  const [onHover, setOnHover] = useState(false);

  return (
    <>
      <Box
        bg="#ececec"
        p={3}
        marginTop={1}
        opacity={onHover ? 1 : 0.4}
        onMouseOver={() => setOnHover(true)}
        onMouseOut={() => setOnHover(false)}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 5,
            width: 75,
            display: 'inline',
            cursor: 'pointer',
          }}
        >
          {' '}
          {file.title}{' '}
          <FaExternalLinkAlt
            onClick={() => openFile(file.title, folderPath)}
            title="Open file externally"
            size="13px"
            style={{ display: 'inline' }}
          />
          <Button
            size="xs"
            style={{
              marginLeft: '7px',
              color: '#ffffff',
              backgroundColor: 'gray',
            }}
            onClick={() => {
              setViewType('detail view');
              dispatch({
                type: 'SELECTED_ARTIFACT',
                activity: thisEntry,
                artifactIndex: i,
                hopArray: [
                  {
                    activity: thisEntry,
                    artifactUid: thisEntry.files[i]
                      ? thisEntry.files[i].artifact_uid
                      : null,
                    hopReason: 'first hop',
                  },
                ],
              });
            }}
          >
            See in detail
          </Button>
        </div>
        {['png', 'jpg', 'gif'].includes(file.fileType) && onHover && (
          <AttachmentPreview
            folderPath={folderPath}
            title={file.title}
            openFile={openFile}
          />
        )}
      </Box>
    </>
  );
};

const ThreadedArtifact = (props: any) => {
  const { setViewType, openFile, fileData, thisEntry, folderPath, i } = props;

  const [, dispatch] = useProjectState();

  return (
    <Box bg="#ececec" p={3}>
      <span style={{ cursor: 'pointer' }}>
        {fileData.threadPart.type === 'fragment'
          ? 'Fragment of artifact: '
          : 'Threaded artifact: '}
        {fileData.title}{' '}
        <FaExternalLinkAlt
          onClick={() => openFile(fileData.title, folderPath)}
          title="Open file externally"
          size="13px"
          style={{ display: 'inline' }}
        />
        <Button
          size="xs"
          style={{
            marginLeft: '7px',
            color: '#ffffff',
            backgroundColor: 'gray',
          }}
          onClick={() => {
            setViewType('detail view');
            dispatch({
              type: 'SELECTED_ARTIFACT',
              activity: thisEntry,
              artifactIndex: i,
              hopArray: [
                {
                  activity: thisEntry,
                  artifactUid: thisEntry.files[i]
                    ? thisEntry.files[i].artifact_uid
                    : null,
                  hopReason: 'first hop',
                },
              ],
            });
          }}
        >
          See in detail
        </Button>
      </span>
      <div>
        {fileData.threadPart.type === 'fragment' && (
          <div style={{ fontWeight: 300, fontSize: 14 }}>
            {fileData.threadPart.anchors.map((m, j) => (
              <React.Fragment key={`frag-${j}`}>
                {m.anchor_type === 'text' ? (
                  <span style={{ backgroundColor: 'yellow' }}>
                    {m.frag_type}
                  </span>
                ) : (
                  <span>Image anchors</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 10 }}>{'Why this was included: '}</div>
      <div style={{ fontWeight: 300, fontSize: 14 }}>
        {fileData.threadPart.rationale}
      </div>
      {['png', 'jpg', 'gif'].includes(fileData.fileType) && (
        <AttachmentPreview
          folderPath={folderPath}
          title={fileData.title}
          openFile={null}
        />
      )}
    </Box>
  );
};

const ActivityTitleLogic = (props: any) => {
  const { thisEntry, color } = props;
  return (
    <div
      style={{
        cursor: 'pointer',
        display: 'inline',
      }}
      onMouseOver={() => {
        const circles = d3.selectAll('circle.all-activities');
        circles.filter((f) => f.title === thisEntry.title).attr('fill', 'red');
      }}
      onMouseLeave={() => {
        const circles = d3.selectAll('circle.all-activities');
        circles
          .filter((f) => f.title === thisEntry.title)
          .attr('fill', d3co.hsl(color).copy({ l: 0.9 }));
      }}
    >
      <span>{thisEntry.title}</span>
    </div>
  );
};

const ThreadedReadonlyEntry = (props: any) => {
  const { activityID, makeEditable, openFile, setViewType, viewType } = props;

  const [{ projectData, researchThreads, filterRT, folderPath, isReadOnly }] =
    useProjectState();

  const thisEntry = useMemo(() => {
    return projectData.entries.filter((f) => f.activity_uid === activityID)[0];
  }, [projectData.entries]);

  const selectedThread = researchThreads.research_threads.filter(
    (f) => f.title === filterRT.title
  )[0];
  const isEntryInThread = selectedThread.evidence.filter(
    (f) => f.activityTitle === thisEntry.title
  );
  const isEntryInAnyThreads = researchThreads.research_threads.filter((f) => {
    const temp = f.evidence
      .map((m) => m.activityTitle)
      .filter((ev) => thisEntry.title === ev);
    return temp.length > 0;
  });

  const urls = thisEntry.files.filter((f) => f.fileType === 'url');
  const files = thisEntry.files.filter((f) => f.fileType !== 'url');

  const activitiesAsEvidence = isEntryInThread;
  // .filter(
  //   (f) => f.type === 'fragment' || f.type === 'artifact'
  // );

  const threadedFiles = files
    .filter((f) =>
      activitiesAsEvidence.map((m) => m.artifactTitle).includes(f.title)
    )
    .map((m) => {
      m.threadPart = activitiesAsEvidence.filter(
        (f) => (f.artifactTitle && f.artifactTitle === m.title) || f.type === 'activity'
      )[0];
      return m;
    });

  const otherFiles = files.filter(
    (f) => threadedFiles.map(m => m.title).indexOf(f.title) === -1
      // activitiesAsEvidence.map((m) => m.artifactTitle).indexOf(f.title) === -1 && 
  );

  const threadedActivity = isEntryInThread.filter((f) => f.type === 'activity');

  const threadedTags = thisEntry.tags.filter((f) =>
    selectedThread.associated_tags.includes(f)
  );
  const nonThreadedTags = thisEntry.tags.filter(
    (f) => selectedThread.associated_tags.indexOf(f) === -1
  );

  const checkTagColor = (tagName: string) => {
    const tagFil = researchThreads.research_threads.filter((f: any) => {
      return f.associated_tags.indexOf(tagName) > -1;
    });
    if (tagFil.length > 0) return tagFil[tagFil.length - 1].color;
    return '#D4D4D4';
  };

  return (
    <Box>
      <div style={{ 
        padding: 10,
        }}
        id={`threaded-${thisEntry.activity_uid}`}
        >
        <span style={{ fontSize: 22, fontWeight: 'bold' }}>
          {thisEntry.isPrivate && (
            <FaLock
              title="This entry is private, and will be hidden when the Trrrace is exported."
              size="0.75em"
              style={{ display: 'inline', fill: 'lightgrey' }}
            />
          )}
          {viewType != 'detail' && (
            <div>
              <ActivityTitleLogic
                color={selectedThread.color}
                thisEntry={thisEntry}
              />
              <div style={{ display: 'inline', float: 'right' }}>
                {makeEditable && !isReadOnly && (
                  <Button
                    size="sm"
                    leftIcon={<EditIcon />}
                    onClick={makeEditable}
                  >
                    Edit
                  </Button>
                )}
                {!isReadOnly && (
                  <Tooltip label="Remove from thread">
                    <Button
                      size="sm"
                      style={{
                        marginLeft: '5px',
                        // backgroundColor: '#ff726f',
                        // borderRadius: 30
                      }}
                    >
                      <GiCancel size={18} />
                    </Button>
                  </Tooltip>
                )}
              </div>
            </div>
          )}
        </span>

        <Text style={{ fontSize: 15, fontWeight: 'bold' }}>
          {format(new Date(thisEntry.date), 'dd MMMM yyyy')}
        </Text>
        <div>
          {thisEntry.tags.length === 0 ? (
            <b>No tags.</b>
          ) : ( 
            <>
              <div style={{ display: 'inline' }}>
                {threadedTags.map((t) => (
                  <Tag
                    key={t}
                    backgroundColor={checkTagColor(t)}
                    marginRight="0.25em"
                    marginBottom="0.25em"
                    style={{
                      color: checkTagColor(t) === '#3932a3' ? '#fff' : 'black',
                    }}
                  >
                    {t}
                  </Tag>
                ))}
              </div>
              <div style={{ display: 'inline' }}>
                <Popover trigger="hover">
                  <PopoverTrigger>
                    <Badge
                      style={{
                        cursor: 'pointer',
                        paddingLeft: '5px',
                        paddingRight: '5px',
                        paddingTop: '2px',
                        paddingBottom: '2px',
                      }}
                    >
                      {nonThreadedTags.length}
                      {threadedTags.length > 0 ? ' More Tags' : 'Tags'}
                    </Badge>
                  </PopoverTrigger>

                  <PopoverContent bg="white" color="gray">
                    <PopoverArrow bg="white" />
                    <PopoverBody>
                      <>
                        {nonThreadedTags.map((nt) => (
                          <Tag
                            key={nt}
                            backgroundColor={checkTagColor(nt)}
                            marginRight="0.25em"
                            marginBottom="0.25em"
                            style={{ padding: '5px', cursor: 'pointer' }}
                          >
                            {nt}
                          </Tag>
                        ))}
                      </>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}
        </div>
        {isEntryInAnyThreads.map((m, ti) => (
          <React.Fragment key={`tool-${ti}`}>
            <Tooltip style={{ padding: 5 }} label={`Threaded in ${m.title}`}>
              <div
                style={{
                  fontSize: 20,
                  backgroundColor: `${m.color}60`,
                  borderRadius: 50,
                  width: 26,
                  display: 'inline-block',
                  padding: 3,
                  margin: 3,
                  opacity: m.title === selectedThread.title ? 1 : 0.4,
                }}
              >
                <IconChartDots3 size={'20px'} />
              </div>
            </Tooltip>
          </React.Fragment>
        ))}
      </div>

      {threadedActivity.length > 0 && (
        <div>{threadedActivity[0].rationale}</div>
      )}

      {thisEntry.description !== '' && (
        <div
          style={{
            fontSize: '12px',
            fontStyle: 'italic',
            marginTop: '5px',
            marginBottom: 5,
          }}
        >
          {thisEntry.description}
          <br />
        </div>
      )}

      <SimpleGrid columns={1} spacing={1}>
        {threadedFiles.map((f, i) => (
          <ThreadedArtifact
            key={`threaded-${i}`}
            isEntryInThread={isEntryInThread}
            selectedThread={selectedThread}
            openFile={openFile}
            fileData={f}
            folderPath={folderPath}
            i={i}
            thisEntry={thisEntry}
            setViewType={setViewType}
          />
        ))}
      </SimpleGrid>
      <SimpleGrid columns={1} spacing={1}>
        {otherFiles.map((f, i) => (
          <ReadonlyArtifact
            key={`readonly-${i}`}
            thisEntry={thisEntry}
            openFile={openFile}
            setViewType={setViewType}
            file={f}
            i={i}
          />
        ))}
      </SimpleGrid>
      {urls.length > 0 && (
        <div style={{ padding: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 800 }}>URLs</span>
          <UnorderedList>
            {urls.map((url, i) => (
              <ListItem key={`${url.url}-${i}`}>
                <a href={url.url}>{url.title} </a>
                <FaExternalLinkAlt
                  title="Open URL in default web browser"
                  size="12px"
                  style={{ display: 'inline' }}
                />
              </ListItem>
            ))}
          </UnorderedList>
        </div>
      )}
    </Box>
  );
};

export default ThreadedReadonlyEntry;
