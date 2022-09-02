import React from 'react';
import {
  Container,
  Heading,
  UnorderedList,
  IconButton,
  ListItem,
} from '@chakra-ui/react';

import { BiLinkExternal } from 'react-icons/bi';

// const { ipcRenderer } = require('electron');

const projectChoices = [
  { name: 'Evo Bio', data: 'evobio' },
  { name: 'tRRRacer meta', data: 'jen' },
  // {name: 'Derya', data: 'derya'}
];

type SplashWebPropType = {
  setPath: React.Dispatch<React.SetStateAction<string>>;
  isDev: boolean;
};

const SplashWeb = (props: SplashWebPropType) => {
  const { setPath, isDev } = props;

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100vh' }}>
      <Container style={{ marginLeft: 'auto', marginRight: 'auto' }}>
        <Heading as='h1'>Welcome to Trracer!</Heading>
        <div
          style={{
            width: '400px',
            margin: 'auto',
            backgroundColor: '#d3d3d3',
            padding: '10px'
          }}
        >
          <p>Open a project :</p>
          <>
            <UnorderedList>
              {projectChoices.map((pc) => (
                <ListItem>
                  <IconButton
                    icon={<BiLinkExternal />}
                    aria-label='Open project'
                    onClick={() => {
                      document.cookie = `folderName=${pc.data}`; //'dark_mode=true'
                      setPath(
                        `${
                          isDev ? 'http://localhost:9999' : '.'
                        }/.netlify/functions/download-gdrive-file/?folderName=${
                          pc.data
                        }&fileName=`
                      );
                    }}
                  />{' '}
                  {pc.name}{' '}
                </ListItem>
              ))}
            </UnorderedList>
          </>
        </div>
      </Container>
    </div>
  );
};

export default SplashWeb;
