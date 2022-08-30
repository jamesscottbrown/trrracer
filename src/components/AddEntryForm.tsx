import React, { useState } from 'react';
import {
  Flex,
  Box,
  Editable,
  EditableInput,
  EditablePreview,
  Button,
} from '@chakra-ui/react';
import DatePicker from 'react-datepicker';
import ReactMde from 'react-mde';
import Showdown from 'showdown';
import { MdCancel } from 'react-icons/md';
import { useProjectState } from './ProjectContext';

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true,
});

type AddEntryFormPropsType = {
  setAddEntrySplash: (
    value: ((prevState: boolean) => boolean) | boolean
  ) => void;
};

const AddEntryForm = (props: AddEntryFormPropsType) => {
  const { setAddEntrySplash } = props;
  const [{ projectData }, dispatch] = useProjectState();

  const [activityName, setActivityName] = useState('New Activity');
  const activityIndex = projectData.entries.length;
  const [value, setValue] = useState('Add description');
  const [description, setDescription] = useState('Add description');
  const [date, setDate] = useState(new Date());

  const addEntry = () => {
    dispatch({
      type: 'ADD_ENTRY',
      data: {
        title: activityName,
        index: activityIndex,
        description,
        date,
      },
    });

    setActivityName('New Activity');
    setDescription('Add description');
    setDate(new Date());
  };

  const EditDate = (editDateProps: { date: Date }) => {
    const { date: currentDateVal } = editDateProps;

    const updateDate = (newDate: Date) => {
      console.log('newdate', newDate);
      // if in GMT, the time will be returned in UTC, so will be 11pm of the day before
      newDate.setHours(newDate.getHours() + 1);
      setDate(newDate);
    };
    return (
      <DatePicker
        selected={new Date(currentDateVal)}
        onChange={updateDate}
        dateFormat="dd MMMM yyyy"
        maxDate={new Date()}
      />
    );
  };

  const [selectedTab, setSelectedTab] =
    React.useState<'write' | 'preview'>('preview');

  const handleChangeTab = (newTab: 'write' | 'preview') => {
    setSelectedTab(newTab);
  };

  return (
    <Box
      style={{
        position: 'absolute',
        top: 60,
        right: 10,
        backgroundColor: '#fff',
        padding: 10,
        zIndex: 50000,
        border: '1px solid gray',
        borderRadius: 5,
      }}
      overflowY="auto"
    >
      <div
        style={{
          float: 'right',
          display: 'inline-block',
          cursor: 'pointer',
        }}
        onClick={() => setAddEntrySplash(false)}
      >
        <MdCancel />
      </div>
      <Editable
        style={{ fontSize: 18, fontWeight: 700, display: 'block' }}
        defaultValue={activityName}
        onSubmit={(val) => setActivityName(val)}
      >
        <EditablePreview />
        <EditableInput />
      </Editable>
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
          <EditDate date={date} />
        </div>
      </Flex>

      <br />
      <span style={{ fontSize: 18, fontWeight: 700, display: 'block' }}>
        {'Description: '}
      </span>

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

        {value !== description && (
          <>
            <b style={{ color: 'red' }}>
              You have made unsaved changes to this field. These will be lost if
              you switch to editing a different field.
            </b>
            <Button onClick={() => setDescription(value)}>
              Save Description
            </Button>
          </>
        )}
      </div>

      <Button
        onClick={() => {
          setAddEntrySplash(false);
          addEntry();
        }}
      >
        Add Activity
      </Button>
    </Box>
  );
};

export default AddEntryForm;
