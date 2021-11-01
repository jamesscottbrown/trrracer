import React, { useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  ListItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  UnorderedList,
} from '@chakra-ui/react';

import { FaPlus } from 'react-icons/fa';

import { URLAttachment } from './types';
import { useProjectState } from './ProjectContext';

interface URLListProps {
  urls: URLAttachment[];
  entryIndex: number;
}

const URLList = (props: URLListProps) => {
  const { urls, entryIndex } = props;
  const [, dispatch] = useProjectState();

  const [addingURL, setAddingUrl] = useState<boolean>();
  const [additionTitle, setAdditionTitle] = useState<string>('');
  const [additionURL, setAdditionURL] = useState<string>('');

  const attachURL = () => {
    dispatch({
      type: 'ADD_URL',
      url: additionURL,
      title: additionTitle,
      entryIndex,
    });
    setAddingUrl(false);
    setAdditionURL('');
    setAdditionTitle('');
  };

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',

      width: 'max-content',
      height: 'max-content',
    },
  };

  if (addingURL) {
    return (
      <Modal isOpen={addingURL} onClose={() => setAddingUrl(false)}>
        <ModalOverlay />

        <ModalContent>
          <ModalHeader>Attach URL</ModalHeader>

          <ModalCloseButton />

          <ModalBody>
            <FormControl>
              <FormLabel>URL:</FormLabel>
              <Input
                id="url"
                value={additionURL}
                onChange={(ev) => setAdditionURL(ev.target.value)}
              />
            </FormControl>

            <br />

            <FormControl>
              <FormLabel>Title:</FormLabel>
              <Input
                id="title"
                value={additionTitle}
                onChange={(ev) => setAdditionTitle(ev.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              onClick={() => setAddingUrl(false)}
              type="button"
              colorScheme="gray"
            >
              Cancel
            </Button>

            <Button
              disabled={!additionURL}
              onClick={attachURL}
              type="button"
              colorScheme="blue"
            >
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <>
      {urls.length > 0 ? (
        <>
          <Heading as="h3">URLs</Heading>
          <UnorderedList>
            {urls.map((url) => (
              <ListItem key={url.url}>
                <a href={url.url}>{url.title}</a>
              </ListItem>
            ))}
          </UnorderedList>
        </>
      ) : null}
      <Button onClick={() => setAddingUrl(true)} type="button">
        <FaPlus /> Attach URL
      </Button>
    </>
  );
};

export default URLList;
