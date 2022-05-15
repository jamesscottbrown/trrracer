import React, { useState, useMemo } from 'react';

import {
  Button,
  Heading,
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
  PopoverFooter,
  Badge,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { FaExternalLinkAlt, FaLock } from 'react-icons/fa';
import { format } from 'date-fns';
import * as Showdown from 'showdown';
import AttachmentPreview from './AttachmentPreview';
import { useProjectState } from './ProjectContext';
import ActivitytoThread from './ActivityToThread';

import type { EntryType, File, ResearchThreadData } from './types';


interface EntryPropTypes {
  entryData: EntryType;
  openFile: (a: string, fp: string) => void;
  makeEditable: () => void;
  setViewType: (viewType: string) => void;
}

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true,
});

interface ReadonlyEntryFilePropTypes {
  entryData: EntryType;
  openFile: (a: string, fp: string) => void;
  setViewType: (viewType: string) => void;
  file: File;
  i: number;
}

const ReadonlyEntryFile = (props: ReadonlyEntryFilePropTypes) => {
  const { entryData, openFile, setViewType, file, i } = props;
  const [{ folderPath }, dispatch] = useProjectState();

  return (
    <>
    <Box bg="#ececec" p={3}>
    {['png', 'jpg', 'gif'].includes(file.fileType) && (
                  <AttachmentPreview
                    folderPath={folderPath}
                    title={file.title}
                    openFile={openFile}
                  />
                )}
      <div
      style={{marginTop:'8px'}}
      >{file.title}{' '}
      <FaExternalLinkAlt
                  onClick={() => openFile(file.title, folderPath)}
                  title="Open file externally"
                  size="13px"
                  style={{ display: 'inline' }}
                />
      <Button 
        size={'xs'}
        style={{
          marginLeft:'7px',
          color:'#ffffff',
          backgroundColor:'gray'
        }}
        onClick={() => {
          setViewType('detail view');
          dispatch({
            type: 'SELECTED_ARTIFACT',
            selectedArtifactEntry: entryData,
            selectedArtifactIndex: i,
            hopArray: [
              {
                activity: entryData, 
                artifactUid: entryData.files[i].artifact_uid,
                hopReason: 'first hop',
              }
            ],
          });
        }}
      >See in detail</Button>
      </div>
      {/* <Box bg="#ececec" p={3}>
        {showPopover ? (
          <Popover isOpen={showPopover} onClose={closePopover}>
            <PopoverTrigger>
              <div>
                {['png', 'jpg', 'gif'].includes(file.fileType) && (
                  <AttachmentPreview
                    folderPath={folderPath}
                    title={file.title}
                    openFile={openFile}
                  />
                )}
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    marginBottom: 5,
                    width: 75,
                    display: 'inline',
                  }}
                >
                  {' '}
                  {file.title}{' '}
                </div>
                <FaExternalLinkAlt
                  onClick={() => openFile(file.title, folderPath)}
                  title="Open file externally"
                  size="13px"
                  style={{ display: 'inline' }}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent bg="white" color="gray">
              <PopoverArrow bg="white" />
              <PopoverBody>
                <Button
                  onClick={() => {
                    setViewType('detail view');
                    dispatch({
                      type: 'SELECTED_ARTIFACT',
                      selectedArtifactEntry: entryData,
                      selectedArtifactIndex: i,
                      hopArray: [entryData],
                    });
                  }}
                >
                  See artifact in detail.
                </Button>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        ) : (
          <div onMouseEnter={() => setShowPopover(true)}>
            {['png', 'jpg', 'gif'].includes(file.fileType) && (
              <AttachmentPreview
                folderPath={folderPath}
                title={file.title}
                openFile={openFile}
              />
            )}
            <div
              style={{
                fontSize: 18,
                fontWeight: 500,
                marginBottom: '5px',
                width: '50%',
                display: 'inline',
              }}
            >
              {' '}
              {file.title}{' '}
            </div>
            <FaExternalLinkAlt
              onClick={() => openFile(file.title, folderPath)}
              title="Open file externally"
              size="13px"
              style={{ display: 'inline' }}
            />
          </div>
        )}

        {/* {f.fileType != 'gdoc' && f.fileType != 'txt' ?
                <AttachmentPreview
                  folderPath={folderPath}
                  title={f.title}
                  openFile={openFile}
                /> : <FileTextRender fileData={f} index={i} keywordArray={entryData.key_txt} />
            } */}
      </Box> 
    </>
  );
};

type ActivityTitlePopoverLogicProps = {
  activityData: EntryType;
  researchThreads: ResearchThreadData | undefined;
}

