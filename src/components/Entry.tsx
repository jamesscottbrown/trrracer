import React, { useState } from 'react';
import EdiText from 'react-editext';
import ReactMde from 'react-mde';
import { FaExternalLinkAlt } from 'react-icons/fa';

import * as Showdown from 'showdown';

export const Entry = ({
  entryData,
  entryIndex,
  openFile,
  updateEntryField,
}) => {
  const [value, setValue] = useState(entryData.description);
  const [showDescription, setShowDescription] = useState(
    !!entryData.description
  );

  const [selectedTab, setSelectedTab] = React.useState<'write' | 'preview'>(
    'preview'
  );

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
        <button onClick={() => enableDescription()}>Add description</button>
      )}

      <ul>
        {entryData.files.map((file) => (
          <li>
            {file.title}{' '}
            <FaExternalLinkAlt
              onClick={() => openFile(file.title)}
              title="Open file externally"
              size="12px"
            />
          </li>
        ))}
      </ul>

      <hr />
    </>
  );
};
