import React, {useMemo, useState} from 'react';

import {
  Badge,
  Box,
} from '@chakra-ui/react';

import { Tooltip } from "@chakra-ui/react"
import PopComment from './PopComment';

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


type CustomTooltipProps = {
  badgeText: string;
  hoverText: string;
};
const CustomTooltip = (props: CustomTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { badgeText, hoverText } = props;

  if (isOpen) {
    return (
      <Tooltip placement="left" hasArrow label={hoverText} isOpen={isOpen}>
        <Badge style={{ margin: '3px' }} onMouseOut={() => setIsOpen(false)} onMouseLeave={() => setIsOpen(false)}>
          {badgeText}
        </Badge>
      </Tooltip>
    );
  } else {
    return (
      <Badge style={{ margin: '3px' }} onMouseOver={() => setIsOpen(true)}>
        {badgeText}
      </Badge>
    );
  }
};

const FileTextRender = (fileDataProps) => {
    const { fileData, index, keywordArray } = fileDataProps;

    const labelledKeywords = useMemo(
      () => {

        const ks = keywordArray.filter((k: any) => k['file-title'] === fileData.title);

        return (ks.length > 0) ? ks[0].keywords.keywords.map((m: any) => ({
            key: m.key,
            label: formatConcord(m)
          }))
          : [];
      },
  [keywordArray]
  );


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
            {  labelledKeywords.map((k:any, i:number) => (
                  <div key={`keyword-${i}`} style={{'display':'inline'}}>
                    <CustomTooltip badgeText={k.key} hoverText={k.label} />
                  </div>
                ))
            }
          </Box>)}
        </>
    )
}

export default FileTextRender;
