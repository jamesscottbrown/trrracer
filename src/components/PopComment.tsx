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
  } from '@chakra-ui/react';


  import React, { useState, useEffect } from 'react';

  const PopComment = (props) => { 
  
      const {data, spanType} = props;

      console.log(data, data.goog_id);
  
      const colorConvert = (codes: Object)=> {
          return `rgb(${(255 * codes.red)},${(255 * codes.green)},${(255 * codes.blue)})`
        }
  
      const formatText = (blob)=> {
          console.log("BLOB",blob)
          if(spanType === "comment"){
              return `${blob["quotedFileContent"]["value"]}`
          }else{
              return blob['em']["content"]
          }
      }
      
      const formatEmphasis = (blob) => {
          
          let blobOb =  {margin: '4px', display: 'block'}
          if(spanType === 'comment'){ 
              console.log("ITS A COMMENT")
              blobOb["fontWeight"] = "bold";
              blobOb["backgroundColor"] = "yellow"
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
        <PopoverContent bg='tomato' color='white'>
            <PopoverHeader fontWeight='semibold'>{data.goog_id}</PopoverHeader>
            <PopoverArrow bg='pink.500' />
            <PopoverCloseButton bg='purple.500' />
            <PopoverBody>
            <Box
            as="iframe"
            src={`https://docs.google.com/document/d/${data.goog_id}`}
            // src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.952912260219!2d3.375295414770757!3d6.5276316452784755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2ae68280c1%3A0xdc9e87a367c3d9cb!2sLagos!5e0!3m2!1sen!2sng!4v1567723392506!5m2!1sen!2sng"
            alt="demo"
            />
            </PopoverBody>
        </PopoverContent>
        </Popover>
          
      )
  
  }
  
  export default PopComment;