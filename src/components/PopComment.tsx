import {
    Box,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverFooter,
    PopoverArrow,
    PopoverCloseButton,
    Button,
  } from '@chakra-ui/react';
import { format } from 'path/posix';

  import React, { useState, useEffect } from 'react';
  import { useProjectState } from './ProjectContext';

  const PopComment = (props) => { 
  
      const {data, spanType} = props;
      const [state, dispatch] = useProjectState();

      const anonName = (name, type)=> {
        let anon = state.projectData.roles[name];
        if(anon){
            return anon[type]
        }else{
            console.log('NAME NOT FOUND', name)
        }
      }
  
      const colorConvert = (codes: Object)=> {
          return `rgb(${(255 * codes.red)},${(255 * codes.green)},${(255 * codes.blue)})`
        }
  
      const formatText = (blob)=> {
          if(spanType === "comment"){
            
            return `${blob["quotedFileContent"]["value"]}`
            // return `${blob["author"]["displayName"]}: "${blob["content"]}"`
          }else{
              return blob['em']["content"]
          }
      }

      const renderPop = (blob) => {
        if(spanType === "comment"){

            let starter = formatPopoverComment(blob);
            if(blob.replies.length > 0){
                let rep = blob.replies.map(m => formatPopoverComment(m))
                starter += "-----------------------------" + rep;
            }
            return starter
        }else{
            return formatPopoverEmText(blob)
        }
      }

      const formatPopoverComment = (blob)=> {
        return `${anonName(blob["author"]["displayName"], 'initials')} (${anonName(blob["author"]["displayName"], 'role')}): "${blob["content"]}"`
      }

      const formatPopoverEmText = (blob) => {
        console.log("blob for emphasized", blob);
      }
      
      const formatEmphasis = (blob) => {
          
          let blobOb =  {margin: '4px', display: 'block'}
          if(spanType === 'comment'){ 
             
              blobOb["fontWeight"] = "bold";
              blobOb["backgroundColor"] = "yellow";
          }else{
              if(blob['em']['textStyle'].bold === true) blobOb["fontWeight"] = "bold";
              if(blob['em']['textStyle'].italic === true) blobOb["fontStyle"] = "italic";
              if(blob['em']['textStyle'].magnitude > 8) blobOb["fontSize"] = `${['em']['textStyle'].magnitude}px`;
              if(blob['em']['textStyle'].backgroundColor) blobOb["backgroundColor"] = "azure"
              if(blob['em']['textStyle'].foregroundColor) blobOb["color"] = colorConvert(blob['em']['textStyle'].foregroundColor.color.rgbColor)
          }
          return blobOb
        }
  
      
      return(

        <Popover trigger="hover">
        <PopoverTrigger>
        <span style={formatEmphasis(data)}>{formatText(data)}</span>
        </PopoverTrigger>
        <PopoverContent bg='white' color='gray'>
            <PopoverHeader fontWeight='semibold'>{data.createdTime}</PopoverHeader>
            <PopoverArrow bg='white' />
            
            <PopoverBody>
            {/* <Box
            // as="iframe"
            // src={`https://docs.google.com/document/d/${data.goog_id}`}
            // src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.952912260219!2d3.375295414770757!3d6.5276316452784755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2ae68280c1%3A0xdc9e87a367c3d9cb!2sLagos!5e0!3m2!1sen!2sng!4v1567723392506!5m2!1sen!2sng"
            alt="demo"
            /> */}
            {/* <Box>{formatPopoverComment(data)}</Box> */}
            <Box>{renderPop(data)}</Box>
            </PopoverBody>
            <PopoverFooter><Button>Go to Doc</Button></PopoverFooter>
        </PopoverContent>
        </Popover>
          
      )
  
  }
  
  export default PopComment;