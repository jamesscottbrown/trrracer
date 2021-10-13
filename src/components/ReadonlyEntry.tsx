import React from 'react';

import { Heading, ListItem, Tag, UnorderedList, Badge } from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';


import { FaExternalLinkAlt } from 'react-icons/fa';
import { format } from 'date-fns';

import { File, EntryType } from './types';

interface EntryPropTypes {
  entryData: EntryType;
  openFile: (a: string) => void;
  makeEditable: () => void;
}

const ReadonlyEntry = (props: EntryPropTypes) => {
  const { entryData, openFile, makeEditable } = props;

  console.log('in read only',entryData);

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

  return (
    <div style={{margin:"auto", padding:"10px"}}>

      <div style={{width:'60%', display:'inline-block'}}>
      <div style={{width:'100%'}}>
      <Heading as="h2">
        {entryData.title}{' '}
        <EditIcon
          onClick={makeEditable}
          title="Click to show controls for editing this entry"
        />
      </Heading>
      </div>
        <p
          // style={{
          //   marginLeft: 'auto',
          //   marginRight: 'auto',
          //   width: 'max-content',
          // }}
        >
          {format(new Date(entryData.date), 'dd MMMM yyyy')}
        </p>
        <br />
        <p>
          Tags:{' '}
          {entryData.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </p>
        <p>{entryData.description}</p>
        <UnorderedList>
          {entryData.files.map((file: File) => (
            <ListItem key={file.title}>
              {file.title}{' '}
              <FaExternalLinkAlt
                onClick={() => openFile(file.title)}
                title="Open file externally"
                size="12px"
                style={{display:"inline"}}
              />{' '}
            </ListItem>
          ))}
        </UnorderedList>
      </div>
      <div style={{float:'right', width:'30%', display:'inline-block'}}>
        
        {  entryData.tfidf != null ? 
            entryData.tfidf['tf-idf'].map(tf =>(
              <Badge style={{margin:'3px'}} bg={colorBadge(tf[1])}>{tf[0]}</Badge>
            ))
        : <div></div>}
      </div>
    </div>
  );
};

export default ReadonlyEntry;