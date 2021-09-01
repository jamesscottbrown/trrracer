import React from 'react';

import { Heading, ListItem, Tag, UnorderedList } from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';

import { FaExternalLinkAlt } from 'react-icons/fa';
import { format } from 'date-fns';

import { File, EntryType } from './types';

interface EntryPropTypes {
  entryData: EntryType;
  openFile: (a: string) => void;
  makeEditable: () => void;
}

const ReadonlyEntry = (props: EntryPropTypes) => {
  const { entryData, openFile, makeEditable } = props;

  return (
    <>
      <Heading as="h2">
        {entryData.title}{' '}
        <EditIcon
          onClick={makeEditable}
          title="Click to show controls for editing this entry"
        />
      </Heading>
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
      <p>
        Tags:{' '}
        {entryData.tags.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </p>
      <p>{entryData.description}</p>
      <UnorderedList>
        {entryData.files.map((file: File) => (
          <ListItem key={file.title}>
            {file.title}{' '}
            <FaExternalLinkAlt
              onClick={() => openFile(file.title)}
              title="Open file externally"
              size="12px"
            />{' '}
          </ListItem>
        ))}
      </UnorderedList>

      {entryData.urls.length > 0 && (
        <>
          <Heading as="h3">URLs</Heading>
          <UnorderedList>
            {entryData.urls.map((url) => (
              <ListItem key={url.url}>
                <a href={url.url}>{url.title}</a>
              </ListItem>
            ))}
          </UnorderedList>
        </>
      )}
    </>
  );
};

export default ReadonlyEntry;
