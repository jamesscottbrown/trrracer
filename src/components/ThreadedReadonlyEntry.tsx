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
  Badge,
  Tooltip
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { FaExternalLinkAlt, FaLock, FaTrash } from 'react-icons/fa';
import { GiCancel, GiSewingString } from 'react-icons/gi';
import { format } from 'date-fns';
import * as Showdown from 'showdown';
import AttachmentPreview from './AttachmentPreview';
import { EntryType, File } from './types';
import { useProjectState } from './ProjectContext';

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

interface ReadonlyArtifactPropTypes {
  entryData: EntryType;
  openFile: (a: string, fp: string) => void;
  setViewType: (viewType: string) => void;
  file: File;
  i: number;
}

const ReadonlyArtifact = (props: ReadonlyArtifactPropTypes) => {
  const { entryData, openFile, setViewType, file, i } = props;
  const [{ folderPath }, dispatch] = useProjectState();

  const [onHover, setOnHover] = useState(false);

  return (
    <>
    <Box 
    bg="#ececec" 
    p={3} 
    marginTop={1} 
    opacity={onHover ? 1 : .4}
    onMouseOver={()=> setOnHover(true)}
    onMouseOut={()=> setOnHover(false)}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          marginBottom: 5,
          width: 75,
          display: 'inline',
          cursor: 'pointer'
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
            hopArray: [entryData],
          });
        }}
      >See in detail</Button>
      </div>
      {(['png', 'jpg', 'gif'].includes(file.fileType) && onHover) && (
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

const ThreadedArtifact = (props:any) => {

  const { isEntryInThread, selectedThread, setViewType, openFile, fileData, entryData, folderPath, i, dispatch } = props;

  const [{researchThreads}] = useProjectState();

  

  return(
    <Box bg="#ececec" p={3}>
      <span style={{cursor:'pointer'}}>
          {fileData.threadPart.type === "fragment" ? "Fragment of artifact: " : "Threaded artifact: " }
          {fileData.title}{' '}
            <FaExternalLinkAlt
              onClick={() => openFile(fileData.title, folderPath)}
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
                  hopArray: [entryData],
                });
              }}
            >See in detail</Button>
      </span>
        <div>
          {
            fileData.threadPart.type === 'fragment' && (
              <div style={{fontWeight:300, fontSize:14}}>
                {fileData.threadPart.anchors.map( (m, j) => (
                  <React.Fragment key={`frag-${j}`}>
                  {m.anchor_type === 'text' ?
                  <span style={{backgroundColor:'yellow'}}>{m.frag_type}</span> :
                  <span>{"Image anchors"}</span>  
                  }
                  </React.Fragment>
                  
                ))}
              </div>
            )}
        </div>

        <div
        style={{marginTop:10}}
        >{"Why this was included: "}</div>
        <div
          style={{fontWeight: 300, fontSize: 14}}
        >{fileData.threadPart.rationale}</div>
          {['png', 'jpg', 'gif'].includes(fileData.fileType) && (
            <AttachmentPreview
              folderPath={folderPath}
              title={fileData.title}
              openFile={null}
            />
          )}
    </Box>

  )

}

const ActivityTitleLogic = (props:any) => {

  const { entryData } = props;
    return (
      <div style={{display:'inline'}}>
        <span>{entryData.title}</span>
      </div>
    )
}

