import path from 'path';
import React, { useState } from 'react';
import { ipcRenderer } from 'electron';

import {
  Box,
  FormControl,
  FormLabel,
  Heading,
  Image,
  SimpleGrid,
} from '@chakra-ui/react';

import { FaExternalLinkAlt } from 'react-icons/fa';
import { GrDocumentCsv, GrDocumentPpt, GrDocumentWord } from 'react-icons/gr';
import { ImFilePdf } from 'react-icons/im';

import { useProjectState } from './ProjectContext';
import { EntryType, ProjectViewProps } from './types';
import TagList from './TagList';

interface AttachmentPreviewPropsType {
  folderPath: string;
  title: string;
  openFile: (title: string) => void;
}

const AttachmentPreview = (props: AttachmentPreviewPropsType) => {
  const { folderPath, title, openFile } = props;

  if (
    title.endsWith('.mp4') ||
    title.endsWith('.mov') ||
    title.endsWith('.webm')
  ) {
    // We can't add a caption, as we have no knowledge of what the file is
    // eslint-disable-next-line jsx-a11y/media-has-caption
    return <video src={`file://${path.join(folderPath, title)}`} controls />;
  }

  if (title.endsWith('.mp3') || title.endsWith('.ogg')) {
    // We can't add a caption, as we have no knowledge of what the file is
    // eslint-disable-next-line jsx-a11y/media-has-caption
    return <audio src={`file://${path.join(folderPath, title)}`} controls />;
  }

  const size = '75%';

  if (title.endsWith('.csv')) {
    return <GrDocumentCsv onClick={() => openFile(title)} size={size} />;
  }

  if (title.endsWith('.ppt') || title.endsWith('.pptx')) {
    return <GrDocumentPpt onClick={() => openFile(title)} size={size} />;
  }

  if (title.endsWith('.doc') || title.endsWith('.docx')) {
    return <GrDocumentWord onClick={() => openFile(title)} size={size} />;
  }

  if (title.endsWith('.pdf')) {
    return <ImFilePdf onClick={() => openFile(title)} size={size} />;
  }
  return (
    <Image
      src={`file://${path.join(folderPath, title)}`}
      onClick={() => openFile(title)}
    />
  );
};

const ProjectGridView = (ProjectPropValues: ProjectViewProps) => {
  const { projectData, folderPath } = ProjectPropValues;

  const [{ filterTags }] = useProjectState();
  const [numColumns, setNumColumns] = useState<number>(4);

  const filteredEntries = projectData.entries.filter((entryData: EntryType) => {
    return filterTags.every(
      (requiredTag: string) =>
        entryData.tags.includes(requiredTag) ||
        entryData.quoteTags.includes(requiredTag)
    );
  });

  const files = filteredEntries
    .map((entry) => entry.files.filter((f) => f.fileType !== 'url'))
    .flat();

  const openFile = (fileName: string) => {
    console.log('Open file:', path.join(folderPath, fileName));
    ipcRenderer.send('open-file', path.join(folderPath, fileName));
  };

  return (
    <div style={{ padding: '10px' }}>
      <TagList tags={projectData.tags} />

      <Heading as="h2">Attachments</Heading>

      <FormControl>
        <FormLabel>Number of columns:</FormLabel>
        <input
          type="range"
          value={numColumns}
          min={1}
          max={20}
          onChange={(ev) => setNumColumns(+ev.target.value)}
        />
      </FormControl>

      <SimpleGrid columns={numColumns} spacing={10}>
        {files.map((f) => (
          <Box key={f.title}>
            <AttachmentPreview
              folderPath={folderPath}
              title={f.title}
              openFile={openFile}
            />
            {f.title}{' '}
            <FaExternalLinkAlt
              onClick={() => openFile(f.title)}
              title="Open file externally"
              size="12px"
              style={{ display: 'inline' }}
            />
          </Box>
        ))}
      </SimpleGrid>
    </div>
  );
};

export default ProjectGridView;
