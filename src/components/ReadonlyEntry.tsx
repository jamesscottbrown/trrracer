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
  PopoverHeader,
  PopoverFooter
} from '@chakra-ui/react';

import { EditIcon } from '@chakra-ui/icons';
import { FaExternalLinkAlt, FaLock } from 'react-icons/fa';

import { format } from 'date-fns';
import * as Showdown from 'showdown';
import AttachmentPreview from './AttachmentPreview';

import { EntryType, TagType, File } from './types';
import { useProjectState } from './ProjectContext';
import ActivitytoThread from './ActivityToThread';

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

  const [showPopover, setShowPopover] = useState(false);

  const closePopover = () => {
    setShowPopover(false);
  };

  return (
    <React.Fragment key={`fr-${file.title}-${i}`}>
      <Box bg="#ececec" key={`${file.title}-${i}`} p={3}>
        {showPopover ? (
          <Popover isOpen={showPopover} onClose={closePopover}>
            <PopoverTrigger>
              <span style={{ fontSize: 18, fontWeight: 500, marginBottom: 5 }}>
                {file.title}{' '}
              </span>
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
                    });
                  }}
                >
                  See artifact in detail.
                </Button>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        ) : (
          <span
            style={{ fontSize: 18, fontWeight: 500, marginBottom: 5 }}
            onMouseEnter={() => setShowPopover(true)}
          >
            {' '}
            {file.title}{' '}
          </span>
        )}

        <FaExternalLinkAlt
          onClick={() => openFile(file.title, folderPath)}
          title="Open file externally"
          size="13px"
          style={{ display: 'inline' }}
        />
        <AttachmentPreview
          folderPath={folderPath}
          title={file.title}
          openFile={openFile}
          size={60}
        />
        {/* {f.fileType != 'gdoc' && f.fileType != 'txt' ?
                <AttachmentPreview
                  folderPath={folderPath}
                  title={f.title}
                  openFile={openFile}
                /> : <FileTextRender fileData={f} index={i} keywordArray={entryData.key_txt} />
            } */}
      </Box>
    </React.Fragment>
  );
};

const ActivityTitlePopoverLogic = (props:any) => {

  const { activityData, researchThreads} = props;

  const [seeThreadAssign, setSeeThreadAssign] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [activitySelected, setActivitySelected] = useState(false);


  const closePopover = () => {
    setShowPopover(false);
  };

  return (showPopover ? (
      <Popover
        isOpen={showPopover}
        onClose={closePopover}
        onMouseLeave={closePopover}
      >
      <PopoverTrigger>
        <Box
          key={`${activityData.title}-${activityData.index}`}
          marginTop={2}
          marginLeft={2}
          style={{cursor:'pointer'}}
          className="activity"
          onMouseLeave={() => {
            setActivitySelected(false);
            closePopover();
          }}
        >
           <div>{activityData.title}{' '}</div>
        </Box>
      </PopoverTrigger>
      <PopoverContent bg="white" color="gray">
        <PopoverArrow bg="white" />
        <PopoverHeader>
          <span style={{ fontWeight: 600 }}>{`${activityData.title}`}</span>
          <span style={{ display: 'block' }}>{activityData.date}</span>
        </PopoverHeader>
        <PopoverBody>
          {seeThreadAssign ? (
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
                      /> 
                    </React.Fragment>
                  )
                )
              ) : (
                <span>no threads yet</span>
              )}
            </div>
          ) : (
            <div>
              <span style={{ display: 'block' }}>Artifacts:</span>
              <UnorderedList>
                {activityData.files.map((f: File, i: number) => (
                  <ListItem key={`f-${f.title}-${i}`}>{f.title}</ListItem>
                ))}
              </UnorderedList>
            </div>
          )}
        </PopoverBody>
        <PopoverFooter>
          {seeThreadAssign ? (
            <Box>
              <Button onClick={() => setSeeThreadAssign(false)}>cancel</Button>
            </Box>
          ) : (
            <Button onClick={() => setSeeThreadAssign(true)}>
              Add this activity to a thread.
            </Button>
          )}
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  ):
  
  <div 
  style={{cursor:'pointer'}}
  onMouseOver={()=> {
    setShowPopover(true);
  }}>{activityData.title}{' '}</div>)
  
}

const ReadonlyEntry = (props: EntryPropTypes) => {
  const { entryData, makeEditable, openFile, setViewType, viewType } = props;
  const [{ projectData, researchThreads }] = useProjectState();

 
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
        
        {makeEditable ? (
          <Button leftIcon={<EditIcon />} onClick={makeEditable}>
            Edit
          </Button>
        ) : (
          ''
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
      {entryData.description && (
        <div
          className="readonlyEntryMarkdownPreview"
          dangerouslySetInnerHTML={{ __html: descriptionHTML }}
        />
      )}

      <SimpleGrid columns={1} spacing={3}>
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
        <>
          <Heading as="h3" size="lg">
            URLs
          </Heading>
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
        </>
      )}
    </Box>
  );
};

export default ReadonlyEntry;
