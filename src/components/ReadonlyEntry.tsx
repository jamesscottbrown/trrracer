import React from 'react';
import reactDOMServer from 'react-dom/server';

import {
  Button,
  Heading,
  ListItem,
  Tag,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { FaExternalLinkAlt } from 'react-icons/fa';

import { format } from 'date-fns';

import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
// import 'highlight.js/styles/default.css';

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

  const formatter = MarkdownIt({
    html: true,
    highlight(str: string, lang: string) {
      if (lang === 'trrrace') {
        const [header, ...rest] = str.split('\n');
        const tags = header.split(',').map((t) => t.trim());
        const tagHTML = tags.map((t) =>
          reactDOMServer.renderToString(
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
          )
        );

        const body = formatter.render(rest.join('\n'));

        return `<div style='border-left: 2px solid var(--chakra-colors-blue-200); padding-left: 5px;'<p>Tags: ${tagHTML.join(
          ' '
        )}</p> ${body}</div>`;
      }
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value;
        } catch (__) {
          console.error('SYNTAX HIGLIGHTING FAIL!');
        }
      }

      return ''; // use external default escaping
    },
  });

  return (
    <>
      <Heading as="h2">
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
            __html: formatter.render(entryData.description),
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
