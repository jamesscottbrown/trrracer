import path from 'path';
import React, { useState } from 'react';
import { ipcRenderer } from 'electron';

import {
  Image,
  Flex,
  Box
} from '@chakra-ui/react';

import { GrDocumentCsv, GrDocumentPpt, GrDocumentWord, GrDocumentText, GrDocumentExcel, 
GrDocumentRtf, GrDocumentImage, GrChatOption, GrCluster } from 'react-icons/gr';
import { ImFilePdf } from 'react-icons/im'
import { useProjectState } from './ProjectContext';
import GoogDriveParagraph from './GoogDriveElements';


interface DetailPreviewPropsType {
  folderPath: string;
  file: any;
  openFile: (title: string, fp: string) => void;
}

const styleInterpreter = {
  bold: {fontWeight: 'bold'},
  italic: {fontStyle: 'italic'},
  underline: {textDecorationLine: 'underline'}
}

const DetailPreview = (props: DetailPreviewPropsType) => {
  const { folderPath, file, openFile } = props;
  const [{ googleData }, dispatch] = useProjectState();

  let title = file.title;

  if (
    title.endsWith('.mp4') ||
    title.endsWith('.mov') ||
    title.endsWith('.webm')
  ) {
    // We can't add a caption, as we have no knowledge of what the file is
    // eslint-disable-next-line jsx-a11y/media-has-caption
    return <video src={`file://${path.join(folderPath, title)}`} controls />;
  }

  if (title.endsWith('.mp3') || title.endsWith('.ogg')) {
    // We can't add a caption, as we have no knowledge of what the file is
    // eslint-disable-next-line jsx-a11y/media-has-caption
    return <audio src={`file://${path.join(folderPath, title)}`} controls />;
  }

  const size = '65%';

  if (title.endsWith('.csv')) {
    return <GrDocumentCsv onClick={() => openFile(title, folderPath)} size={size} />;
  }

  if (title.endsWith('.ppt') || title.endsWith('.pptx') || title.endsWith('.key')) {
    //return <GrDocumentPpt onClick={() => openFile(title, folderPath)} size={size} />;
    return <embed style={{height:'90%'}} src={`file://${path.join(folderPath, title)}`} type="application/pdf"/>
  }

  if (title.endsWith('.doc') || title.endsWith('.docx')) {
    return <GrDocumentWord onClick={() => openFile(title, folderPath)} size={size} />;
  }

  if (title.endsWith('.gdoc')) {
    if(Object.keys(googleData).indexOf(file.fileId) > -1){

      let googD = googleData[file.fileId];
      let gContent = googD["body"]["content"].filter(f => f.startIndex)
      
      return <Box style={{overflowY: 'scroll', height:'100%', display: 'inline'}}>
        {
          gContent.map((m:any, i:number)=> (
            <GoogDriveParagraph parData={m} index={i} />
          ))
        }
      </Box>

    }
    
    // let string = `https://docs.google.com/document/d/${file.fileId}`
  
    // return <iframe src={string} height={'100%'}></iframe>
  
  }

  if (title.endsWith('.gsheet')) {
    return <GrDocumentExcel onClick={() => openFile(title, folderPath)} size={size} />;
  }

  if (title.endsWith('.txt')) {

    return <embed style={{height:'90%', width:'80%'}} src={`file://${path.join(folderPath, title)}`} type="text/javascript"/>
    
    // return <GrDocumentText onClick={() => openFile(title, folderPath)} size={size} />;
  }

    if (title.endsWith('.phy') || title.endsWith('.nex')) {
    return <GrCluster onClick={() => openFile(title, folderPath)} size={size} />;
  }

  if (title.endsWith('.rtf')) {
    return <GrDocumentRtf onClick={() => openFile(title, folderPath)} size={size} />;
  }
  if (title.endsWith('.eml')) {
    return <GrChatOption onClick={() => openFile(title, folderPath)} size={size} />;
  }

  if (title.endsWith('.pdf')) {
    return <embed style={{height:'90%'}} src={`file://${path.join(folderPath, title)}`} type="application/pdf"/>
     

     // return <ImFilePdf onClick={() => openFile(title, folderPath)} size={size} />;
  }

  if (title.endsWith('.HEIC')) {
    return <GrDocumentImage onClick={() => openFile(title, folderPath)} size={size} />;
  }
  return (
    <Image
      src={`file://${path.join(folderPath, title)}`}
      onClick={() => openFile(title, folderPath)}
    />
  );
};

export default DetailPreview;