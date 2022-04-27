import path from 'path';
import React from 'react';
import { Image, Box } from '@chakra-ui/react';
import {
  GrDocumentCsv,
  GrDocumentWord,
  GrDocumentExcel,
  GrDocumentRtf,
  GrDocumentImage,
  GrCluster,
} from 'react-icons/gr';
import type { TextEntry } from './types';
import { useProjectState } from './ProjectContext';
import GoogDriveParagraph from './GoogDriveElements';
import EmailRender from './EmailRender';
import MarkableImage from './MarkableImage';

interface DetailPreviewPropsType {
  folderPath: string;
  artifact: any;
  activity: any;
  openFile: (title: string, fp: string) => void;
  setFragSelected: any;
  fragSelected:any;
  artifactIndex: number;
}

const DetailPreview = (props: DetailPreviewPropsType) => {
  const {
    setFragSelected,
    fragSelected,
    folderPath,
    artifact,
    activity,
    artifactIndex,
    openFile,
  } = props;

  const [{ googleData, txtData }] = useProjectState();

  const { title } = artifact;

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
        src={`file://${path.join(folderPath, title)}`}
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

      return (
        <Box style={{ 
          overflowY: 'scroll', 
          height: '100%', 
          display: 'inline', 
          boxShadow:"3px 3px 8px #A3AAAF",
          border:"1px solid #A3AAAF",
          borderRadius:6,
          padding:10,
          }}>
          <div
            onMouseUp={() => {
              if (setFragSelected) {
                const selObj = window.getSelection();
                setFragSelected(selObj?.toString());
              } else {
                console.log('mouseup');
              }
            }}
            style={{ height: '100%', overflow: 'auto' }}
          >
            {gContent.map((m: any, i: number) => (
              <GoogDriveParagraph
                key={`par-${i}`}
                parData={m}
                index={i}
                comments={artifact.comments.comments}
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
    const temp: TextEntry[] = txtData['text-data'].filter(
      (f: TextEntry) => f['entry-title'] === activity.title
    );

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
        style={{ height: '90%', overflow: 'auto' }}
      >
        {temp[0].text}
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
    return <EmailRender setFragSelected={setFragSelected} title={title} />;
  }

  if (title.endsWith('.pdf')) {
    return (
      <embed
        style={{ height: '90%' }}
        src={`file://${path.join(folderPath, title)}`}
        type="application/pdf"
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
  if (title.endsWith('.png')) {
    return (
      <MarkableImage
        activity={activity}
        artifactIndex={artifactIndex}
        imgPath={`file://${path.join(folderPath, title)}`}
      />
    );
  }
  // imgPath, activity, artifactIndex
  return (
    <Image
      htmlWidth="90%"
      htmlHeight="auto"
      fit="contain"
      src={`file://${path.join(folderPath, title)}`}
      onClick={ () => {
        !setFragSelected
          ? openFile(title, folderPath)
          : console.log(MouseEvent);
      }}
    />
  );
};

export default DetailPreview;
