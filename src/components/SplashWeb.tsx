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

// const { ipcRenderer } = require('electron');

const projectChoices = [
    {name: 'Evo Bio', data: 'evobio'},
    {name: 'tRRRacer meta', data: 'jen'},
    // {name: 'Derya', data: 'derya'}
]

const SplashWeb = (props: any) => {
  const { setPath, isDev } = props;

  return (
    <Container>
      <Heading as="h1">Welcome to Trracer!</Heading>
      <div
        style={{
          width:'400px',
          margin:'auto',
          backgroundColor:'#d3d3d3',
          padding:'10px'
        }}
      > 
        <p>Open a project :</p>
        <>  
          <UnorderedList>{
            projectChoices.map((pc, i) => (
                <ListItem>
                  <IconButton
                    icon={<BiLinkExternal />}
                    aria-label="Open project"
                    onClick={() => {
                    document.cookie = `folderName=${pc.data}`//'dark_mode=true'
                    setPath(
                    `${
                        isDev ? 'http://localhost:9999' : '.'
                    }/.netlify/functions/download-gdrive-file/?folderName=${pc.data}&fileName=`
                    );
                }}
              />{' '}
          {pc.name}{' '}</ListItem>
    ))}
  </UnorderedList>
</></div>
     

    </Container>
  );
};

export default SplashWeb;
