/* eslint no-console: off */
import { useDropzone } from 'react-dropzone';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { FileObj } from './types';

const smalltalk = require('smalltalk');

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
  lineHeight: '1.2em',
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

interface FileUploadProps {
  containerStyle: Record<string, unknown>;
  saveFiles: (fileList: FileObj[]) => void;
  msg: JSX.Element;
}

const FileUpload = (props: FileUploadProps) => {
  const { containerStyle, saveFiles, msg } = props;
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDragOver: (event) => {
      // Without this function the drop event would fail to fire (but only sometimes)
      // Solution from https://stackoverflow.com/a/50233827
      event.stopPropagation();
      event.preventDefault();
    },
    // accept: '.pdf,.doc,.docx',
    onDropAccepted: (files: File[]) => {
      console.log('dropAccepted', files[0].name);

      smalltalk
        .prompt('Artifact Type', 'What kind of artifact is this?', 'notes')
        .then((value: string) => {
          const newFiles = files.map((m) => {
           
            m.artifactType = value;
            return m//{ ...m, artifactType: value }
          });
          saveFiles(newFiles);
        })
        .catch(() => {
          console.log('cancel');
        });

      // saveFiles(files);
    },
  });

  const style = useMemo<Record<string, unknown>>(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept]
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
  // eslint-disable-next-line react/forbid-prop-types
  containerStyle: PropTypes.object.isRequired,
  saveFiles: PropTypes.func.isRequired,
  msg: PropTypes.node.isRequired,
};
export default FileUpload;
