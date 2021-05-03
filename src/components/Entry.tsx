import React, { useState } from 'react';
import PropTypes from 'prop-types';

import EdiText from 'react-editext';
import ReactMde from 'react-mde';
import { FaExternalLinkAlt } from 'react-icons/fa';

import * as Showdown from 'showdown';
import path from 'path';
import { copyFileSync } from 'fs';
import FileUpload from './FileUpload';

const Entry = ({
  entryData,
  entryIndex,
  openFile,
  updateEntryField,
  folderPath,
}) => {
  const [value, setValue] = useState(entryData.description);
  const [showDescription, setShowDescription] = useState(
    !!entryData.description
  );

  const [selectedTab, setSelectedTab] = React.useState<'write' | 'preview'>(
    'preview'
  );

  const [showFileUpload, setShowFileUpload] = useState(false);

  const saveFiles = (fileList) => {
    console.log(fileList);

    let newFiles = entryData.files;
    for (const file of fileList) {
      try {
        const destination = path.join(folderPath, file.name);
        copyFileSync(file.path, destination);
        console.log(`${file.path} was copied to ${destination}`);
        newFiles = [...newFiles, { title: file.name }];
      } catch (e) {
        console.log('Error', e.stack);
        console.log('Error', e.name);
        console.log('Error', e.message);

        console.log('The file could not be copied');
      }
    }

    updateEntryField(entryIndex, 'files', newFiles);
    setShowFileUpload(false);
  };

  const handleChangeTab = (newTab) => {
    if (newTab === 'preview') {
      updateEntryField(entryIndex, 'description', value);
    }
    setSelectedTab(newTab);
  };

  const enableDescription = () => {
    setShowDescription(true);
    setSelectedTab('write');
  };

  const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,
  });

  return (
    <>
      <h3>
        <EdiText
          type="text"
          value={entryData.title}
          onSave={(val) => updateEntryField(entryIndex, 'description', val)}
          editOnViewClick
          submitOnUnfocus
        />
      </h3>

      {showDescription ? (
        <div className="markdownEditorContainer">
          <ReactMde
            value={value}
            onChange={setValue}
            selectedTab={selectedTab}
            onTabChange={handleChangeTab}
            generateMarkdownPreview={(markdown) =>
              Promise.resolve(converter.makeHtml(markdown))
            }
          />
        </div>
      ) : (
        <button onClick={() => enableDescription()} type="button">
          Add description
        </button>
      )}

      <ul>
        {entryData.files.map((file) => (
          <li key={file.title}>
            {file.title}{' '}
            <FaExternalLinkAlt
              onClick={() => openFile(file.title)}
              title="Open file externally"
              size="12px"
            />
          </li>
        ))}
      </ul>

      {showFileUpload ? (
        <>
          <FileUpload
            saveFiles={saveFiles}
            containerStyle={{}}
            msg={
              <>
                Drag and drop some files here, or <b>click to select files</b>,
                to add to this entry.
              </>
            }
          />
          <button onClick={() => setShowFileUpload(false)} type="button">
            Cancel
          </button>
        </>
      ) : (
        <button onClick={() => setShowFileUpload(true)} type="button">
          Add files
        </button>
      )}

      <hr />
    </>
  );
};

Entry.propTypes = {
  entryData: PropTypes.shape({
    title: PropTypes.string,
    files: PropTypes.arrayOf(
      PropTypes.shape({ title: PropTypes.string.isRequired })
    ),
    description: PropTypes.string.isRequired,
  }).isRequired,
  entryIndex: PropTypes.number.isRequired,
  openFile: PropTypes.func.isRequired,
  updateEntryField: PropTypes.func.isRequired,
  folderPath: PropTypes.string.isRequired,
};

export default Entry;
