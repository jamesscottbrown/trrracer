import {
  Popover,
  PopoverTrigger,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { replaceNames } from '../nameReplacer';
import { useProjectState } from './ProjectContext';
import type { GoogleDocParagraph, GoogleParagraphStyle } from './types';

const colorConvert = (codes: any) => {
  return `rgb(${255 * (codes.red ? codes.red : 0)},${
    255 * (codes.green ? codes.green : 0)
  },${255 * (codes.blue ? codes.blue : 0)})`;
};

const GoogInline = (googProps: any) => {
  const { sectionData } = googProps;
  return (
    <div>{` picture here! ${sectionData.inlineObjectElement.inlineObjectId} `}</div>
  );
};

const styleSection = (
  sectionData: any,
  commentedOn: any,
  spanColor: any,
  bookmarked: any
) => {
  const styleOb = { display: 'inline', cursor: 'pointer' };

  if (sectionData.textRun.textStyle) {
    Object.keys(sectionData.textRun.textStyle).forEach((m) => {
      if (m === 'italic') styleOb.fontStyle = 'italic';
      if (m === 'bold') styleOb.fontWeight = 'bold';
      if (m === 'backgroundColor') {
        styleOb.backgroundColor =
          spanColor === true || bookmarked === true
            ? '#FFB347'
            : colorConvert(sectionData.textRun.textStyle[m].color.rgbColor);
      }
      if (m === 'foregroundColor') {
        styleOb.color = colorConvert(
          sectionData.textRun.textStyle[m].color.rgbColor
        );
      }
    });
    if (commentedOn) {
      styleOb.backgroundColor = spanColor === false ? '#FFFCBB' : '#FFB347';
    }
    if (spanColor) {
      styleOb.backgroundColor = '#FFB347';
    }
  }

  if (bookmarked) {
    styleOb.backgroundColor = 'gray';
    styleOb.color = '#ffffff';
  }

  return styleOb;
};

const GoogDriveSpans = (googProps: any) => {
  const { googEl, index, comments, setFragSelected, artifactBookmarks } =
    googProps;

  const [spanColor, setSpanColor] = useState(false);

  const [{isReadOnly, query}] = useProjectState();

  const temp =
    comments && comments.length > 0
      ? comments.filter(
          (f: any) =>
            googEl.textRun &&
            f.quotedFileContent && 
            googEl.textRun.content.includes(f.quotedFileContent.value)
        )
      : [];

  var styleOb = styleSection(googEl, temp.length > 0, spanColor, false);

  useEffect(() => {
    const tempBookmark =
      artifactBookmarks && artifactBookmarks.length > 0
        ? artifactBookmarks.filter((f: any) => {
            return googEl.textRun.content === f.fragment;
          })
        : [];

    if (tempBookmark.length > 0) {
      styleOb = styleSection(googEl, temp.length > 0, spanColor, true);
    } else {
      styleOb = styleSection(googEl, temp.length > 0, spanColor, false);
    }
  }, [spanColor, artifactBookmarks]);

  return temp.length > 0 ? (
    <Popover trigger="hover">
      <PopoverTrigger>
        {
          query && googEl.textRun.content.includes(query?.term) ? 

          <span 
          key={`elem-${index}`} 
          style={{backgroundColor: '#ff5f1f', color:'#fff'}}>
             {isReadOnly ? replaceNames(googEl.textRun.content) : googEl.textRun.content}
          </span> :  
          <span key={`elem-${index}`} style={styleOb}>
            {isReadOnly ? replaceNames(googEl.textRun.content) : googEl.textRun.content}
          </span>
        }
       
      </PopoverTrigger>

      <PopoverContent bg="white" color="gray">
        <PopoverArrow bg="white" />

        <PopoverBody>
          <div>
            {temp.map((t, i) => (
              <div key={`span-comment-${i}`}>
                <span
                  dangerouslySetInnerHTML={{ __html: t.htmlContent }}
                ></span>
              </div>
            ))}
          </div>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  ) : (
    
      (query && googEl.textRun.content.includes(query?.term)) ? 
      <span
      key={`elem-${index}`}
      style={{
        backgroundColor: '#ff5f1f', 
        color:'#fff',
        cursor:'pointer'
      }}
      onMouseOver={() => setSpanColor(true)}
      onMouseOut={() => setSpanColor(false)}
      onClick={() => setFragSelected(googEl.textRun.content)}
      >
         {isReadOnly ? replaceNames(googEl.textRun.content) : googEl.textRun.content}
      </span> :
      <span
      key={`elem-${index}`}
      style={styleOb}
      onMouseOver={() => setSpanColor(true)}
      onMouseOut={() => setSpanColor(false)}
      onClick={() => setFragSelected(googEl.textRun.content)}
    >
      {isReadOnly ? replaceNames(googEl.textRun.content) : googEl.textRun.content}
    </span>
    
   
  );
};

const GoogDriveParagraph = (parProps: any) => {
  const { parData, index, comments, setFragSelected, artifactBookmarks } =
    parProps;

  const getHeading = (
    styling: GoogleParagraphStyle,
    content: GoogleDocParagraph
  ) => {
    if (styling.namedStyleType.includes('1'))
      return (
        <span
          style={{
            fontSize: 30,
            fontWeight: 800,
            display: 'block',
            marginBottom: 10,
            marginTop: 6,
          }}
        >
          {content.elements[0].textRun
            ? content.elements[0].textRun.content
            : ''}
        </span>
      );
    if (styling.namedStyleType.includes('2'))
      return (
        <span
          style={{
            fontSize: 24,
            fontWeight: 700,
            display: 'block',
            marginBottom: 10,
            marginTop: 6,
          }}
        >
          {content.elements[0].textRun
            ? content.elements[0].textRun.content
            : ''}
        </span>
      );
    if (styling.namedStyleType.includes('3'))
      return (
        <span
          style={{
            fontSize: 18,
            fontWeight: 600,
            display: 'block',
            marginBottom: 10,
            marginTop: 6,
          }}
        >
          {content.elements[0].textRun
            ? content.elements[0].textRun.content
            : ''}
        </span>
      );
  };

  return parData.paragraph.paragraphStyle.namedStyleType.includes('HEADING') ? (
    <div>{getHeading(parData.paragraph.paragraphStyle, parData.paragraph)}</div>
  ) : (
    <div key={`sections-${index}`}>
      {parData.paragraph.elements &&
        parData.paragraph.elements.map((elem: any, j: number) => (
          <React.Fragment key={`span-${j}`}>
            {elem.textRun ? (
              <GoogDriveSpans
                googEl={elem}
                index={j}
                comments={comments}
                setFragSelected={setFragSelected}
                artifactBookmarks={artifactBookmarks}
              />
            ) : (
              <GoogInline sectionData={elem} />
            )}
          </React.Fragment>
        ))}
    </div>
  );
};

export default GoogDriveParagraph;
