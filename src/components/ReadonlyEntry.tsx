import React, { useMemo } from 'react';
import ReactMde from 'react-mde';
import * as Showdown from 'showdown';
import * as d3 from 'd3';
import {
  Button,
  ListItem,
  Tag,
  Text,
  UnorderedList,
  Box,
  SimpleGrid,
  Tooltip,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { FaExternalLinkAlt, FaLock } from 'react-icons/fa';
import { format } from 'date-fns';
import { IconChartDots3 } from '@tabler/icons';

import AttachmentPreview from './AttachmentPreview';
import type { EntryType, File, ResearchThread } from './types';
import ActivityTitlePopoverLogic from './PopoverTitle';
import { useProjectState } from './ProjectContext';
import { joinPath, readFileSync } from '../fileUtil';

interface EntryPropTypes {
  activityID: string;
  openFile: (a: string, fp: string) => void;
  makeEditable: () => void;
  setViewType: (viewType: string) => void;
  viewType: any;
  foundIn: ResearchThread[];
}

interface ReadonlyEntryFilePropTypes {
  openFile: (a: string, fp: string) => void;
  setViewType: (viewType: string) => void;
  file: File;
  i: number;
  thisEntry: EntryType;
}

const ReadonlyEntryFile = (props: ReadonlyEntryFilePropTypes) => {
  const { thisEntry, openFile, setViewType, file, i } = props;
  const [{ folderPath, isReadOnly, viewParams }, dispatch] = useProjectState();

  return (
    <>
      <Box bg="#ececec" p={3}>
        {['png', 'jpg', 'gif'].includes(file.fileType) && (
          <AttachmentPreview
            folderPath={folderPath as string}
            title={file.title}
            openFile={openFile}
          />
        )}
        <div style={{ marginTop: '8px' }}>
          <span
            style={{ fontWeight: 800, fontSize: 16 }}
          >{`${file.artifactType}: `}</span>
          {file.title}{' '}
          <FaExternalLinkAlt
            onClick={() => {
              if (!isReadOnly) {
                openFile(file.title, folderPath);
              } else {
                if (file.fileType === 'gdoc') {
                  window.open(
                    `https://docs.google.com/document/d/${file.fileId}/edit?usp=sharing`,
                    '_blank'
                  );
                } else {
                  window.open(`${folderPath}${file.title}&raw=1`, '_blank');
                }
              }
            }}
            title="Open file externally"
            size="13px"
            style={{ display: 'inline', cursor: 'pointer' }}
          />
          <Button
            size="xs"
            style={{
              marginLeft: '7px',
              color: '#ffffff',
              backgroundColor: 'gray',
            }}
            onClick={() => {
              if (!viewParams || viewParams.view != 'paper') {
                setViewType('detail view');
                dispatch({
                  type: 'SELECTED_ARTIFACT',
                  activity: thisEntry,
                  artifactIndex: i,
                  hopArray: [
                    {
                      activity: thisEntry,
                      artifactUid: thisEntry.files[i].artifact_uid,
                      hopReason: 'first hop',
                    },
                  ],
                });
              } else {
                setViewType('detail view');
                dispatch({
                  type: 'SELECTED_ARTIFACT',
                  activity: thisEntry,
                  artifactIndex: i,
                  hopArray: [
                    {
                      activity: thisEntry,
                      artifactUid: thisEntry.files[i].artifact_uid,
                      hopReason: 'first hop',
                    },
                  ],
                });
                dispatch({
                  type: 'UPDATE_GO_BACK',
                  goBackView: 'paper',
                  filterQuery: null//query.matches.map((m) => m.entry.title),
                });
            }}
          }
          >
            See in detail
          </Button>
        </div>
      </Box>
    </>
  );
};

const ReadonlyEntry = (props: EntryPropTypes) => {
  const { activityID, makeEditable, openFile, setViewType, viewType, foundIn } =
    props;

  const [{ projectData, researchThreads, isReadOnly }, dispatch] =
    useProjectState();

  const thisEntry = useMemo(() => {
    return projectData.entries.filter((f) => f.activity_uid === activityID)[0];
  }, [projectData.entries]);

  const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,
  });

  const urls = thisEntry.files.filter((f) => f.fileType === 'url');
  const files = thisEntry.files.filter((f) => f.fileType !== 'url');

  return (
    <Box  id={`unthreaded-${thisEntry.activity_uid}`}>
      <div style={{ padding: 10 }}>
        <span style={{ fontSize: 22, fontWeight: 'bold' }}>
          {thisEntry.isPrivate && (
            <FaLock
              title="This entry is private, and will be hidden when the Trrrace is exported."
              size="0.75em"
              style={{ display: 'inline', fill: 'lightgrey' }}
            />
          )}
          {viewType !== 'detail' && (
            <ActivityTitlePopoverLogic
              activityData={thisEntry}
              researchThreads={researchThreads}
            />
          )}
          {!isReadOnly && makeEditable && (
            <Button
              leftIcon={<EditIcon />}
              onClick={makeEditable}
              style={{ display: 'inline', float: 'right' }}
            >
              Edit
            </Button>
          )}
        </span>

        <Text style={{ fontSize: 15, fontWeight: 'bold' }}>
          {format(new Date(thisEntry.date), 'dd MMMM yyyy')}
        </Text>
        <p>
          {thisEntry.tags.length === 0 ? (
            <b>No tags.</b>
          ) : (
            <>
              {thisEntry.tags.map((t) => (
                <Tag
                  key={t}
                  backgroundColor="#d3d3d3"
                  stroke="#d3d3d3"
                  marginRight="0.25em"
                  marginBottom="0.25em"
                >
                  {t}
                </Tag>
              ))}
            </>
          )}
        </p>

        {foundIn.length > 0 &&
          foundIn.map((fo, fi) => (
            <React.Fragment key={`tool-${fi}`}>
              <Tooltip style={{ padding: 5 }} label={`Threaded in ${fo.title}`}>
                <div
                  style={{
                    fontSize: 20,
                    backgroundColor: `${fo.color}60`,
                    borderRadius: 50,
                    width: 26,
                    display: 'inline-block',
                    padding: 3,
                    margin: 3,
                  }}
                >
                  <IconChartDots3 size={'20px'} />
                </div>
              </Tooltip>
            </React.Fragment>
          ))}
        <br />

        {thisEntry.description &&
          thisEntry.description != '' &&
          thisEntry.description != 'Add description' && (
            <div>
              {thisEntry.tags.includes('email') ? (
                <div>
                  <span>{`${thisEntry.description.split('.')[0]}...`}</span>
                  <Button
                    onClick={() => {
                      setViewType('detail view');

                      dispatch({
                        type: 'SELECTED_ARTIFACT',
                        activity: thisEntry,
                        artifactIndex: null,
                        hopArray: [
                          {
                            activity: thisEntry,
                            artifactUid: null, // thisEntry.files[i].artifact_uid,
                            hopReason: 'first hop',
                          },
                        ],
                      });
                    }}
                  >
                    VIEW EMAIL
                  </Button>
                </div>
              ) : (
                <ReactMde
                  value={thisEntry.description}
                  // onChange={setValue}
                  selectedTab="preview"
                  // onTabChange={()=> null}
                  minPreviewHeight={100}
                  generateMarkdownPreview={(markdown) =>
                    Promise.resolve(converter.makeHtml(markdown))
                  }
                  readOnly
                  style={{ height: '100%', overflowY: 'scroll' }}
                />
              )}
            </div>
          )}
      </div>

      <SimpleGrid columns={1} spacing={1}>
        {files.map((f, i) => (
          <ReadonlyEntryFile
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
                <a href={url.url}>{url.title}
                  <FaExternalLinkAlt
                    title="Open URL in default web browser"
                    size="12px"
                    style={{ display: 'inline' }}
                  />
                </a>
              </ListItem>
            ))}
          </UnorderedList>
        </div>
      )}
    </Box>
  );
};

export default ReadonlyEntry;
