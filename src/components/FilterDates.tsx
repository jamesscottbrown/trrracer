import React from 'react';
import DatePicker from 'react-datepicker';
import { timeFormat } from 'd3-time-format';
import { min, max } from 'd3-array';
import { useProjectState } from './ProjectContext';
import { EntryType } from './types';

const formatTime = timeFormat('%Y-%m-%d');

interface EditDateTypes {
  date: string;
  field: number;
  msg: string;
}

const EditDate = (props: EditDateTypes) => {
  const { date, field, msg } = props;
  const [{ projectData }, dispatch] = useProjectState();

  const entryDates = projectData.entries.map((e) => new Date(e.date));
  const firstDate = min(entryDates);
  const finalDate = max(entryDates);

  const updateDate = (newDate: Date) => {
    dispatch({
      type: 'UPDATE_FILTER_DATES',
      field,
      value: newDate ? formatTime(newDate) : null,
    });
  };

  return (
    <DatePicker
      selected={date ? new Date(date) : null}
      onChange={updateDate}
      dateFormat="dd MMMM yyyy"
      minDate={new Date(firstDate)}
      maxDate={new Date(finalDate)}
      isClearable
      placeholderText={msg}
      highlightDates={entryDates}
    />
  );
};

const DateFilter = () => {
  const [{ filterDates }] = useProjectState();

  return (
    <div style={{ paddingTop: '0.25em' }}>
      <span style={{ float: 'left', paddingRight: '1em' }}>
        Filter to date range:{' '}
      </span>{' '}
      <EditDate date={filterDates[0]} field={0} msg="Click to set start date" />{' '}
      -
      <EditDate date={filterDates[1]} field={1} msg="Click to set end date" />
    </div>
  );
};

export default DateFilter;
