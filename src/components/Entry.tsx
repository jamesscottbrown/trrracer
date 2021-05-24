import React, { useEffect, useState } from 'react';

import DatePicker from 'react-datepicker';
import EdiText from 'react-editext';
import ReactMde from 'react-mde';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { WithContext as ReactTags } from 'react-tag-input';

import * as Showdown from 'showdown';

import FileUpload from './FileUpload';

import { File, FileObj, EntryType, TagType } from './types';
import { useProjectState } from './ProjectContext';

interface EditDateTypes {
  date: string;
  entryIndex: number;
  updateEntryField: (
    entryIndex: number,
    fieldName: string,
    newData: any
  ) => void;
}

const EditDate = (props: EditDateTypes) => {
  const { date, entryIndex, updateEntryField } = props;

  const updateDate = (newDate: Date) => {
    // if in GMT, the time will be returned in UTC, so will be 11pm of the day before
    newDate.setHours(newDate.getHours() + 1);

    updateEntryField(
      entryIndex,
      'date',
      newDate.toISOString().substring(0, 10)
    );
  };

  return (
    <DatePicker
      selected={new Date(date)}
      onChange={updateDate}
      dateFormat="dd MMMM yyyy"
      maxDate={new Date()}
    />
  );
};

interface EntryPropTypes {
  entryData: EntryType;
  entryIndex: number;
  openFile: (a: string) => void;
  updateEntryField: (
    entryIndex: number,
    fieldName: string,
    newData: any
  ) => void;
  allTags: TagType[];
}

interface ReactTag {
  id: string;
  text: string;
}

const Entry = (props: EntryPropTypes) => {
  const { entryData, entryIndex, openFile, updateEntryField, allTags } = props;
  const [, dispatch] = useProjectState();

  const [value, setValue] = useState(entryData.description);
  const [showDescription, setShowDescription] = useState(
    !!entryData.description
  );

  // Update description details when entryData changes.
  // This happens on timeline view, when user selects different entry to view in detail panel
  useEffect(() => {
    setShowDescription(!!entryData.description);
    setValue(entryData.description);
  }, [entryData]);

  const [selectedTab, setSelectedTab] =
    React.useState<'write' | 'preview'>('preview');

  const [showFileUpload, setShowFileUpload] = useState(false);

  const saveFiles = (fileList: FileObj[]) => {
    dispatch({ type: 'ADD_FILES_TO_ENTRY', fileList, entryIndex });
    setShowFileUpload(false);
  };

  const handleChangeTab = (newTab: 'write' | 'preview') => {
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

  const KeyCodes = {
    comma: 188,
    enter: 13,
  };

  return (
    <>
      <h3>
        <EdiText
          type="text"
          value={entryData.title}
          onSave={(val) => updateEntryField(entryIndex, 'title', val)}
          editOnViewClick
          submitOnUnfocus
        />
      </h3>

      <EditDate
        date={entryData.date}
        entryIndex={entryIndex}
        updateEntryField={updateEntryField}
      />
      <br />

      <ReactTags
        tags={entryData.tags}
        suggestions={allTags.map((t) => ({ id: t.title, text: t.title }))}
        delimiters={[KeyCodes.comma, KeyCodes.enter]}
        handleDelete={(i: number) =>
          updateEntryField(
            entryIndex,
            'tags',
            entryData.tags.filter((_tag, index) => index !== i)
          )
        }
        handleAddition={(tag: ReactTag) => {
          dispatch({ type: 'ADD_TAG_TO_ENTRY', newTag: tag, entryIndex });
        }}
      />

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
        {entryData.files.map((file: File) => (
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
    </>
  );
};

export default Entry;
