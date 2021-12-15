import React from 'react';

import {
  Button,
  Heading,
  ListItem,
  Tag,
  Text,
  UnorderedList,
  Badge
} from '@chakra-ui/react';

import { EditIcon } from '@chakra-ui/icons';
import { FaExternalLinkAlt } from 'react-icons/fa';

import { format } from 'date-fns';
import * as Showdown from 'showdown';

import { File, EntryType, TagType } from './types';
import textColor from '../colors';
import { useProjectState } from './ProjectContext';

import { Tooltip } from "@chakra-ui/react"


interface EntryPropTypes {
  entryData: EntryType;
  openFile: (a: string) => void;
  makeEditable: () => void;
}

const ReadonlyEntry = (props: EntryPropTypes) => {
  const { entryData, openFile, makeEditable } = props;



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
    let matches =  tf.entry_matches;
   
    if(matches.length > 0){
      return matches.map(m => {
        let arr = m.concord.split(m.concept);
        
        return <p><span>{arr[0] + " "}<b>{m.concept}</b>{" " + arr[1]}</span><br /><br/></p>
      });
    }else{
      console.log("not there")
      return <p><span>no matches for <b>{tf.term}</b></span></p>
    }

  }

  // return (
  //   <div style={{margin:"auto", padding:"10px"}}>

  //     <div style={{width:'60%', display:'inline-block'}}>
  //     <div style={{width:'100%'}}>
  //     <Heading as="h2">
  //       {entryData.title}{' '}
  //       <EditIcon
  //         onClick={makeEditable}
  //         title="Click to show controls for editing this entry"
  //       />
  //     </Heading>
  //     </div>
  //       <p>
  //         {format(new Date(entryData.date), 'dd MMMM yyyy')}
  //       </p>
  //       <br />
  //       <p>
  //         Tags:{' '}
  //         {entryData.tags.map((t) => (
  //           <Tag key={t}>{t}</Tag>
  //         ))}
  //       </p>
  //       <p>{entryData.description}</p>
  //       <UnorderedList>
  //         {entryData.files.map((file: File) => (
  //           <ListItem key={file.title}>
  //             {file.title}{' '}
  //             <FaExternalLinkAlt
  //               onClick={() => openFile(file.title)}
  //               title="Open file externally"
  //               size="12px"
  //               style={{display:"inline"}}
  //             />{' '}
  //           </ListItem>
  //         ))}
  //       </UnorderedList>
  //     </div>
  //     <div style={{float:'right', width:'37%', display:'inline-block'}}>
        
  //       {  entryData.tfidf != null && entryData.tfidf.yak != null && entryData.tfidf.yak != 'null' ? 
  //        
  //           entryData.tfidf['yak'].map(tf =>(
  //             <div style={{'display':'inline'}}>
  //                <Tooltip placement="left" hasArrow label={formatConcord(tf)}><Badge style={{margin:'3px'}} bg={colorBadge(tf)}>{tf.term}</Badge></Tooltip>
  //               {/* <Tooltip placement="left" hasArrow label={formatConcord(tf)}><Badge style={{margin:'3px'}} bg={colorBadge(tf[1])}>{tf[0]}</Badge></Tooltip> */}
  //           </div>
  //           ))
  //       : <div></div>}
  //     </div>
  //   </div>
  const urls = entryData.files.filter((f) => f.fileType === 'url');
  const files = entryData.files.filter((f) => f.fileType !== 'url');

  const [{ projectData }] = useProjectState();

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
    <>
      <Heading as="h2">
        {entryData.title}{' '}
        <Button leftIcon={<EditIcon />} onClick={makeEditable}>
          Edit entry
        </Button>
      </Heading>
      <Text fontSize="lg" fontWeight="bold">
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

      {/* <div
        className="readonlyEntryMarkdownPreview"
        dangerouslySetInnerHTML={{
          __html: converter.makeHtml(entryData.description),
        }}
      /> */}
          {entryData.description && (
        <div
          className="readonlyEntryMarkdownPreview"
          dangerouslySetInnerHTML={{
            __html: converter.makeHtml(entryData.description),
          }}
        />
      )}

      <UnorderedList>
        {files.map((file: File) => (
          <ListItem key={file.title}>
            {file.title}{' '}
            <FaExternalLinkAlt
              onClick={() => openFile(file.title)}
              title="Open file externally"
              size="12px"
              style={{ display: 'inline' }}
            />{' '}
          </ListItem>
        ))}
      </UnorderedList>

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
     <div style={{float:'right', width:'37%', display:'inline-block'}}>
        
            {  entryData.tfidf != null && entryData.tfidf.yak != null && entryData.tfidf.yak != 'null' ? 
                 
                  entryData.tfidf['yak'].map(tf =>(
                    <div style={{'display':'inline'}}>
                       <Tooltip placement="left" hasArrow label={formatConcord(tf)}><Badge style={{margin:'3px'}} bg={colorBadge(tf)}>{tf.term}</Badge></Tooltip>
                      {/* <Tooltip placement="left" hasArrow label={formatConcord(tf)}><Badge style={{margin:'3px'}} bg={colorBadge(tf[1])}>{tf[0]}</Badge></Tooltip> */}
                  </div>
                  ))
              : <div></div>}
            </div>
    </>
  );
};

export default ReadonlyEntry;