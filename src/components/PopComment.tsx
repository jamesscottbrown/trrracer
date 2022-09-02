import {
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  Button,
} from '@chakra-ui/react';

import React, { useState } from 'react';
import { useProjectState } from './ProjectContext';

const colorConvert = (codes: Object) => {
  return `rgb(${255 * codes.red},${255 * codes.green},${255 * codes.blue})`;
};

const formatText = (blob, spanType) => {
  if (spanType === 'comment') {
    return blob.quotedFileContent ? `${blob.quotedFileContent.value}` : ' ';
  }
  return blob.em.content;
};

const formatContext = (blob, pos) => {
  if (blob.comment_context) {
    return pos === 'before' ? blob.comment_context[0] : blob.comment_context[1];
  }
  return '';
};

const renderPop = (blob, spanType, anonName) => {
  if (spanType === 'comment') {
    let starter = formatPopoverComment(blob, anonName);
    if (blob.replies.length > 0) {
      const rep = blob.replies.map((m) => formatPopoverComment(m, anonName));
      starter += `-----------------------------${rep}`;
    }
    return starter;
  }
  return formatPopoverEmText(blob);
};

const formatPopoverComment = (blob, anonName) => {
  return `${anonName(blob.author.displayName, 'initials')} (${anonName(
    blob.author.displayName,
    'role'
  )}): "${blob.content}"`;
};

const formatPopoverEmText = (blob) => {
  const blobIndex = blob['index-in'];
  // let before = (blobIndex > 1 && state.projectData.googleData[blob['google-id']].body.content[blobIndex - 1].paragraph) ? state.projectData.googleData[blob['google-id']].body.content[blobIndex - 1].paragraph.elements : " ";
  // let after = (state.projectData.googleData[blob['google-id']].body.content[blobIndex + 1] && state.projectData.googleData[blob['google-id']].body.content[blobIndex + 1].paragraph) ? state.projectData.googleData[blob['google-id']].body.content[blobIndex + 1].paragraph.elements : " ";
  // return `${before[0].textRun} .... ${after.at(-1).textRun}`
};

const formatEmphasis = (blob, spanType) => {
  const blobOb = { margin: '4px' };
  if (spanType === 'comment') {
    blobOb.fontWeight = 'bold';
    blobOb.backgroundColor = 'rgb(253,213,145)';
  } else {
    if (blob.em.textStyle.bold === true) blobOb.fontWeight = 'bold';

    if (blob.em.textStyle.backgroundColor)
      blobOb.backgroundColor = colorConvert(
        blob.em.textStyle.backgroundColor.color.rgbColor
      );
  }
  return blobOb;
};

const formatEmphasisVis = (blob, spanType) => {
  const blobOb = {
    margin: '2px',
    width: '5px',
    height: '50px',
    backgroundColor: 'gray',
    display: 'inline-block',
  };
  if (spanType === 'comment') {
    blobOb.fontWeight = 'bold';
    blobOb.backgroundColor = 'rgb(253,213,145)';
  } else {
    if (blob.em.textStyle.bold === true) blobOb.width = '10px';
    if (blob.em.textStyle.italic === true) blobOb.fontStyle = 'italic';

    if (blob.em.textStyle.backgroundColor) {
      blobOb.backgroundColor = colorConvert(
        blob.em.textStyle.backgroundColor.color.rgbColor
      );
      blobOb.borderColor = 'gray';
      blobOb.borderStyle = 'solid';
      blobOb.borderWidth = '1px';
    }
    if (blob.em.textStyle.foregroundColor) {
      blobOb.backgroundColor = colorConvert(
        blob.em.textStyle.foregroundColor.color.rgbColor
      );
      blobOb.borderColor = 'gray';
      blobOb.borderStyle = 'solid';
      blobOb.borderWidth = '1px';
    }
  }
  return blobOb;
};

const PopComment = (props) => {
  const [showPopover, setShowPopover] = useState(false);

  const closePopover = () => {
    setShowPopover(false);
  };

  const { data, spanType } = props;
  const [state] = useProjectState();

  const anonName = (name, type) => {
    const anon = state.projectData.roles[name];
    if (anon) {
      return anon[type];
    }
  };

  if (!showPopover) {
    return (
      <Box onMouseEnter={() => setShowPopover(true)}>
        {spanType === 'comment' ? (
          renderPop(data, spanType, anonName)
        ) : (
          <>
            <span>{formatContext(data, 'before')}</span>
            <span style={formatEmphasis(data, spanType)}>
              {formatText(data, spanType)}
            </span>
            <span>{formatContext(data, 'after')}</span>
          </>
        )}
      </Box>
    );
  }

  return (
    <Popover isOpen={showPopover} onClose={closePopover}>
      <PopoverTrigger>
        <div
          style={formatEmphasisVis(data, spanType)}
          onMouseLeave={() => setShowPopover(false)}
        />
      </PopoverTrigger>
      <PopoverContent bg="white" color="gray">
        <PopoverHeader fontWeight="semibold">{data.createdTime}</PopoverHeader>
        <PopoverArrow bg="white" />

        <PopoverBody>
          {spanType === 'comment' ? (
            <Box>{renderPop(data, spanType, anonName)}</Box>
          ) : (
            <Box>
              <span>{formatContext(data, 'before')}</span>
              <span style={formatEmphasis(data, spanType)}>
                {formatText(data, spanType)}
              </span>
              <span>{formatContext(data, 'after')}</span>
            </Box>
          )}
        </PopoverBody>
        <PopoverFooter>
          <Button>Go to Doc</Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};

export default PopComment;
