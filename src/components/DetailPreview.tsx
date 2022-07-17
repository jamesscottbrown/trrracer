import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Image, Box, background } from '@chakra-ui/react';
import {
  GrDocumentCsv,
  GrDocumentWord,
  GrDocumentExcel,
  GrDocumentRtf,
  GrDocumentImage,
  GrCluster,
} from 'react-icons/gr';
import type { TextEntry } from './types';
import GoogDriveParagraph from './GoogDriveElements';
import EmailRender from './EmailRender';
import { joinPath, readFileSync } from '../fileUtil';
import { useProjectState } from './ProjectContext';
import ImageRender from './ImageRender';

const url = (folderPath: string, title: string) => {
  if (folderPath.startsWith("http://") || folderPath.startsWith("https://")){
    return `${joinPath(folderPath, title)}`;
  } else {
    return `file://${folderPath}/${title}`;
  }
};

interface DetailPreviewPropsType {
  openFile: (title: string, fp: string) => void;
  setFragSelected: any;
}

const TextRender = (textProps: any) => {
  const {textArray} = textProps;
  if(textArray.length > 1){
    return textArray.map((ta:any, i:number)=> (
      <span
        key={`book-span-${i}`}
        style={{
          color: ta.style === "normal" ? "black" : "#ffffff",
          backgroundColor: ta.style === 'normal' ? '#ffffff' : '#485063',
          padding: ta.style === "normal" ? 1 : 5,
        }}
      >{ta.textData}</span>
    ))
  }else{
    return <span>{textArray[0].textData}</span>
  }
}

