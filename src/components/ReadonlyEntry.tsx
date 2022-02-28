import React from 'react';

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
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  Box,
  SimpleGrid
} from '@chakra-ui/react';


import AttachmentPreview from './AttachmentPreview';

import { EditIcon } from '@chakra-ui/icons';
import { FaExternalLinkAlt, FaLock } from 'react-icons/fa';

import { format } from 'date-fns';
import * as Showdown from 'showdown';

import { File, EntryType, TagType } from './types';
import textColor from '../colors';
import { useProjectState } from './ProjectContext';

import FileTextRender from './FileTextRender'


interface EntryPropTypes {
  entryData: EntryType;
  openFile: (a: string, fp: string) => void;
  makeEditable: () => void;
  setViewType: (viewType: string) => void;
  setSelectedArtifactIndex: (index: number) => void;
  setSelectedArtifactEntry: (ent: any) => void;
}

const ReadonlyEntry = (props: EntryPropTypes) => {
  const { entryData, openFile, makeEditable, setViewType } = props;
 

  const colorBadge = (val)=>{
    if(val > .4){
      return 'gray.400';
    }else if(val <= .4 && val > .3){
      return 'gray.300';
    }else if(val <= .3 && val > .2){
      return 'gray.200';
    }else{
      return 'gray.100'
    }
  }

  const urls = entryData.files.filter((f) => f.fileType === 'url');
  const files = entryData.files.filter((f) => f.fileType !== 'url');

  const key = entryData.key_txt.flatMap(kt => {
    return kt.keywords.keywords.map(k => k)
  });
 
  const [{ projectData, folderPath }, dispatch] = useProjectState();

  const getColor = (tagName: string) => {
    const matchingTags = projectData.tags.filter(
      (t: TagType) => t.title === tagName
    );
    if (matchingTags.length === 0) {
      return 'gray';
    }
    return matchingTags[0].color;
  };

  const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,
  });

  return (
    <Box>
      <span style={{fontSize:22, fontWeight:"bold"}}>

      {entryData.isPrivate && (
          <FaLock
            title="This entry is private, and will be hidden when the Trrrace is exported."
            size="0.75em"
            style={{ display: 'inline', fill: 'lightgrey' }}
          />
        )}

        {entryData.title}{' '}
        {
          makeEditable ? 
          <Button leftIcon={<EditIcon />} onClick={makeEditable}>
            Edit
          </Button>
          : ""
        }
        
      </span>
    
      <Text style={{fontSize:15, fontWeight:"bold"}}>
        {format(new Date(entryData.date), 'dd MMMM yyyy')}
      </Text>
      <p>
        {entryData.tags.length === 0 ? (
          <b>No tags.</b>
        ) : (
          <>
            {entryData.tags.map((t) => 
              <Tag
                key={t}
                // borderColor={getColor(t)}
                // borderWidth="5px"
                // backgroundColor={getColor(t)}
                backgroundColor={'gray.200'}
                // color={textColor(getColor(t))}
                marginRight={"0.25em"}
                marginBottom={"0.25em"}
              >
                {t}
              </Tag>
            )}
          </>
        )}
      </p>

      <br />
      {entryData.description && (
        <div
          className="readonlyEntryMarkdownPreview"
          dangerouslySetInnerHTML={{
            __html: converter.makeHtml(entryData.description),
          }}
        />
      )}
     
      <SimpleGrid columns={1} spacing={3}>
        {files.map((f, i) => (
          <>
          <Box key={`${f.title}-${i}`} p={3}>

            <Popover trigger="hover">
              <PopoverTrigger>
                <span style={{fontSize:18, fontWeight:500, marginBottom:5}}>{f.title}{' '}</span>
              </PopoverTrigger>
              <PopoverContent bg='white' color='gray'>
                  {/* <PopoverHeader fontWeight='semibold'>{data.createdTime}</PopoverHeader> */}
                  <PopoverArrow bg='white' />
                  <PopoverBody>
                      <Button onClick={()=> {
                        setViewType("detail view")
                        dispatch({type: 'SELECTED_ARTIFACT', selectedArtifactEntry: entryData, selectedArtifactIndex: i})
                        }}>See artifact in detail.</Button>
                  </PopoverBody>
                  {/* <PopoverFooter><Button>Go to Doc</Button></PopoverFooter> */}
              </PopoverContent>
            </Popover>

            <FaExternalLinkAlt
              onClick={() => openFile(f.title, folderPath)}
              title="Open file externally"
              size="13px"
              style={{ display: 'inline' }}
            />
            {
              (f.fileType != 'gdoc' && f.fileType != 'txt') ? 
                <AttachmentPreview
                  folderPath={folderPath}
                  title={f.title}
                  openFile={openFile}
                /> : <FileTextRender fileData={f} index={i} keywordArray={entryData.key_txt} />
            }
          </Box>
          
        </>
        ))}

      </SimpleGrid>
      {urls.length > 0 && (
        <>
          <Heading as="h3" size="lg">
            URLs
          </Heading>
          <UnorderedList>
            {urls.map((url) => (
              <ListItem key={url.url}>
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