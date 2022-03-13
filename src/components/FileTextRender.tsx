import React, { useState } from 'react';

import { Badge, Box, Tooltip } from '@chakra-ui/react';

import PopComment from './PopComment';

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
        <Badge
          style={{ margin: '3px' }}
          onMouseOut={() => setIsOpen(false)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {badgeText}
        </Badge>
      </Tooltip>
    );
  }
  return (
    <Badge style={{ margin: '3px' }} onMouseOver={() => setIsOpen(true)}>
      {badgeText}
    </Badge>
  );
};

const FileTextRender = (fileDataProps: any) => {
  const { fileData, keywordArray } = fileDataProps;
  const formatConcord = (tf: any) => {
    const { matches } = tf;

    if (matches && matches.length > 0) {
      return matches.map((m: any) => {
        const arr = m.split(tf.key);

        return (
          <p>
            <span>
              {`${arr[0]} `}
              <b>{tf.key}</b>
              {` ${arr[1]}`}
            </span>
            <br />
            <br />
          </p>
        );
      });
    }
    console.log('not there');
    return (
      <p>
        <span>
          no matches for <b>{tf.key}</b>
        </span>
      </p>
    );
  };
  return (
    <>
      {fileData.fileType === 'gdoc' ? (
        <Box>
          {fileData.emphasized ? (
            <Box>
              {fileData.emphasized.map((em: any, i: number) => (
                <PopComment
                  key={`em-${fileData.title}-${i}`}
                  data={em}
                  spanType="emphasize"
                />
              ))}
            </Box>
          ) : (
            <Box />
          )}
          {fileData.comments && fileData.comments.comments.length > 0 ? (
            fileData.comments.comments.map((co: any, i: number) => (
              <PopComment
                key={`co-${fileData.title}-${i}`}
                data={co}
                spanType="comment"
              />
            ))
          ) : (
            <Box />
          )}
        </Box>
      ) : (
        <Box>
          {keywordArray.filter(
            (k: any) => k['file-title'] === fileData.title
          )[0] ? (
            keywordArray
              .filter((k: any) => k['file-title'] === fileData.title)[0]
              .keywords.keywords.map((m: any) => (
                <div style={{ display: 'inline' }}>
                  <Tooltip placement="left" hasArrow label={formatConcord(m)}>
                    <Badge style={{ margin: '3px' }}>{m.key}</Badge>
                  </Tooltip>
                </div>
              ))
          ) : (
            <div />
          )}
        </Box>
      )}
    </>
  );
};

export default FileTextRender;
