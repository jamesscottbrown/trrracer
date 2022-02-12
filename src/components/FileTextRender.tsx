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

const FileTextRender = (fileDataProps) => {
    const { fileData, index, keywordArray } = fileDataProps;

     const formatConcord = (tf)=>{
        console.log('tf', tf)
        let matches =  tf.matches;
   
        if(matches  && matches.length > 0){
        return matches.map(m => {
            let arr = m.split(tf.key);
            
            return <p><span>{arr[0] + " "}<b>{tf.key}</b>{" " + arr[1]}</span><br /><br/></p>
        });
        }else{
        console.log("not there")
        return <p><span>no matches for <b>{tf.key}</b></span></p>
        }
    }

    return (
        <>
        {fileData.fileType === "gdoc" ? (<Box>
          {
            fileData.emphasized ? <Box>{fileData.emphasized.map(em => (
                <PopComment data={em} spanType={"emphasize"} />
                ))}</Box> : <Box>{""}</Box>
          }
          {
            (fileData.comments && fileData.comments.comments.length > 0) ? 
              fileData.comments.comments.map(co => (
                  
                  <PopComment data={co} spanType={"comment"} />
              )) : <Box></Box>
          }
          </Box>) : 
          (<Box>
            {   keywordArray.filter(k => k['file-title'] === fileData.title)[0]  ? 
                keywordArray.filter(k => k['file-title'] === fileData.title)[0].keywords.keywords.map(m => (
                   
                  <div style={{'display':'inline'}}>
                  <Tooltip placement="left" hasArrow label={formatConcord(m)}><Badge style={{margin:'3px'}}>{m.key}</Badge></Tooltip>
                  </div>
                
                )) : <div></div>
            }
          </Box>)}
        </>
    )
}

export default FileTextRender;