const ActivityTitlePopoverLogic = (props: ActivityTitlePopoverLogicProps) => {
  const { activityData, researchThreads } = props;

  const [seeThreadAssign, setSeeThreadAssign] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [activitySelected, setActivitySelected] = useState(false);

  const closePopover = () => {
    if (!seeThreadAssign) {
      setShowPopover(false);
    }
  };

  return <Popover
            trigger={'hover'}
            style={{display:'inline'}}
          >
          <PopoverTrigger>
          <div
            style={{
              display:'inline',
              marginTop:2,
              cursor:'pointer'
            }}
          >{activityData.title} </div>
        
      </PopoverTrigger>
      <PopoverContent bg="white" color="gray">
        <PopoverArrow bg="white" />

        <PopoverBody>
          {seeThreadAssign && (
            <div>
              {researchThreads &&
              researchThreads.research_threads.length > 0 ? (
                researchThreads.research_threads.map(
                  (rt: any, tIndex: number) => (
                    <React.Fragment key={`rt-${tIndex}`}>
                      <ActivitytoThread
                        thread={rt}
                        threadIndex={tIndex}
                        activity={activityData}
                        activityIndex={activityData.index}
                        setSeeThreadAssign={setSeeThreadAssign}
                        closePopover={closePopover}
                      />
                    </React.Fragment>
                  )
                )
              ) : (
                <span>no threads yet</span>
              )}
            </div>
          )}
        </PopoverBody>
        <PopoverFooter>
          {seeThreadAssign ? (
            <Box>
              <Button onClick={() => setSeeThreadAssign(false)}>cancel</Button>
            </Box>
          ) : (
            <>
            <Button onClick={() => setSeeThreadAssign(true)}>
              Add this activity to a thread.
            </Button>
            <br/>
            <span style={{marginTop:10, fontSize:12, fontWeight:400, display:'block'}}>Copy to cite this activity:</span>
            <Badge
            style={{wordWrap:'break-word'}}
            >{activityData.activity_uid}</Badge>
            </>
            
          )}
        </PopoverFooter>
      </PopoverContent>
    </Popover>
};

const ReadonlyEntry = (props: EntryPropTypes) => {
  const { entryData, makeEditable, openFile, setViewType, viewType } = props;
  const [{ researchThreads }] = useProjectState();


  const checkTagColor = (tagName: string) => {
    const tagFil = researchThreads.research_threads.filter((f: any) => {
      return f.associated_tags.indexOf(tagName) > -1;
    });
    if (tagFil.length > 0) return tagFil[tagFil.length - 1].color;
    return '#D4D4D4';
  };

  const urls = entryData.files.filter((f) => f.fileType === 'url');
  const files = entryData.files.filter((f) => f.fileType !== 'url');

  // Cache the results of converting markdown to HTML, to avoid re-converting on every render
  const descriptionHTML = useMemo(() => {
    converter.makeHtml(entryData.description);
  }, [entryData.description]);

  return (
    <Box>
      <div
        style={{padding:10}}
      >
      <span style={{ fontSize: 22, fontWeight: 'bold' }}>
        {entryData.isPrivate && (
          <FaLock
            title="This entry is private, and will be hidden when the Trrrace is exported."
            size="0.75em"
            style={{ display: 'inline', fill: 'lightgrey' }}
          />
        )}
         {viewType != 'detail' && (
          <ActivityTitlePopoverLogic
            activityData={entryData}
            researchThreads={researchThreads}
          />
        )}
         {makeEditable && (
          <Button 
          leftIcon={<EditIcon />} 
          onClick={makeEditable}
          style={{display:'inline', float:'right'}}
          >
            Edit
          </Button>
        )}
      </span>

      <Text style={{ fontSize: 15, fontWeight: 'bold' }}>
        {format(new Date(entryData.date), 'dd MMMM yyyy')}
      </Text>
      <p>
        {entryData.tags.length === 0 ? (
          <b>No tags.</b>
        ) : (
          <>
            {entryData.tags.map((t) => (
              <Tag
                key={t}
                backgroundColor={checkTagColor(t)}
                marginRight="0.25em"
                marginBottom="0.25em"
              >
                {t}
              </Tag>
            ))}
          </>
        )}
      </p>
      <br />

      {entryData.description != '' && (
        <div
          style={{
            fontSize: '12px',
            fontStyle: 'italic',
            marginTop: '5px',
            marginBottom: 5,
          }}
        >
          {entryData.description}
          <br />
        </div>
      )}

      </div>

      <SimpleGrid columns={1} spacing={1}>
        {files.map((f, i) => (
          <ReadonlyEntryFile
            key={`readonly-${i}`}
            entryData={entryData}
            openFile={openFile}
            setViewType={setViewType}
            file={f}
            i={i}
          />
        ))}
      </SimpleGrid>
      {urls.length > 0 && (
        <div
          style={{padding:10}}
        >
          <span style={{fontSize: 16, fontWeight:800}}>
            URLs
          </span>
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
