import React, { useState, useMemo } from 'react';
import ReactMde from 'react-mde';
import * as Showdown from 'showdown';
import { GiCancel, GiSewingString } from 'react-icons/gi';
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
import AttachmentPreview from './AttachmentPreview';
import type { EntryType, File, ResearchThreadData } from './types';
import ActivityTitlePopoverLogic from './PopoverTitle';
import { useProjectState } from './ProjectContext';
import { drive_v3 } from 'googleapis';
import { readFileSync } from '../fileUtil';

interface EntryPropTypes {
  activityID: string;
  openFile: (a: string, fp: string) => void;
  makeEditable: () => void;
  setViewType: (viewType: string) => void;
  viewType: any;
}

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true,
});

interface ReadonlyEntryFilePropTypes {
  activityID: string;
  openFile: (a: string, fp: string) => void;
  setViewType: (viewType: string) => void;
  file: File;
  i: number;
  dispatch: (dis: any) => void;
  folderPath: string;
}

const ReadonlyEntryFile = (props: ReadonlyEntryFilePropTypes) => {
  const { thisEntry, openFile, setViewType, file, i } = props;
  const [{ folderPath, isReadOnly, viewParams }, dispatch] = useProjectState();
 
  return (
    <React.Fragment>
      <Box bg="#ececec" p={3}>
        {['png', 'jpg', 'gif'].includes(file.fileType) && (
          <AttachmentPreview
            folderPath={folderPath}
            title={file.title}
            openFile={openFile}
          />
        )}
        <div style={{ marginTop: '8px' }}>
          <span
          style={{fontWeight:800, fontSize:16}}
          >{`${file.artifactType}: `}</span>
          {file.title}{' '}
          {!isReadOnly && (
            <FaExternalLinkAlt
              onClick={() => openFile(file.title, folderPath)}
              title="Open file externally"
              size="13px"
              style={{ display: 'inline' }}
            />
          )}
          <Button
            size={'xs'}
            style={{
              marginLeft: '7px',
              color: '#ffffff',
              backgroundColor: 'gray',
            }}
            onClick={() => {

              if(!viewParams){
                setViewType('detail view');

                dispatch({
                  type: 'SELECTED_ARTIFACT',
                  selectedArtifactEntry: thisEntry,
                  selectedArtifactIndex: i,
                  hopArray: [
                    {
                      activity: thisEntry, 
                      artifactUid: thisEntry.files[i].artifact_uid,
                      hopReason: 'first hop',
                    }
                  ],
                });

              }else{
                d3.select('#popover-det').remove();
                let pop = d3.select('body').append('div').attr('id', 'popover-det');
                pop.style('position', 'absolute')
                .style('left', '370px')
                .style('top', '100px')
                .style('width', '700px')
                .style('padding', '10px')
                .style('background-color', '#fff')
                .style('border', '2px solid gray')
                .style('border-radius', '10px')
                .style('z-index', '6000');
                let cancel = pop.append('div')
                .style('background-color', '#d3d3d3')
                .style('border-radius', '6px');
                cancel.append('text').text('x').style('font-weight', '900');
                cancel.style('float', 'right')
                cancel.style('cursor', 'pointer')
                cancel.on('click', () => pop.remove())

                let textDiv = pop.append('div')
                textDiv.html('<div>THIS IS WHERE THE DETAIL FOR THE ARTIFACT GOES.</div>');

                pop.style('height', '800px')
               
              }
        }}
      >See in detail</Button>
      </div>
      </Box> 
    </React.Fragment>
  );
};

type ActivityTitlePopoverLogicProps = {
  activityData: EntryType;
  researchThreads: ResearchThreadData | undefined;
};

const ReadonlyEntry = (props: EntryPropTypes) => {
  const {
    activityID,
    makeEditable,
    openFile,
    setViewType,
    viewType,
    foundIn,
  } = props;

  const [
    { projectData, researchThreads, folderPath, isReadOnly },
    dispatch,
  ] = useProjectState();

  const thisEntry = useMemo(() => {
    return projectData.entries.filter((f) => f.activity_uid === activityID)[0];
  }, [projectData.entries]);

  const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,
  });

  const checkTagColor = (tagName: string) => {
    const tagFil = researchThreads.research_threads.filter((f: any) => {
      return f.associated_tags.indexOf(tagName) > -1;
    });
    if (tagFil.length > 0) return tagFil[tagFil.length - 1].color;
    return '#D4D4D4';
  };

  const urls = thisEntry.files.filter((f) => f.fileType === 'url');
  const files = thisEntry.files.filter((f) => f.fileType !== 'url');

  // Cache the results of converting markdown to HTML, to avoid re-converting on every render
  const descriptionHTML = useMemo(() => {
    converter.makeHtml(thisEntry.description);
  }, [thisEntry.description]);

  return (
    <Box>
      <div style={{ padding: 10 }}>
        <span style={{ fontSize: 22, fontWeight: 'bold' }}>
          {thisEntry.isPrivate && (
            <FaLock
              title="This entry is private, and will be hidden when the Trrrace is exported."
              size="0.75em"
              style={{ display: 'inline', fill: 'lightgrey' }}
            />
          )}
          {viewType != 'detail' && (
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
                backgroundColor={`#d3d3d3`}
                stroke={`#d3d3d3`}
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
                    backgroundColor: fo.color,
                    borderRadius: 50,
                    width: 26,
                    display: 'inline-block',
                    padding: 3,
                    margin: 3,
                    // opacity: fo.title === selectedThread.title ? 1 : .4
                  }}
                >
                  <GiSewingString size={'20px'} />
                </div>
              </Tooltip>
            </React.Fragment>
          ))}
        <br />

        {(thisEntry.description && thisEntry.description != '' && thisEntry.description != 'Add description') && (
          <div>
            {thisEntry.tags.includes('email') ? (
              <div>
                <span>{`${thisEntry.description.split('.')[0]}...`}</span>
                <Button
                  onClick={() => {
                    setViewType('detail view');

                    dispatch({
                      type: 'SELECTED_ARTIFACT',
                      selectedArtifactEntry: thisEntry,
                      selectedArtifactIndex: null,
                      hopArray: [
                        {
                          activity: thisEntry,
                          artifactUid: null, //thisEntry.files[i].artifact_uid,
                          hopReason: 'first hop',
                        },
                      ],
                    });
                  }}
                >
                  {'VIEW EMAIL'}
                </Button>
              </div>
            ) : (
              <ReactMde
                value={thisEntry.description}
                // onChange={setValue}
                selectedTab={'preview'}
                // onTabChange={()=> null}
                minPreviewHeight={100}
                generateMarkdownPreview={(markdown) =>
                  Promise.resolve(converter.makeHtml(markdown))
                }
                readOnly={true}
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
            dispatch={dispatch}
            folderPath={folderPath}
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

export default ReadonlyEntry;
