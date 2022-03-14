import path from 'path';

import React, { useState } from 'react';
import { Heading } from '@chakra-ui/react';

import { extent } from 'd3-array';
import { scaleTime } from 'd3-scale';
import { timeFormat } from 'd3-time-format';

import { repositionPoints } from 'respacer';

import {
  DeadlineType,
  EntryType,
  ProjectType,
  ProjectViewProps,
  TagType,
} from './types';
import { useProjectState } from './ProjectContext';
import TagList from './TagList';
import DateFilter from './FilterDates';

const { ipcRenderer } = require('electron');

interface EntryPlotProps {
  entryData: EntryType;
  y: (date: Date) => number;
  tags: TagType[];
  setEntryAsSelected: () => void;
}

const EntryPlot = (props: EntryPlotProps) => {
  const { entryData, y, tags, setEntryAsSelected } = props;

  const angledLineWidth = 100;
  const straightLineWidth = 20;

  const squareWidth = 10;
  const squarePadding = 2;

  const getColor = (title: string) => {
    const tag = tags.filter((t) => t.title === title)[0];
    return tag ? tag.color : 'grey';
  };

  return (
    <>
      <circle cx={0} cy={entryData.yDirect} r={5} stroke="grey" fill="white">
        <title>{entryData.date.toDateString()}</title>
      </circle>
      <line
        x1={0}
        x2={angledLineWidth}
        y1={entryData.yDirect}
        y2={entryData.y}
        stroke="lightGrey"
      />
      <line
        x1={angledLineWidth}
        x2={angledLineWidth + straightLineWidth}
        y1={entryData.y}
        y2={entryData.y}
        stroke="lightGrey"
      />

      <g transform={`translate(${angledLineWidth + straightLineWidth}, 0)`}>
        {entryData.tags.map((t, i) => {
          return (
            <rect
              key={t.id}
              x={i * (squareWidth + squarePadding)}
              y={entryData.y - squareWidth}
              width={squareWidth}
              height={squareWidth}
              fill={getColor(t)}
              onClick={setEntryAsSelected}
            >
              <title>{t}</title>
            </rect>
          );
        })}
      </g>

      <g
        transform={`translate(${
          angledLineWidth +
          straightLineWidth +
          entryData.tags.length * (squareWidth + squarePadding)
        }, 0)`}
      >
        <text
          x={0}
          y={entryData.y}
          textAnchor="start"
          onClick={setEntryAsSelected}
        >
          {entryData.title}
        </text>
      </g>
    </>
  );
};

// interface DeadlineProps {
//   deadline: DeadlineType;
//   width: number;
//   y: (t: Date) => number;
// }

// const Deadline = (props: DeadlineProps) => {
//   const { deadline, width, y } = props;

//   const spaceForTitle = 300;
//   const slopeLength = 25;

//   return (
//     <>
//       <line
//         x1={0}
//         x2={width - spaceForTitle - slopeLength}
//         y1={deadline.yDirect}
//         y2={deadline.yDirect}
//         stroke="grey"
//         strokeDasharray="4,4"
//       />

//       <line
//         x1={width - spaceForTitle - slopeLength}
//         x2={width - spaceForTitle}
//         y1={deadline.yDirect}
//         y2={deadline.y}
//         stroke="grey"
//         strokeDasharray="4,4"
//       />

//       <text x={width - spaceForTitle} y={deadline.y}>
//         {deadline.title}
//       </text>
//     </>
//   );
// };

interface TimelinePlotProps {
  projectData: ProjectType;
  filteredEntries: EntryType[];
  setSelectedEntryIndex: (entryIndex: number) => void;
}

const TimelinePlot = (props: TimelinePlotProps) => {
  const { projectData, setSelectedEntryIndex, filteredEntries } = props;

  const entries = filteredEntries.map((e) => ({
    ...e,
    date: new Date(e.date),
  }));

  const deadlines = projectData.deadlines ? projectData.deadlines : [];
  const deadlineDates = deadlines.map((d) => new Date(d.date));

  const dates = entries.map((e) => e.date);

  const height = Math.max(40 * entries.length, 600);

  const y = scaleTime()
    .range([0, height])
    .domain(extent([...dates, ...deadlineDates]));

  const positionEntries =
    entries.length > 0
      ? repositionPoints(
          entries.map((e, i) => ({ ...e, yDirect: y(e.date), entryIndex: i })),
          {
            oldPositionName: 'yDirect',
            newPositionName: 'y',
            minSpacing: 40,
            width: height - 20,
          }
        )
      : [];

  const positionedDeadlines =
    deadlines.length > 0
      ? repositionPoints(
          deadlines.map((d, i) => ({
            ...d,
            yDirect: y(new Date(d.date)),
            entryIndex: i,
          })),
          {
            oldPositionName: 'yDirect',
            newPositionName: 'y',
            minSpacing: 40,
            width: height - 20,
          }
        )
      : [];

  const width = 1000;
  const dateLabelWidth = 130;
  const tickWidth = 20;
  const ticks = y.ticks();

  const formatTime = timeFormat('%Y-%m-%d (%a)');

  return (
    <svg height={height} width={width}>
      <g transform="translate(20,20)">
        {ticks.map((t) => (
          <>
            <text x={0} y={y(t)}>
              {formatTime(t)}
            </text>
            <line
              x1={dateLabelWidth}
              x2={dateLabelWidth + tickWidth}
              y1={y(t)}
              y2={y(t)}
              stroke="black"
            />
          </>
        ))}
      </g>

      <g transform={`translate(${20 + dateLabelWidth + tickWidth}, 20)`}>
        <line x1={0} x2={0} y1={y.range()[0]} y2={y.range()[1]} stroke="grey" />

        {positionEntries.map((e) => (
          <EntryPlot
            key={e.entryIndex}
            y={y}
            entryData={e}
            tags={projectData.tags}
            setEntryAsSelected={() => setSelectedEntryIndex(e.entryIndex)}
          />
        ))}
      </g>
    </svg>
  );
};

const ProjectTimelineView = (ProjectPropValues: ProjectViewProps) => {
  const { projectData, folderPath } = ProjectPropValues;
  const [selectedEntryIndex, setSelectedEntryIndex] = useState(-1);

  console.log('SELECTED INDEX:', selectedEntryIndex);

  const [{ filterTags, filterDates }, dispatch] = useProjectState();

  // TODO - these are duplicated from ProjectListView
  const updateEntryField = (
    entryIndex: number,
    fieldName: string,
    newValue: any
  ) => {
    dispatch({ type: 'UPDATE_ENTRY_FIELD', entryIndex, fieldName, newValue });
  };

  const filteredEntries = projectData.entries
    .filter((entryData: EntryType) => {
      return filterTags.every(
        (requiredTag: string) =>
          entryData.tags.includes(requiredTag) ||
          entryData.quoteTags.includes(requiredTag)
      );
    })
    .filter((entryData: EntryType) => {
      return (
        (!filterDates[0] || filterDates[0] <= entryData.date) &&
        (!filterDates[1] || entryData.date <= filterDates[1])
      );
    });

  return (
    <div>
      
      <DateFilter />

    

      <div style={{ display: 'grid', gridTemplateColumns: '50% 50%' }}>
        <div>
          <TimelinePlot
            projectData={projectData}
            filteredEntries={filteredEntries}
            setSelectedEntryIndex={setSelectedEntryIndex}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectTimelineView;