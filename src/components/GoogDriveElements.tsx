import {
  Popover,
  PopoverTrigger,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  background,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
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

const styleSection = (sectionData: any, commentedOn: any, spanColor:any, bookmarked:any) => {


  const styleOb = { display: 'inline', cursor: 'pointer' };
  
  if (sectionData.textRun.textStyle) {
    Object.keys(sectionData.textRun.textStyle).forEach((m) => {
      if (m === 'italic') styleOb.fontStyle = 'italic';
      if (m === 'bold') styleOb.fontWeight = 'bold';
      if (m === 'backgroundColor') {
        
        styleOb.backgroundColor = (spanColor === true || bookmarked === true) ? '#FFB347' : colorConvert(
          sectionData.textRun.textStyle[m].color.rgbColor
        );
      }
      if (m === 'foregroundColor') {
        styleOb.color = colorConvert(
          sectionData.textRun.textStyle[m].color.rgbColor
        );
      }
    });
    if (commentedOn) styleOb.backgroundColor = (spanColor === false) ? '#FFFCBB' : '#FFB347';
    if (bookmarked){ 
      console.log('boomark??', bookmarked)
      styleOb.backgroundColor = '#FFFCBB';
      styleOb.color = '#ffffff';
    }
  }
 
  return styleOb;
};

const GoogDriveSpans = (googProps: any) => {
  const { googEl, index, comments, setFragSelected, activityBookmarks } = googProps;

  const [spanColor, setSpanColor] = useState(false);
  const [bookmarkExist, setBookmarkExist] = useState(false);

  const temp = comments.filter((f: any) =>
    (googEl.textRun && googEl.textRun.content.includes(f.quotedFileContent.value))
  ); 
  
  var styleOb = styleSection(googEl, true, spanColor, false);

  useEffect(() => {
    
    const tempBookmark = (activityBookmarks && activityBookmarks.length > 0) ? activityBookmarks.filter((f: any) => {
    // xreturn (googEl.textRun.tostring().normalize() === f.fragment.tostring().normalize())}
      return (googEl.textRun && (googEl.textRun.content.includes(f.fragment) || f.fragment === (googEl.textRun.content)))}
    ) : []; 
   
  
    styleOb = styleSection(googEl, true, spanColor, (tempBookmark.length > 0 ? true : false));
  }, [spanColor, activityBookmarks]);
  
  return temp.length > 0 ? (
    <Popover>
      <PopoverTrigger>
        <div key={`elem-${index}`} style={styleOb}>
          <span>{googEl.textRun.content}</span>
        </div>
      </PopoverTrigger>

      <PopoverContent bg="white" color="gray">
        <PopoverArrow bg="white" />

        <PopoverBody>
          <div>TESTING THIS OUT</div>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  ) : (
    <div 
      key={`elem-${index}`} 
      style={styleOb}
      onMouseOver={() => setSpanColor(true)}
      onMouseOut={() => setSpanColor(false)}
      onClick={()=> setFragSelected(googEl.textRun.content)}
      >
      <span
      >{googEl.textRun.content}</span>
    </div>
  );
};

const GoogDriveParagraph = (parProps: any) => {
  const { parData, index, comments, setFragSelected, activityBookmarks } = parProps;

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
          {content.elements[0].textRun ? content.elements[0].textRun.content : ""}
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
           {content.elements[0].textRun ? content.elements[0].textRun.content : ""}
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
           {content.elements[0].textRun ? content.elements[0].textRun.content : ""}
        </span>
      );
  };
  console.log('paragraphData', parData);
  return parData.paragraph.paragraphStyle.namedStyleType.includes('HEADING') ? (
    <div>{getHeading(parData.paragraph.paragraphStyle, parData.paragraph)}</div>
  ) : (
    <div key={`sections-${index}`}>
      {parData.paragraph.elements &&
        parData.paragraph.elements.map((elem: any, j: number) => (
          <React.Fragment key={`span-${j}`}>
            {elem.textRun ? (
              <GoogDriveSpans googEl={elem} index={j} comments={comments} setFragSelected={setFragSelected} activityBookmarks={activityBookmarks}/>
            ) : (
              <GoogInline sectionData={elem} />
            )}
          </React.Fragment>
        ))}
    </div>
  );
};

export default GoogDriveParagraph;
