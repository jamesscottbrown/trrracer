import React from 'react';

import { Heading, ListItem, Tag, UnorderedList } from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';

import { FaExternalLinkAlt } from 'react-icons/fa';
import { format } from 'date-fns';

import { File, EntryType, TagType } from './types';
import textColor from '../colors';
import { useProjectState } from './ProjectContext';

interface EntryPropTypes {
  entryData: EntryType;
  openFile: (a: string) => void;
  makeEditable: () => void;
}

const ReadonlyEntry = (props: EntryPropTypes) => {
  const { entryData, openFile, makeEditable } = props;

  const urls = entryData.files.filter((f) => f.fileType === 'url');
  const files = entryData.files.filter((f) => f.fileType !== 'url');

  const [{ projectData }] = useProjectState();

  const getColor = (tagName: string) => {
    const matchingTags = projectData.tags.filter(
      (t: TagType) => t.title === tagName
    );
    if (matchingTags.length === 0) {
      return 'gray';
    }
    return matchingTags[0].color;
  };

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
          <Tag
            key={t}
            borderColor={getColor(t)}
            borderWidth="5px"
            backgroundColor={getColor(t)}
            color={textColor(getColor(t))}
            marginLeft="0.25em"
          >
            {t}
          </Tag>
        ))}
      </p>
      <p>{entryData.description}</p>

      <UnorderedList>
        {files.map((file: File) => (
          <ListItem key={file.title}>
            {file.title}{' '}
            <FaExternalLinkAlt
              onClick={() => openFile(file.title)}
              title="Open file externally"
              size="12px"
              style={{ display: 'inline' }}
            />{' '}
          </ListItem>
        ))}
      </UnorderedList>

      {urls.length > 0 && (
        <>
          <Heading as="h3" size="lg">
            URLs
          </Heading>
          <UnorderedList>
            {urls.map((url) => (
              <ListItem key={url.url}>
                <a href={url.url}>{url.title} </a>
                <FaExternalLinkAlt
                  title="Open URL in default web browser"
                  size="12px"
                  style={{ display: 'inline' }}
                />
              </ListItem>
            ))}
          </UnorderedList>
        </>
      )}
    </>
  );
};

export default ReadonlyEntry;
