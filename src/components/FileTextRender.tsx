import React from 'react';

import {
  Badge,
  Box,
} from '@chakra-ui/react';

import { Tooltip } from "@chakra-ui/react"
import PopComment from './PopComment';

const FileTextRender = (fileDataProps) => {
    const { fileData, index, keywordArray } = fileDataProps;
    
     const formatConcord = (tf)=>{
        
        let matches =  tf.matches;
   
        if(matches  && matches.length > 0){
        return matches.map(m => {
            let arr = m.split(tf.key);
            return <p><span>{arr[0] + " "}<b>{tf.key}</b>{" " + arr[1]}</span><br /><br/></p>
        });
        }else{
       
        return <p><span>no matches for <b>{tf.key}</b></span></p>
        }
    }

    return (
        <>
        {fileData.fileType === "gdoc" ? (<Box>
          {
            fileData.emphasized ? <Box>
              {fileData.emphasized.map((em:any, i:number) => (
                <PopComment key={`em-${fileData.title}-${i}`} data={em} spanType={"emphasize"} />
                ))}</Box> : <Box  style={{display:'inline'}}>{""}</Box>
          }
          {
            (fileData.comments && fileData.comments.comments.length > 0) ? 
              fileData.comments.comments.map((co:any, i:number) => (
                  
                  <PopComment key={`co-${fileData.title}-${i}`} data={co} spanType={"comment"} />
              )) : <Box></Box>
          }
          </Box>) : 
          (<Box>
            {   keywordArray.filter(k => k['file-title'] === fileData.title)[0]  ? 
                keywordArray.filter(k => k['file-title'] === fileData.title)[0].keywords.keywords.map((m:any, i:number) => (
                   
                  <div key={`keyword-${i}`} style={{'display':'inline'}}>
                    <Tooltip placement="left" hasArrow label={formatConcord(m)}>
                      <Badge style={{margin:'3px'}}>{m.key}</Badge>
                    </Tooltip>
                  </div>
                
                )) : <div></div>
            }
          </Box>)}
        </>
    )
}

export default FileTextRender;