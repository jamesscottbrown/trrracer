import path from 'path';

import React, { useState } from 'react';
import { Heading } from '@chakra-ui/react';

import { extent } from 'd3-array';
import { scaleTime } from 'd3-scale';

import { repositionPoints } from 'respacer';

import { EntryType, ProjectType, ProjectViewProps, TagType } from './types';
import { useProjectState } from './ProjectContext';
import ViewTypeControl from './ViewTypeControl';
import Entry from './Entry';
import TagList from './TagList';
import TagFilter from './SetFilterTags';

const { ipcRenderer } = require('electron');

interface EntryPlotProps {
  entryData: EntryType;
  y: (date: Date) => number;
  tags: TagType[];
  setEntryAsSelected: () => void;
}

const EntryPlot = (props: EntryPlotProps) => {
  const { entryData, y, tags, setEntryAsSelected } = props;

  const angledLineWidth = 10;
  const straightLineWidth = 10;

  const squareWidth = 10;
  const squarePadding = 2;

  console.log('ENTRY DATA:', entryData);

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

  return null;
};

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

  const dates = entries.map((e) => e.date);

  const y = scaleTime()
    .range([0, 40 * entries.length])
    .domain(extent(dates));

  const positionEntries =
    entries.length > 0
      ? repositionPoints(
          entries.map((e, i) => ({ ...e, yDirect: y(e.date), entryIndex: i })),
          {
            oldPositionName: 'yDirect',
            newPositionName: 'y',
            minSpacing: 40,
          }
        )
      : [];

  return (
    <svg height={40 * dates.length + 100} width={1000}>
      <g transform="translate(20, 20)">
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
  const { projectData, folderPath, viewType, setViewType } = ProjectPropValues;
  const [selectedEntryIndex, setSelectedEntryIndex] = useState(-1);

  console.log('SELECTED INDEX:', selectedEntryIndex);

  const [{ filterTags }, dispatch] = useProjectState();

  // TODO - these are duplicated from ProjectListView
  const updateEntryField = (
    entryIndex: number,
    fieldName: string,
    newValue: any
  ) => {
    dispatch({ type: 'UPDATE_ENTRY_FIELD', entryIndex, fieldName, newValue });
  };

  const openFile = (fileName: string) => {
    console.log('Open file:', path.join(folderPath, fileName));
    ipcRenderer.send('open-file', path.join(folderPath, fileName));
  };

  const filteredEntries = projectData.entries.filter((entryData: EntryType) => {
    return filterTags.every((requiredTag: string) =>
      entryData.tags.includes(requiredTag)
    );
  });

  return (
    <div>
      <Heading as="h1">{projectData.title}</Heading>

      <ViewTypeControl viewType={viewType} setViewType={setViewType} />

      <TagList tags={projectData.tags} />

      <Heading as="h2">Entries</Heading>
      <TagFilter />

      <div style={{ display: 'grid', gridTemplateColumns: '50% 50%' }}>
        <div>
          <TimelinePlot
            projectData={projectData}
            filteredEntries={filteredEntries}
            setSelectedEntryIndex={setSelectedEntryIndex}
          />
        </div>

        <div>
          {selectedEntryIndex < 0 ? (
            <p>Click on an entry to see details</p>
          ) : (
            <Entry
              entryData={projectData.entries[selectedEntryIndex]}
              entryIndex={selectedEntryIndex}
              openFile={openFile}
              updateEntryField={updateEntryField}
              allTags={projectData.tags}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectTimelineView;
