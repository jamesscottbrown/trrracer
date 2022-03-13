import React from 'react';

const Span = (props) => {
  const { data, spanType } = props;

  const colorConvert = (codes: Object) => {
    return `rgb(${255 * codes.red},${255 * codes.green},${255 * codes.blue})`;
  };

  const formatText = (blob) => {
    if (spanType === 'comment') {
      return `${blob['quotedFileContent']['value']}`;
    } else {
      return blob['em']['content'];
    }
  };

  const formatEmphasis = (blob) => {
    let blobOb = { margin: '4px', display: 'block' };
    if (spanType === 'comment') {
      console.log('ITS A COMMENT');
      blobOb['fontWeight'] = 'bold';
      blobOb['backgroundColor'] = 'yellow';
    } else {
      if (blob['em']['textStyle'].bold === true) blobOb['fontWeight'] = 'bold';
      if (blob['em']['textStyle'].italic === true)
        blobOb['fontStyle'] = 'italic';
      if (blob['em']['textStyle'].magnitude > 8)
        blobOb['fontSize'] = `${['em']['textStyle'].magnitude}px`;
      if (blob['em']['textStyle'].backgroundColor)
        blobOb['backgroundColor'] = 'azure';
      if (blob['em']['textStyle'].foregroundColor)
        blobOb['color'] = colorConvert(
          blob['em']['textStyle'].foregroundColor.color.rgbColor
        );
    }
    return blobOb;
  };

  return <span style={formatEmphasis(data)}>{formatText(data)}</span>;
};

export default Span;