const ThreadedReadonlyEntry = (props: EntryPropTypes) => {

  const { entryData, makeEditable, openFile, setViewType, viewType } = props;

  const [{ researchThreads, filterRT, folderPath, threadTypeFilterArray }] = useProjectState();

  let selectedThread = researchThreads.research_threads.filter(f=> f.title === filterRT.title)[0];
  let isEntryInThread = selectedThread.evidence.filter(f => f.activityTitle === entryData.title);

  let isEntryInAnyThreads = researchThreads.research_threads.filter(f=> {
    let temp = f.evidence.map(m=> m.activityTitle).filter(ev => entryData.title === ev)
    return temp.length > 0});

  const urls = entryData.files.filter((f) => f.fileType === 'url');
  const files = entryData.files.filter((f) => f.fileType !== 'url');

  let activitiesAsEvidence = isEntryInThread.filter(f => f.type === 'fragment' || f.type === 'artifact');

  let threadedFiles = files.filter(f => activitiesAsEvidence.map(m=> m.artifactTitle).includes(f.title))
  .map(m => {
    m.threadPart = activitiesAsEvidence.filter(f=> f.artifactTitle === m.title)[0];
    return m;
  });

  let otherFiles = files.filter(f => activitiesAsEvidence.map(m=> m.artifactTitle).indexOf(f.title) === -1)
  let threadedActivity = isEntryInThread.filter(f => f.type === 'activity');
  
  let threadedTags = entryData.tags.filter(f => selectedThread.associated_tags.includes(f));
  let nonThreadedTags = entryData.tags.filter(f => selectedThread.associated_tags.indexOf(f) === -1);


  const checkTagColor = (tagName: string) => {
    const tagFil = researchThreads.research_threads.filter((f: any) => {
      return f.associated_tags.indexOf(tagName) > -1;
    });
    if (tagFil.length > 0) return tagFil[tagFil.length - 1].color;
    return '#D4D4D4';
  };

  // Cache the results of converting markdown to HTML, to avoid re-converting on every render
  const descriptionHTML = useMemo(() => {
    converter.makeHtml(entryData.description);
  }, [entryData.description]);

  return (
    <Box>
      <div style={{padding:10}}>
      <span style={{ fontSize: 22, fontWeight: 'bold' }}>
        {entryData.isPrivate && (
          <FaLock
            title="This entry is private, and will be hidden when the Trrrace is exported."
            size="0.75em"
            style={{ display: 'inline', fill: 'lightgrey' }}
          />
        )}
        {viewType != 'detail' && (
         
          <div>
            <ActivityTitleLogic isEntryInThread={isEntryInThread} selectedThread={selectedThread} entryData={entryData} /> 
            <div style={{display:"inline", float:'right'}}>
            {makeEditable && (
                    <Button 
                      size={'sm'}
                      leftIcon={<EditIcon />} 
                      onClick={makeEditable}>
                      Edit
                    </Button>
                  )}
                  <Tooltip label="Remove from thread">
                    <Button
                      size={'sm'}
                      style={{
                        marginLeft:'5px'
                        // backgroundColor: '#ff726f',
                        // borderRadius: 30
                      }}
                    ><GiCancel size={18}/>
                    </Button> 
                  </Tooltip>
                 
            </div>
          </div>
        )}
  
        
      </span>

      <Text style={{ fontSize: 15, fontWeight: 'bold' }}>
        {format(new Date(entryData.date), 'dd MMMM yyyy')}
      </Text>
      <div>
        {entryData.tags.length === 0 ? (
          <b>No tags.</b>
        ) : (
          <>
          <div style={{display:'inline'}}>
          {threadedTags.map((t) => (
              <Tag
                key={t}
                backgroundColor={checkTagColor(t)}
                marginRight="0.25em"
                marginBottom="0.25em"
                style={{color: checkTagColor(t) === '#3932a3' ? '#fff' : 'black'}}
              >
                {t}
              </Tag>
            ))}
          </div>
          <div style={{display:'inline'}}>
            <Popover
              trigger={'hover'}
            >
            <PopoverTrigger>
              <Badge
                style={{
                  cursor:'pointer', 
                  paddingLeft:'5px', 
                  paddingRight:'5px', 
                  paddingTop:'2px', 
                  paddingBottom:'2px'}}
              >{nonThreadedTags.length}
              {threadedTags.length > 0 ? " More Tags": "Tags"}</Badge>
            </PopoverTrigger>

            <PopoverContent bg="white" color="gray">
              <PopoverArrow bg="white" />
              <PopoverBody>
                <>
                {
                  nonThreadedTags.map(nt => (
                    <Tag
                      key={nt}
                      backgroundColor={checkTagColor(nt)}
                      marginRight="0.25em"
                      marginBottom="0.25em"
                      style={{padding:'5px', cursor:'pointer'
                    }}
                      >
                        {nt}
                      </Tag>
                    ))
                  }
                </>
                  
              </PopoverBody>
            </PopoverContent>
            </Popover>
            </div>
          </>
        )}
      </div>
      {
        isEntryInAnyThreads.map(m => (
          <Tooltip 
          style={{padding:5}}
          label={`Threaded in ${m.title}`}>
          <div
          style={{
            fontSize:20, 
            backgroundColor: m.color, 
            borderRadius:50, 
            width:26, 
            display:'inline-block', 
            padding:3,
            margin:3,
            opacity: m.title === selectedThread.title ? 1 : .4
          }}
          ><GiSewingString size={'20px'}/>
          </div>
          </Tooltip>
         
        ))
      }
      </div>


      {
        threadedActivity.length > 0 && (
          <div>{threadedActivity[0].rationale}</div>
        )
      }

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
            entryData={entryData}
            setViewType={setViewType}
          />
        ))
        }
        </SimpleGrid>
        <SimpleGrid columns={1} spacing={1}>
        {
          otherFiles.map((f, i)=> (
            <ReadonlyArtifact
              key={`readonly-${i}`}
              entryData={entryData}
              openFile={openFile}
              setViewType={setViewType}
              file={f}
              i={i}
            />
          ))
        }
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

export default ThreadedReadonlyEntry;
