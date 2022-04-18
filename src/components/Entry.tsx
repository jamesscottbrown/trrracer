import React, { useEffect, useState } from 'react';
import {
  Button,
  Editable,
  EditableInput,
  EditablePreview,
  Heading,
  ListItem,
  UnorderedList,
  Flex,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import DatePicker from 'react-datepicker';
import ReactMde from 'react-mde';
import {
  FaExternalLinkAlt,
  FaLock,
  FaLockOpen,
  FaPlus,
  FaTrashAlt,
} from 'react-icons/fa';
import { WithContext as ReactTags } from 'react-tag-input';
import * as Showdown from 'showdown';
import FileUpload from './FileUpload';
import { EntryType, File, FileObj, TagType } from './types';
import { useProjectState } from './ProjectContext';
import GoogFileInit from './GoogleFileInit';
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
      style={{ cursor: 'pointer' }}
      selected={new Date(date)}
      onChange={updateDate}
      dateFormat="dd MMMM yyyy"
      maxDate={new Date()}
    />
  );
};

type FileContextProps = {
  file: File;
  entryIndex: number;
  fileIndex: number;
};

const FileContext = (props: FileContextProps) => {
  const { file, entryIndex, fileIndex } = props;

  const [, dispatch] = useProjectState();

  const contextFill = file.meta ? file.meta : file.context;

  const contextStarter =
    contextFill != 'null' ? contextFill : 'No context here yet.';

  const [context, setContext] = useState(contextStarter);

  const updateMeta = () => {
    dispatch({ type: 'FILE_META', entryIndex, fileIndex, context });
  };

  return (
    <Editable
      defaultValue={context === 'null' ? 'No context here yet.' : context}
    >
      <EditablePreview />
      <EditableInput />
      <Button onClick={() => updateMeta()}>Update Context</Button>
    </Editable>
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

  const [{}, dispatch] = useProjectState();

  //console.log('filterRT',filterRT)

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

  const [showFileUpload, setShowFileUpload] = useState(true);

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
      <Heading as="h4">
        <Editable
          defaultValue={entryData.title}
          onSubmit={(val) => updateEntryField(entryIndex, 'title', val)}
        >
          <EditablePreview />
          <EditableInput />
        </Editable>
        <Button
          style={{ display: 'inline' }}
          onClick={makeNonEditable}
          type="button"
        >
          Hide edit controls
        </Button>

        <Button
          style={{ marginLeft: 5 }}
          colorScheme="red"
          onClick={() =>
            updateEntryField(entryIndex, 'isPrivate', !entryData.isPrivate)
          }
        >
          {entryData.isPrivate ? (
            <FaLock title="Entry is currently private; click to make it public." />
          ) : (
            <FaLockOpen title="Entry is currently public; click to make it private." />
          )}
        </Button>

        <Button
          style={{ display: 'inline' }}
          colorScheme="red"
          leftIcon={<DeleteIcon />}
          onClick={() => dispatch({ type: 'DELETE_ENTRY', entryIndex })}
        >
          Delete Activity
        </Button>
      </Heading>
      <br />
      <Flex alignItems="center">
        <span style={{ fontWeight: 700 }}>{'Date Activity Happened: '}</span>
        <div
          style={{
            border: '1px solid gray',
            borderRadius: 5,
            padding: 5,
            cursor: 'pointer',
          }}
        >
          <EditDate
            date={entryData.date}
            entryIndex={entryIndex}
            updateEntryField={updateEntryField}
          />
        </div>
      </Flex>

      <br />
      <span style={{ fontSize: 18, fontWeight: 700, display: 'block' }}>
        {'Tags: '}
      </span>
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

      <br />
      <span style={{ fontSize: 18, fontWeight: 700, display: 'block' }}>
        {'Description: '}
      </span>
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

      <br />
      <div style={{ marginTop: 10 }}>
        <span style={{ fontSize: 18, fontWeight: 700 }}>{'Artifacts: '}</span>
        <br />
        <UnorderedList>
          {files.map((file: File, j: any) => (
            <ListItem key={file.title}>
              {file.title}{' '}
              <FaExternalLinkAlt
                onClick={() => {
                  openFile(file.title);
                }}
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
              <UnorderedList>
                <ListItem>
                  <FileContext
                    file={file}
                    entryIndex={entryIndex}
                    fileIndex={j}
                  />
                </ListItem>
              </UnorderedList>
            </ListItem>
          ))}
        </UnorderedList>
      </div>
      <br />
      <span style={{ fontSize: 18, fontWeight: 700 }}>
        {'Add more artifacts: '}
      </span>
      {showFileUpload ? (
        <>
          <Flex
            style={{
              borderColor: 'gray',
              borderRadius: 5,
              alignItems: 'center',
              justifyContent: 'left',
            }}
          >
            <FileUpload
              saveFiles={saveFiles}
              containerStyle={{ outerWidth: '100%' }}
              msg={
                <>
                  Drag and drop some files here, or <b>click to select files</b>
                  , to add to this entry.
                </>
              }
            />
            <Button onClick={() => setShowFileUpload(false)} type="button">
              Cancel
            </Button>
          </Flex>
        </>
      ) : (
        <Button onClick={() => setShowFileUpload(true)} type="button">
          <FaPlus /> Add files
        </Button>
      )}

      <GoogFileInit
        fileType="document"
        text="Create Google Doc"
        entryIndex={entryIndex}
      />

      <GoogFileInit
        fileType="spreadsheet"
        text="Create Google Sheet"
        entryIndex={entryIndex}
      />

      <br />

      <URLList urls={urls} entryIndex={entryIndex} />
      <></>
    </div>
  );
};

export default Entry;
