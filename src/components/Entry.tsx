import React, { useEffect, useState, useMemo } from 'react';
import {
  Button,
  Editable,
  EditableInput,
  EditablePreview,
  ListItem,
  UnorderedList,
  Flex,
  Tooltip,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import DatePicker from 'react-datepicker';
import ReactMde from 'react-mde';
import { GiSewingString } from 'react-icons/gi';
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
import { File, FileObj, ResearchThread } from './types';
import URLList from './URLList';
import { useProjectState } from './ProjectContext';
import GoogFileInit from './GoogleFileInit';

interface EditDateTypes {
  date: string;
  updateEntryField: (fieldName: string, newData: any) => void;
}

const EditDate = (props: EditDateTypes) => {
  const { date, updateEntryField } = props;

  const updateDate = (newDate: Date) => {
    // if in GMT, the time will be returned in UTC, so will be 11pm of the day before
    newDate.setHours(newDate.getHours() + 1);

    updateEntryField('date', newDate.toISOString().substring(0, 10));
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
  dispatch: any;
};

const FileContext = (props: FileContextProps) => {
  const { file, entryIndex } = props;
  const contextFill = file.meta ? file.meta : file.context;
  const [{ projectData }, dispatch] = useProjectState();

  const context =
    contextFill === 'null' || contextFill === null
      ? 'No context here yet.'
      : contextFill;

  const updateMeta = () => {
    dispatch({
      type: 'FILE_META',
      activityID: projectData.entries[entryIndex].activity_uid,
      artifactTitle: projectData.entries[entryIndex].title,
      artifactID: Object.keys(file).includes('artifact_uid')
        ? file.artifact_uid
        : null,
      context: context,
    });
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
  activityID: string;
  entryIndex: number;
  openFile: (fileName: string, filePath: string) => void;
  updateEntryField: (fieldName: string, newData: any) => void;
  makeNonEditable: () => void;
  files: File[];
  foundIn: ResearchThread[];
}

interface ReactTag {
  id: string;
  text: string;
}

const Entry = (props: EntryPropTypes) => {
  const {
    activityID,
    files,
    entryIndex,
    openFile,
    updateEntryField,
    makeNonEditable,
    foundIn,
  } = props;

  const [{ projectData, filterRT, folderPath }, dispatch] = useProjectState();

  const allTags = projectData.tags;

  const thisEntry = useMemo(() => {
    return projectData.entries.filter((f) => f.activity_uid === activityID)[0];
  }, [
    allTags,
    projectData.entries.length,
    projectData.entries.flatMap((fm) => fm.files).length,
  ]);

  const [value, setValue] = useState(thisEntry.description);
  const [showDescription, setShowDescription] = useState(
    !!thisEntry.description
  );

  // Update description details when entryData changes.
  // This happens on timeline view, when user selects different entry to view in detail panel
  useEffect(() => {
    setShowDescription(!!thisEntry.description);
    setValue(thisEntry.description);
  }, [thisEntry]);

  const [selectedTab, setSelectedTab] =
    React.useState<'write' | 'preview'>('write');

  const [showFileUpload, setShowFileUpload] = useState(true);

  const saveFiles = (fileList: FileObj[]) => {
    dispatch({
      type: 'ADD_FILES_TO_ENTRY',
      fileList,
      entryIndex,
      activityID: thisEntry.activity_uid,
    });
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

  const urls = thisEntry.files.filter((f) => f.fileType === 'url');
  const filterfiles = files.filter((f) => f.fileType !== 'url');

  return (
    <div
      style={{
        margin: 'auto',
        padding: 6,
        border: '1px solid gray',
        borderRadius: 5,
      }}
    >
      <br />
      <span
        style={{
          fontSize: 28,
        }}
      >
        <Editable
          defaultValue={thisEntry.title}
          onSubmit={(val) => {
            updateEntryField('title', val);
          }}
        >
          <EditablePreview />
          <EditableInput />
        </Editable>
        <Button
          size="xs"
          style={{ display: 'inline' }}
          onClick={makeNonEditable}
          type="button"
        >
          Hide edit controls
        </Button>

        <Button
          size="xs"
          style={{ marginLeft: 5 }}
          colorScheme="red"
          onClick={() => updateEntryField('isPrivate', !thisEntry.isPrivate)}
        >
          {thisEntry.isPrivate ? (
            <FaLock title="Entry is currently private; click to make it public." />
          ) : (
            <FaLockOpen title="Entry is currently public; click to make it private." />
          )}
        </Button>

        <Button
          size="xs"
          style={{ display: 'inline', marginLeft: 5 }}
          colorScheme="red"
          leftIcon={<DeleteIcon />}
          onClick={() => dispatch({ type: 'DELETE_ENTRY', entryIndex })}
        >
          Delete Activity
        </Button>
      </span>
      <br />
      <div>
        <span
          style={{
            fontWeight: 500,
            fontSize: 14,
            textAlign: 'right',
            paddingRight: 5,
            lineHeight: 1,
          }}
        >
          {'Date Activity Happened: '}
        </span>
        <div
          style={{
            border: '1px solid gray',
            borderRadius: 5,
            padding: 5,
            cursor: 'pointer',
          }}
        >
          <EditDate date={thisEntry.date} updateEntryField={updateEntryField} />
        </div>
      </div>
      {foundIn.length > 0 &&
        foundIn.map((fi, fIndex) => (
          <React.Fragment key={`tool-${fIndex}`}>
            <Tooltip style={{ padding: 5 }} label={`Threaded in ${fi.title}`}>
              <div
                style={{
                  fontSize: 20,
                  backgroundColor: fi.color,
                  borderRadius: 50,
                  width: 26,
                  display: 'inline-block',
                  padding: 3,
                  margin: 3,
                  opacity: filterRT && fi.title === filterRT.title ? 1 : 0.4,
                }}
              >
                <GiSewingString size="20px" />
              </div>
            </Tooltip>
          </React.Fragment>
        ))}

      <br />
      <span style={{ fontSize: 18, fontWeight: 600, display: 'block' }}>
        {'Tags: '}
      </span>
      <ReactTags
        tags={thisEntry.tags.map((t) => ({ id: t, text: t }))}
        suggestions={allTags.map((t) => ({ id: t.title, text: t.title }))}
        delimiters={[KeyCodes.comma, KeyCodes.enter]}
        handleDelete={(i: number) =>
          updateEntryField(
            'tags',
            thisEntry.tags.filter((_tag, index) => index !== i)
          )
        }
        handleAddition={(tag: ReactTag) => {
          dispatch({
            type: 'ADD_TAG_TO_ENTRY',
            newTag: tag,
            activityID: thisEntry.activity_uid,
          });
        }}
      />

      <br />
      <span style={{ fontSize: 18, fontWeight: 600, display: 'block' }}>
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

          {value !== thisEntry.description && (
            <>
              <b style={{ color: 'red' }}>
                You have made unsaved changes to this field. These will be lost
                if you switch to editing a different field.
              </b>
              <Button
                onClick={() => {
                  thisEntry.description = value;
                  updateEntryField('description', value);
                }}
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
        <br />
        <span style={{ fontSize: 18, fontWeight: 600 }}>{'Artifacts: '}</span>
        <UnorderedList>
          {filterfiles.map((file: File, j) => (
            <ListItem key={file.title}>
              {file.title}{' '}
              <FaExternalLinkAlt
                onClick={() => {
                  openFile(file.title, folderPath as string);
                }}
                title="Open file externally"
                size="12px"
                style={{ display: 'inline' }}
              />{' '}
              <FaTrashAlt
                onClick={() => deleteFile(file)}
                title="Unattach or delete File"
                size="12px"
                style={{ display: 'inline' }}
              />
              <UnorderedList>
                <ListItem>
                  <FileContext
                    file={file}
                    entryIndex={entryIndex}
                    fileIndex={j}
                    dispatch={dispatch}
                  />
                </ListItem>
              </UnorderedList>
            </ListItem>
          ))}
        </UnorderedList>
      </div>
      <br />

      {showFileUpload ? (
        <>
          <Flex
            style={{
              borderColor: 'gray',
              borderRadius: 5,
              // alignItems: 'center',
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
          <FaPlus /> Add artifacts
        </Button>
      )}
      <GoogFileInit
        fileType="document"
        text="Create Google Doc"
        entryIndex={entryIndex}
      />

      <URLList urls={urls} entryIndex={entryIndex} dispatch={dispatch} />
    </div>
  );
};

export default Entry;
