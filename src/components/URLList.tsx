import React, { useState } from 'react';
import Modal from 'react-modal';

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
      <Modal
        isOpen={addingURL}
        onRequestClose={() => setAddingUrl(false)}
        style={customStyles}
      >
        <h1>Attach URL</h1>

        <label htmlFor="url">
          URL:
          <input
            id="url"
            value={additionURL}
            onChange={(ev) => setAdditionURL(ev.target.value)}
          />
        </label>

        <br />

        <label htmlFor="title">
          Title:
          <input
            id="title"
            value={additionTitle}
            onChange={(ev) => setAdditionTitle(ev.target.value)}
          />
        </label>

        <br />

        <button disabled={!additionURL} onClick={attachURL} type="button">
          Add
        </button>

        <button onClick={() => setAddingUrl(false)} type="button">
          Cancel
        </button>
      </Modal>
    );
  }

  return (
    <>
      {urls.length > 0 ? (
        <>
          <h3>URLs</h3>
          <ul>
            {urls.map((url) => (
              <li key={url.url}>
                <a href={url.url}>{url.title}</a>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <button onClick={() => setAddingUrl(true)} type="button">
        Attach URL
      </button>
    </>
  );
};

export default URLList;
