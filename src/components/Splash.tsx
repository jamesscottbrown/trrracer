import React from 'react';
import {
  Button,
  ButtonGroup,
  Container,
  Heading,
  UnorderedList,
  IconButton,
  ListItem,
} from '@chakra-ui/react';

import { BiLinkExternal } from 'react-icons/bi';
import { FaFolderOpen, FaPlus } from 'react-icons/fa';

const { ipcRenderer } = require('electron');

interface SplashProps {
  recentPaths: string[];
}

const Splash = (props: SplashProps) => {
  const { recentPaths } = props;

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100vh' }}>
      <Container style={{ marginLeft: 'auto', marginRight: 'auto' }}>
        <Heading as='h1'>Welcome to Trracer!</Heading>
        <p>Open a project or create a new project to get started.</p>

        <br />

        {recentPaths.length === 0 ? (
          <p>No recently opened paths</p>
        ) : (
          <>
            <Heading as='h2'>Recently opened projects</Heading>
            <UnorderedList>
              {recentPaths.map((p: string) => (
                <ListItem key={p}>
                  <IconButton
                    icon={<BiLinkExternal />}
                    aria-label='Open project'
                    onClick={() => ipcRenderer.send('openProject', p)}
                  />{' '}
                  {p}{' '}
                </ListItem>
              ))}
            </UnorderedList>
          </>
        )}

        <ButtonGroup paddingTop='1em'>
          <Button type='button' onClick={() => ipcRenderer.send('newProject')}>
            <FaPlus /> New project
          </Button>
          <Button type='button' onClick={() => ipcRenderer.send('openProject')}>
            <FaFolderOpen /> Open project
          </Button>
        </ButtonGroup>
      </Container>
    </div>
  );
};

export default Splash;
