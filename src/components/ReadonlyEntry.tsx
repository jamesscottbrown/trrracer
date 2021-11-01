import React from 'react';

import { FaExternalLinkAlt, FaPencilAlt } from 'react-icons/fa';
import { format } from 'date-fns';

import { File, EntryType } from './types';

interface EntryPropTypes {
  entryData: EntryType;
  openFile: (a: string) => void;
  makeEditable: () => void;
}

const ReadonlyEntry = (props: EntryPropTypes) => {
  const { entryData, openFile, makeEditable } = props;

  const urls = entryData.files.filter((f) => f.fileType === 'url');
  const files = entryData.files.filter((f) => f.fileType !== 'url');

  return (
    <>
      <h3>
        {entryData.title}{' '}
        <FaPencilAlt
          onClick={makeEditable}
          title="Click to show controls for editing this entry"
        />
      </h3>
      <p
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          width: 'max-content',
        }}
      >
        {format(new Date(entryData.date), 'dd MMMM yyyy')}
      </p>
      <br />
      <p>Tags: {entryData.tags.join(', ')}</p>
      <p>{entryData.description}</p>
      <ul>
        {files.map((file: File) => (
          <li key={file.title}>
            {file.title}{' '}
            <FaExternalLinkAlt
              onClick={() => openFile(file.title)}
              title="Open file externally"
              size="12px"
            />{' '}
          </li>
        ))}
      </ul>

      {urls.length > 0 && (
        <>
          <h3>URLs</h3>
          <ul>
            {urls.map((url) => (
              <li key={url.url}>
                <a href={url.url}>{url.title}</a>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
};

export default ReadonlyEntry;
