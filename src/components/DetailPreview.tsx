import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@chakra-ui/react';
import {
  GrDocumentCsv,
  GrDocumentWord,
  GrDocumentExcel,
  GrDocumentRtf,
  GrDocumentImage,
  GrCluster,
} from 'react-icons/gr';
import GoogDriveParagraph from './GoogDriveElements';
import EmailRender from './EmailRender';
import { joinPath, readFileSync } from '../fileUtil';
import { useProjectState } from './ProjectContext';
import ImageRender from './ImageRender';
import { getDriveFiles } from '../googleUtil';
import { TextArray } from './types';
import { replaceNames } from '../nameReplacer';

let googleCred: any;
const isElectron = process.env.NODE_ENV === 'development';
// import { Document, Page, pdfjs } from 'react-pdf/dist/esm/entry.webpack';
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

if (isElectron) {
  googleCred = require('../../assets/google_cred_desktop_app.json');
}

const url = (folderPath: string, title: string) => {
  if (folderPath.startsWith('http://') || folderPath.startsWith('https://')) {
    return `${joinPath(folderPath, title)}`;
  }
  return `file://${folderPath}/${title}`;
};

interface DetailPreviewPropsType {
  openFile: (title: string, fp: string) => void;
  setFragSelected: any;
  searchTermArtifact: string;
}

const TextRender = (textProps: { textArray: TextArray }) => {
  const { textArray } = textProps;
  if (textArray.length > 1) {
    return textArray.map((ta, i) => (
      <span
        key={`book-span-${i}`}
        style={{
          color: ta.style === 'normal' ? 'black' : '#ffffff',
          backgroundColor: ta.style === 'normal' ? '#ffffff' : '#ff5f1f',
          padding: ta.style === 'normal' ? 1 : 5,
        }}
      >
        {ta.textData}
      </span>
    ));
  }
  return <span>{textArray[0].textData}</span>;
};

