import React, { useEffect, useState } from 'react';
import {
  Button,
  Editable,
  EditableInput,
  EditablePreview,
  Heading,
  ListItem,
  UnorderedList,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

import DatePicker from 'react-datepicker';
import { timeFormat } from 'd3-time-format';
import ReactMde from 'react-mde';
import {
  FaExternalLinkAlt,
  FaEyeSlash,
  FaPlus,
  FaTrashAlt,
} from 'react-icons/fa';

import { WithContext as ReactTags } from 'react-tag-input';

import * as Showdown from 'showdown';

import FileUpload from './FileUpload';

import { EntryType, File, FileObj, TagType } from './types';
import { useProjectState } from './ProjectContext';
import URLList from './URLList';

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

  const formatTime = timeFormat('%Y-%m-%d');
  const updateDate = (newDate: Date) => {
    updateEntryField(entryIndex, 'date', formatTime(newDate));
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
  makeNonEditable: () => void;
}

interface ReactTag {
  id: string;
  text: string;
}

const Entry = (props: EntryPropTypes) => {
  const {
    entryData,
    entryIndex,
    openFile,
    updateEntryField,
    allTags,
    makeNonEditable,
  } = props;
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

  const deleteFile = (file: File) => {
    dispatch({ type: 'DELETE_FILE', entryIndex, fileName: file.title });
  };

  const handleChangeTab = (newTab: 'write' | 'preview') => {
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

  const urls = entryData.files.filter((f) => f.fileType === 'url');
  const files = entryData.files.filter((f) => f.fileType !== 'url');

  return (
    <div style={{ margin: 'auto' }}>
      <br />
      <Heading as="h3">
        <Editable
          defaultValue={entryData.title}
          onSubmit={(val) => updateEntryField(entryIndex, 'title', val)}
        >
          <EditablePreview />
          <EditableInput />
        </Editable>
        <Button onClick={makeNonEditable} type="button">
          <FaEyeSlash /> Hide edit controls
        </Button>
      </Heading>

      <EditDate
        date={entryData.date}
        entryIndex={entryIndex}
        updateEntryField={updateEntryField}
      />
      <br />

      <ReactTags
        tags={entryData.tags.map((t) => ({ id: t, text: t }))}
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

      <Button
        colorScheme="red"
        leftIcon={<DeleteIcon />}
        onClick={() => dispatch({ type: 'DELETE_ENTRY', entryIndex })}
      >
        Delete Entry
      </Button>
      <br />

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

          {value !== entryData.description && (
            <>
              <b style={{ color: 'red' }}>
                You have made unsaved changes to this field. These will be lost
                if you switch to editing a different field.
              </b>
              <Button
                onClick={() =>
                  updateEntryField(entryIndex, 'description', value)
                }
              >
                Save
              </Button>
            </>
          )}
        </div>
      ) : (
        <Button onClick={() => enableDescription()} type="button">
          <FaPlus /> Add description
        </Button>
      )}

      <UnorderedList>
        {files.map((file: File) => (
          <ListItem key={file.title}>
            {file.title}{' '}
            <FaExternalLinkAlt
              onClick={() => openFile(file.title)}
              title="Open file externally"
              size="12px"
              style={{ display: 'inline' }}
            />{' '}
            <FaTrashAlt
              onClick={() => deleteFile(file)}
              title="Unattahch or delete File"
              size="12px"
              style={{ display: 'inline' }}
            />
          </ListItem>
        ))}
      </UnorderedList>

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
          <Button onClick={() => setShowFileUpload(false)} type="button">
            Cancel
          </Button>
        </>
      ) : (
        <Button onClick={() => setShowFileUpload(true)} type="button">
          <FaPlus /> Add files
        </Button>
      )}

      <br />

      <URLList urls={urls} entryIndex={entryIndex} />
      <></>
    </div>
  );
};

export default Entry;
