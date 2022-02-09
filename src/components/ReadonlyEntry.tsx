import React from 'react';

import {
  Button,
  Heading,
  ListItem,
  Tag,
  Text,
  UnorderedList,
  Badge,
  Flex,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Box,
  FormControl,
  FormLabel,
  Image,
  SimpleGrid,
  Divider,
} from '@chakra-ui/react';


import AttachmentPreview from './AttachmentPreview';

import { EditIcon } from '@chakra-ui/icons';
import { FaExternalLinkAlt } from 'react-icons/fa';

import { format } from 'date-fns';
import * as Showdown from 'showdown';

import { File, EntryType, TagType } from './types';
import textColor from '../colors';
import { useProjectState } from './ProjectContext';

import { Tooltip } from "@chakra-ui/react"
import PopComment from './PopComment';


interface EntryPropTypes {
  entryData: EntryType;
  openFile: (a: string) => void;
  makeEditable: () => void;
}

const ReadonlyEntry = (props: EntryPropTypes) => {
  const { entryData, openFile, makeEditable } = props;
  console.log('entryDATA', entryData)
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

  const formatConcord = (tf)=>{

    let matches =  tf.matches;
   
    if(matches.length > 0){
      return matches.map(m => {
        let arr = m.split(tf.key);
        
        return <p><span>{arr[0] + " "}<b>{tf.key}</b>{" " + arr[1]}</span><br /><br/></p>
      });
    }else{
      console.log("not there")
      return <p><span>no matches for <b>{tf.key}</b></span></p>
    }

  }

  const urls = entryData.files.filter((f) => f.fileType === 'url');
  const files = entryData.files.filter((f) => f.fileType !== 'url');

  const key = entryData.key_txt.flatMap(kt => {
    return kt.keywords.keywords.map(k => k)
  })

  const googEm = entryData.files.filter(f=> {
    return f.fileType === 'gdoc' && f.emphasized;
  }).flatMap(m=> m.emphasized);

  const googComm = entryData.files.filter(f => {
    return f.fileType === 'gdoc' && f.comments
  }).flatMap(m => {
    let com = m.comments.comments.map(c =>{
      c.goog_id = m.fileId;
      return c;
    });
    
    return com
  });

  const [{ projectData, folderPath }] = useProjectState();

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
      <span style={{fontSize:"24", fontWeight:"bold"}}>
        {entryData.title}{' '}
        <Button leftIcon={<EditIcon />} onClick={makeEditable}>
          Edit
        </Button>
      </span>
    
      <Text style={{fontSize:"15", fontWeight:"bold"}}>
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
                borderColor={getColor(t)}
                borderWidth="5px"
                backgroundColor={getColor(t)}
                color={textColor(getColor(t))}
                marginRight="0.25em"
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
          dangerouslySetInnerHTML={{
            __html: converter.makeHtml(entryData.description),
          }}
        />
      )}
     
      <SimpleGrid columns={2} spacing={3}>
        {files.map((f, i) => (
          <>
          <Box key={`${f.title}-${i}`} p={3}>
            <span style={{fontSize:'11px'}}>{f.title}{' '}</span>
            <FaExternalLinkAlt
              onClick={() => openFile(f.title)}
              title="Open file externally"
              size="10px"
              style={{ display: 'inline' }}
            />
            <AttachmentPreview
              folderPath={folderPath}
              title={f.title}
              openFile={openFile}
            />
          </Box>
          
          {f.fileType === "gdoc" ? (<Box>
          {
            f.emphasized ? <Box>{f.emphasized.map(em => (
                <PopComment data={em} spanType={"emphasize"} />
                ))}</Box> : <Box>{""}</Box>
          }
          {
            (f.comments && f.comments.comments.length > 0) ? 
              f.comments.comments.map(co => (
                  <PopComment data={co} spanType={"comment"} />
              )) : <Box></Box>
          }
          </Box>) : 
          (<Box></Box>)}
   
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
     <div style={{float:'right', display:'inline-block', overflowY:'auto', height:'200px'}}>
  
        {  key.length > 0  ? 
                 key.map(k => (
                  <div style={{'display':'inline'}}>
                  <Tooltip placement="left" hasArrow label={formatConcord(k)}><Badge style={{margin:'3px'}}>{k.key}</Badge></Tooltip>
                    {/* <Tooltip placement="left" hasArrow label={formatConcord(k)}><Badge style={{margin:'3px'}} bg={colorBadge(k.freq)}>{k.key}</Badge></Tooltip> */}
                    {/* <Tooltip placement="left" hasArrow label={formatConcord(tf)}><Badge style={{margin:'3px'}} bg={colorBadge(tf[1])}>{tf[0]}</Badge></Tooltip> */}
                  </div>
                 ))
              : <div></div> 
          }
      </div>
    </Box>
  );
};

export default ReadonlyEntry;