const DetailPreview = (props: DetailPreviewPropsType) => {
  const { setFragSelected, searchTermArtifact, openFile } = props;
  console.log('SEARCH TERM ARTIFACT IN DETAIL VIEW', searchTermArtifact);
  const [
    {
      googleData,
      projectData,
      folderPath,
      selectedArtifact,
      isReadOnly,
      query,
    },
    dispatch,
  ] = useProjectState();

  const activity = useMemo(() => {
    return projectData.entries.filter(
      (f) => f.activity_uid === selectedArtifact.activity.activity_uid
    )[0];
  }, [selectedArtifact.activity.activity_uid]);

  const artifact = useMemo(() => {
    return activity.files[selectedArtifact.artifactIndex];
  }, [selectedArtifact.activity.activity_uid, selectedArtifact.artifactIndex]);

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
        style={{ height: 'auto', width: '90%' }}
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

    const [chosenGoogData, setchosenGoogData] = useState<null|any>(null);
    const [chosenComments, setChosenComments] = useState<null|any>(null);

    useEffect(()=> {

      if(isReadOnly){

        if (Object.keys(googleData).indexOf(artifact.fileId) > -1) {

          const googD = googleData[artifact.fileId];
          setchosenGoogData(googD.body.content.filter((f: any) => f.startIndex));
          if(artifact.comments) setChosenComments(artifact.comments.comments);
  
        }else{

        readFileSync(`${folderPath}${title}`)
          .then((res) => res.text())
          .then((tex) => {

          });
        }

      }else{
        if (Object.keys(googleData).indexOf(artifact.fileId) > -1) {

          const googD = googleData[artifact.fileId];
          setchosenGoogData(googD.body.content.filter((f: any) => f.startIndex));
          if(artifact.comments) setChosenComments(artifact.comments.comments);
  
        }else{
  
          getDriveFiles(folderPath, googleCred, googleData).then((googOb) => {
          
            const chosen = googOb.goog_doc_data[artifact.fileId];
  
            const gContent = chosen
              ? chosen.body.content.filter((f: any) => f.startIndex)
              : null;
            
            if(artifact.comments) setChosenComments(artifact.comments.comments);
            if(chosenGoogData === null){
              setchosenGoogData(gContent);
              dispatch({
                type: 'UPDATE_GOOG_DOC_DATA',
                googDocData: googOb.goog_doc_data,
              });
                // dispatch({type: 'UPDATE_GOOG_IDS', googFileIds: googOb.goog_file_ids});
  
            }
              
          });
        }
      }

    }, [title])

    return (
        chosenGoogData ? (
          <Box
            style={{
              overflow: 'scroll',
              height: 'calc(100vh - 150px)',
              width: '700px',
              display: 'inline',
              boxShadow: '3px 3px 8px #A3AAAF',
              border: '1px solid #A3AAAF',
              borderRadius: 6,
              padding: 10,
            }}
          >
            <div
              style={{ height: '100%', width: '700px', overflow: 'auto' }}
              id="gdoc"
            >
              {chosenGoogData.map((m: any, i: number) => (
                <GoogDriveParagraph
                  key={`par-${i}`}
                  parData={m}
                  index={i}
                  comments={chosenComments}
                  setFragSelected={setFragSelected}
                  artifactBookmarks={artifact.bookmarks}
                  searchTermArtifact={searchTermArtifact}
                />
              ))}
            </div>
          </Box>
        ) : (
          <div>Oops could not load google doc</div>
        )
    )
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
    const [textFile, setText] = useState<TextArray>([]);

    const textProcess = (textDat:string, st:any) => {

      let textArray =
      textDat.length > 0 ? [{ style: 'normal', textData: textDat }] : [];

      if (st) {
        const textA = textDat.split(st);
        const keeper = [{ style: 'normal', textData: textA[0] }];
        for (let j = 1; j < textA.length; j += 1) {
          keeper.push({ style: 'highlight', textData: st });
          keeper.push({ style: 'normal', textData: textA[j] });
        }
        textArray = keeper;
       
        }
      //   else if (query) {
      //   const textA = textDat.split(query.term);
      //   const keeper = [{ style: 'normal', textData: textA[0] }];
      //   for (let j = 1; j < textA.length - 1; j += 1) {
      //     keeper.push({ style: 'highlight', textData: query.term });
      //     keeper.push({ style: 'normal', textData: textA[j] });
      //   }
        
      //   textArray = keeper;
      
      // }
      else if (artifact.bookmarks) {
        const start = textArray[0].textData.split(
          artifact.bookmarks[0].fragment
        );

        textArray = [
          { style: 'normal', textData: start[0] },
          { style: 'highlight', textData: artifact.bookmarks[0].fragment },
          { style: 'normal', textData: start[1] },
        ];
        if (artifact.bookmarks.length > 1) {
          for (let j = 1; j < artifact.bookmarks.length; j += 1) {
            const oldTextArray = textArray;
            const frag = artifact.bookmarks[j].fragment;
            const findIndex = textArray
              .map((ta) => ta.textData.includes(frag))
              .indexOf(true);

            let newArray = oldTextArray.slice(0, findIndex);

            const addThis = oldTextArray[findIndex].textData.split(frag);
            const makeArray = [
              { style: 'normal', textData: addThis[0] },
              { style: 'highlight', textData: frag },
              { style: 'normal', textData: addThis[1] },
            ];
            newArray = [...newArray, ...makeArray];

            if (oldTextArray.length > findIndex + 1) {
              newArray = [...newArray, ...oldTextArray.slice(findIndex + 1)];
            }
            textArray = newArray;
          }
        }
      }
      return textArray;

    }

    let path = isReadOnly ? `${folderPath}${title}` : `${folderPath}/${title}`;

    console.log('searchTermArtifact', searchTermArtifact);

    useEffect(() => {
      console.log('SEARCHHHH TERMMMM ARTIFACTTTT', searchTermArtifact);
      if (isReadOnly) {
        readFileSync(path)
          .then((res) => res.text())
          .then((tex) => {

            let textAnon = replaceNames(tex)
            let textArray = textProcess(textAnon, searchTermArtifact);
            setText(textArray);
            
          });
      }else{
        readFileSync(path).then((text) => {
          let textArray = textProcess(text, searchTermArtifact);
        
          setText(textArray);
        });
      }
      
    }, [folderPath, title, searchTermArtifact]);

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
        id="detail-preview"
        style={{ height: '100%', width: '90%', padding: 8, overflow: 'auto' }}
      >
        {textFile.length > 0 ? (
          <TextRender textArray={textFile} />
        ) : (
          <span>COULD NOT LOAD TEXT</span>
        )}
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
    return (
      <EmailRender
        setFragSelected={setFragSelected}
        title={title}
        artifactData={artifact}
        activityData={activity}
      />
    );
  }

  if (title.endsWith('.pdf')) {
    const perf = joinPath(folderPath, title);
    const [pageData, setPageData] = useState();

    useEffect(() => {
      if (isReadOnly) {
        readFileSync(perf)
          .then((res) => res.text())
          .then((pap) => {
            setPageData(pap);
          });
      } else {
        setPageData(perf);
      }
    }, [folderPath, perf]);

    if (pageData) {
      return (
        // <iframe src="data:application/pdf;base64,YOUR_BINARY_DATA" height="100%" width="100%"></iframe>
        <iframe
          src={isReadOnly ? `data:application/pdf;base64,${pageData}` : perf}
          height="100%"
          width="700px"
          onLoad={(event) => {
            console.log('event', event);
          }}
        />
      );
    }
    return <div>Loading</div>;
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
      autoLoad
    />
  );
};

export default DetailPreview;
