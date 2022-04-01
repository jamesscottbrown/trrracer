import path from 'path';
import React, { useState } from 'react';
import { ipcRenderer } from 'electron';

import {
  Box,
  FormControl,
  FormLabel,
  Heading,
  SimpleGrid,
  Divider,
} from '@chakra-ui/react';

import { FaExternalLinkAlt, FaEye, FaEyeSlash } from 'react-icons/fa';

import { useProjectState } from './ProjectContext';
import { EntryType, ProjectViewProps } from './types';
import TagList from './TagList';

import AttachmentPreview from './AttachmentPreview';

const ProjectGridView = (ProjectPropValues: ProjectViewProps) => {
  const { projectData, folderPath } = ProjectPropValues;

  const [{ filterTags }] = useProjectState();
  const [numColumns, setNumColumns] = useState<number>(4);

  const [showTags, setShowTags] = useState(false);

  const filteredEntries = projectData.entries.filter((entryData: EntryType) => {
    return filterTags.every((requiredTag: string) =>
      entryData.tags.includes(requiredTag)
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
      <ConceptNav
        concepts={projectData.concepts}
        searchConcept={searchConcept}
      />
      <br />
      <Divider />
      {showTags ? (
        <div>
          <Heading as="h5" size="lg">
            Tags{' '}
            <FaEyeSlash
              onClick={() => {
                if (showTags) {
                  setShowTags(false);
                } else {
                  setShowTags(true);
                }
              }}
              style={{ display: 'inline' }}
            />
          </Heading>
          <TagList tags={projectData.tags} />
        </div>
      ) : (
        <div>
          <Heading as="h5">
            Tags{' '}
            <FaEye
              onClick={() => {
                if (showTags) {
                  setShowTags(false);
                } else {
                  setShowTags(true);
                }
              }}
              style={{ display: 'inline' }}
            />
          </Heading>
        </div>
      )}

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
        {files.map((f, i) => (
          <Box key={`${f.title}-${i}`}>
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
