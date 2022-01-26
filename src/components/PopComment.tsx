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
            
            return blob["quotedFileContent"] ? `${blob["quotedFileContent"]["value"]}` : " "
           
          }else{
              return blob['em']["content"]
          }
      }

      const formatContext = (blob, pos) => {
        if(blob.context){
          return pos === 'before' ? blob.context[0] : blob.context[1]
        }else{
          return ""
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
       
        let blobIndex = blob['index-in'];
        // let before = (blobIndex > 1 && state.projectData.googleData[blob['google-id']].body.content[blobIndex - 1].paragraph) ? state.projectData.googleData[blob['google-id']].body.content[blobIndex - 1].paragraph.elements : " ";
        // let after = (state.projectData.googleData[blob['google-id']].body.content[blobIndex + 1] && state.projectData.googleData[blob['google-id']].body.content[blobIndex + 1].paragraph) ? state.projectData.googleData[blob['google-id']].body.content[blobIndex + 1].paragraph.elements : " ";
        // return `${before[0].textRun} .... ${after.at(-1).textRun}`
      }
      
      const formatEmphasis = (blob) => {
          
          let blobOb =  {margin: '4px'}
          if(spanType === 'comment'){ 
             
              blobOb["fontWeight"] = "bold";
              blobOb["backgroundColor"] = "rgb(253,213,145)";
          }else{
              if(blob['em']['textStyle'].bold === true) blobOb["fontWeight"] = "bold";
              // if(blob['em']['textStyle'].italic === true) blobOb["fontStyle"] = "italic";
              // if(blob['em']['textStyle'].magnitude > 8) blobOb["fontSize"] = `${['em']['textStyle'].magnitude}px`;
              if(blob['em']['textStyle'].backgroundColor) blobOb["backgroundColor"] = colorConvert(blob['em']['textStyle'].backgroundColor.color.rgbColor)
              //if(blob['em']['textStyle'].foregroundColor) blobOb["color"] = colorConvert(blob['em']['textStyle'].foregroundColor.color.rgbColor)
          }
          return blobOb
        }

        const formatEmphasisVis = (blob) => {
          
          let blobOb =  {margin: '4px', width:'100px', height:'10px', "backgroundColor": 'gray'}
          if(spanType === 'comment'){ 
             
              blobOb["fontWeight"] = "bold";
              blobOb["backgroundColor"] = "rgb(253,213,145)";
          }else{
              if(blob['em']['textStyle'].bold === true) blobOb["height"] = '20px';
              if(blob['em']['textStyle'].italic === true) blobOb["fontStyle"] = "italic";
              // if(blob['em']['textStyle'].magnitude > 8) blobOb["fontSize"] = `${['em']['textStyle'].magnitude}px`;
              if(blob['em']['textStyle'].backgroundColor) {
                blobOb["backgroundColor"] = colorConvert(blob['em']['textStyle'].backgroundColor.color.rgbColor)
                // console.log(colorConvert(blob['em']['textStyle'].backgroundColor.color.rgbColor))
                blobOb["borderColor"] = "gray";
                blobOb["borderStyle"] = "solid";
                blobOb["borderWidth"] = '1px';
              }
              if(blob['em']['textStyle'].foregroundColor){ 
                console.log(colorConvert(blob['em']['textStyle'].foregroundColor.color.rgbColor))
                blobOb["backgroundColor"] = colorConvert(blob['em']['textStyle'].foregroundColor.color.rgbColor);
                blobOb["borderColor"] = "gray";
                blobOb["borderStyle"] = "solid";
                blobOb["borderWidth"] = '1px';
              
              }
          }
          return blobOb
        }
  
      return(

        <Popover trigger="hover">
        <PopoverTrigger>
          <div style={formatEmphasisVis(data)}>
          </div>
        
        </PopoverTrigger>
        <PopoverContent bg='white' color='gray'>
            <PopoverHeader fontWeight='semibold'>{data.createdTime}</PopoverHeader>
            <PopoverArrow bg='white' />
            
            <PopoverBody>
              {
                spanType === "comment" ? 

                <Box>{renderPop(data)}</Box> :

                <Box>
                <span>{formatContext(data, 'before')}</span>
                <span style={formatEmphasis(data)}>{formatText(data)}</span>
                <span>{formatContext(data, 'after')}</span>
                </Box>
              }
           
            </PopoverBody>
            <PopoverFooter><Button>Go to Doc</Button></PopoverFooter>
        </PopoverContent>
        </Popover>
          
      )
  
  }
  
  export default PopComment;