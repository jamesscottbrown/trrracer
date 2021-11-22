import React from 'react';

import {
  Button,
  Heading,
  ListItem,
  Tag,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { FaExternalLinkAlt, FaLock } from 'react-icons/fa';

import { format } from 'date-fns';
import * as Showdown from 'showdown';

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

  const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,
  });

  return (
    <>
      <Heading as="h2">
        {entryData.isPrivate && (
          <FaLock
            title="This entry is private, and will be hidden when the Trrrace is exported."
            size="0.75em"
            style={{ display: 'inline', fill: 'lightgrey' }}
          />
        )}
        {entryData.title}{' '}
        <Button leftIcon={<EditIcon />} onClick={makeEditable}>
          Edit entry
        </Button>
      </Heading>
      <Text fontSize="lg" fontWeight="bold">
        {format(new Date(entryData.date), 'dd MMMM yyyy')}
      </Text>
      <p>
        {entryData.tags.length === 0 ? (
          <b>No tags.</b>
        ) : (
          <>
            {entryData.tags.map((t) => (
              <Tag
                key={t}
                borderColor={getColor(t)}
                borderWidth="5px"
                backgroundColor={getColor(t)}
                color={textColor(getColor(t))}
                marginRight="0.25em"
              >
                {t}
              </Tag>
            ))}
          </>
        )}
      </p>

      <br />

      {entryData.description && (
        <div
          className="readonlyEntryMarkdownPreview"
          dangerouslySetInnerHTML={{
            __html: converter.makeHtml(entryData.description),
          }}
        />
      )}

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
