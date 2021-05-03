/* eslint no-console: off */

import { useDropzone } from 'react-dropzone';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

const FileUpload = ({ containerStyle, saveFiles, msg }) => {
  const baseStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '5px',
    paddingLeft: '10px',
    paddingRight: '10px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: 'black',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: 'black',
    outline: 'none',
    transition: 'border .24s ease-in-out',
    lineHeight: '1.5em',
  };

  const activeStyle = {
    borderColor: '#2196f3',
  };

  const acceptStyle = {
    borderColor: '#00e676',
  };

  const rejectStyle = {
    borderColor: '#ff1744',
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    // accept: '.pdf,.doc,.docx',
    onDropAccepted: (files) => {
      saveFiles(files);
    },
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [
      isDragActive,
      isDragReject,
      isDragAccept,
      acceptStyle,
      activeStyle,
      baseStyle,
      rejectStyle,
    ]
  );

  return (
    <section className="container" style={{ ...containerStyle }}>
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />

        <p>{msg}</p>
      </div>
    </section>
  );
};

FileUpload.propTypes = {
  containerStyle: PropTypes.object,
  saveFiles: PropTypes.func,
  msg: PropTypes.object,
};
export default FileUpload;