const DetailPreview = (props: DetailPreviewPropsType) => {
  const {
    setFragSelected,
    openFile,
  } = props;
 
  const [{
    googleData, 
    projectData,
    folderPath,
    selectedArtifactEntry,
    selectedArtifactIndex
  }, dispatch] = useProjectState();

  const activity = useMemo(()=> {
    return projectData.entries.filter(f => f.activity_uid === selectedArtifactEntry.activity_uid)[0];
  }, [selectedArtifactEntry.activity_uid]);

  const artifact = useMemo(()=> {
    return activity.files[selectedArtifactIndex];
  }, [selectedArtifactEntry.activity_uid, selectedArtifactIndex]);

  const { title } = artifact;

  if (
    title.endsWith('.mp4') ||
    title.endsWith('.mov') ||
    title.endsWith('.webm')
  ) {
    // We can't add a caption, as we have no knowledge of what the file is
    // eslint-disable-next-line jsx-a11y/media-has-caption
    return <video src={url(folderPath, title)} controls />;
  }

  if (title.endsWith('.mp3') || title.endsWith('.ogg')) {
    // We can't add a caption, as we have no knowledge of what the file is
    // eslint-disable-next-line jsx-a11y/media-has-caption
    return <audio src={url(folderPath, title)} controls />;
  }

  const size = '65%';

  if (title.endsWith('.csv')) {
    return (
      <GrDocumentCsv onClick={() => openFile(title, folderPath)} size={size} />
    );
  }

  if (
    title.endsWith('.ppt') ||
    title.endsWith('.pptx') ||
    title.endsWith('.key')
  ) {
    // return <GrDocumentPpt onClick={() => openFile(title, folderPath)} size={size} />;
    return (
      <embed
        style={{ height: 'auto', width:'90%' }}
        src={url(folderPath, title)}
        type="application/pdf"
      />
    );
  }

  if (title.endsWith('.doc') || title.endsWith('.docx')) {
    return (
      <GrDocumentWord onClick={() => openFile(title, folderPath)} size={size} />
    );
  }

  if (title.endsWith('.gdoc')) {
   
    if (Object.keys(googleData).indexOf(artifact.fileId) > -1) {
      const googD = googleData[artifact.fileId];

      const gContent = googD.body.content.filter((f: any) => f.startIndex);

      let comments = artifact.comments ? artifact.comments.comments : [];

      return (
        <Box style={{ 
          overflow: 'scroll', 
          height: 'calc(100vh - 150px)', 
          width:'700px',
          display: 'inline', 
          boxShadow:"3px 3px 8px #A3AAAF",
          border:"1px solid #A3AAAF",
          borderRadius:6,
          padding:10,
          }}>
          <div
            style={{ height: '100%', width:'700px', overflow: 'auto' }}
            id={'gdoc'}
          >
            {gContent.map((m: any, i: number) => (
              <GoogDriveParagraph
                key={`par-${i}`}
                parData={m}
                index={i}
                comments={comments}
                setFragSelected={setFragSelected}
                artifactBookmarks={artifact.bookmarks}
              />
            ))}
          </div>
        </Box>
      );
    }
  }

  if (title.endsWith('.gsheet')) {
    return (
      <GrDocumentExcel
        onClick={() => openFile(title, folderPath)}
        size={size}
      />
    );
  }

  if (title.endsWith('.txt')) {

    const [textFile, setText] = useState<any>([]);

    useEffect(()=> {
      readFileSync(`${folderPath}/${title}`).then((text) => {

        let textArray = (text.length > 0) ? [{style:'normal', textData: text}] : [];
        
        if(artifact.bookmarks){
          let start = textArray[0].textData.split(artifact.bookmarks[0].fragment);
          
          textArray = [
            {style:'normal', textData: start[0]},
            {style:'highlight', textData: artifact.bookmarks[0].fragment},
            {style:'normal', textData: start[1]}
          ]
          if(artifact.bookmarks.length > 1){
    
            for(let j = 1; j < artifact.bookmarks.length; j++){
          
              let oldTextArray = textArray;
              let frag = artifact.bookmarks[j].fragment;
              let findIndex = textArray.map(ta => ta.textData.includes(frag)).indexOf(true);
    
              let newArray = oldTextArray.slice(0, findIndex);
            
              let addThis = oldTextArray[findIndex].textData.split(frag);
              let makeArray = [
                {style:'normal', textData: addThis[0] },
                {style:'highlight', textData: frag },
                {style:'normal', textData: addThis[1] },
              ]
              newArray = [...newArray, ...makeArray]
              
              if(oldTextArray.length > (findIndex + 1)){
                newArray = [...newArray, ...oldTextArray.slice((findIndex + 1),)]
              }
              textArray = newArray;
            }
          }
        }
          setText(textArray);
        });
    }, [folderPath, title])
    

    return (
      <div
        onMouseUp={() => {
          if (setFragSelected) {
            const selObj = window.getSelection();
            setFragSelected(selObj?.toString());
          } else {
            console.log('mouseup');
          }
        }}
        style={{ height: '100%', width:'90%', padding:8, overflow: 'auto' }}
      >
        {textFile.length > 0 ? <TextRender textArray={textFile} /> : <span>{"COULD NOT LOAD TEXT"}</span>}
      </div>
    );
  }

  if (title.endsWith('.phy') || title.endsWith('.nex')) {
    return (
      <GrCluster onClick={() => openFile(title, folderPath)} size={size} />
    );
  }

  if (title.endsWith('.rtf')) {
    return (
      <GrDocumentRtf onClick={() => openFile(title, folderPath)} size={size} />
    );
  }
  if (title.endsWith('.eml')) {
    return <EmailRender setFragSelected={setFragSelected} title={title} artifactData={artifact} activityData={activity} />;
  }

  if (title.endsWith('.pdf')) {
    return (
      // <embed
      //   style={{width: '90%' }}
      //   src={`file://${path.join(folderPath, title)}`}
      //   type="application/pdf"
      // />
      <iframe
        style={{ width:'90%', zoom:60 }}
        src={`file://${path.join(folderPath, title)}`}
       
        // type="application/pdf"
      />
    );
  }

  if (title.endsWith('.HEIC')) {
    return (
      <GrDocumentImage
        onClick={() => openFile(title, folderPath)}
        size={size}
      />
    );
  }
 
  return (
    <ImageRender 
      src={url(folderPath, title)}
      onClick={ () => {
        !setFragSelected
          ? openFile(title, folderPath)
          : console.log(MouseEvent);
      }}
      autoLoad={true}
      />
  );
};

export default DetailPreview;
