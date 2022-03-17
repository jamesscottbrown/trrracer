import path from 'path';

import React, { useCallback, useState } from 'react';
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
import DateFilter from './FilterDates';

interface EntryPlotProps {
  entryData: EntryType;
  y: (date: Date) => number;
  tags: TagType[];
  setEntryAsSelected: () => void;
}

const EntryPlot = (props: EntryPlotProps) => {
  const { entryData, y, tags, setEntryAsSelected } = props;
  const [{}, dispatch] = useProjectState();

  const angledLineWidth = 100;
  const straightLineWidth = 20;

  const squareWidth = 10;
  const squarePadding = 2;

  console.log(entryData);

  const getColor = (title: string) => {
    const tag = tags.filter((t) => t.title === title)[0];
    return tag ? tag.color : 'grey';
  };

  return (
    <>
      <circle cx={0} cy={entryData.yDirect} r={5} stroke="grey" fill="gray">

        <title>{new Date(entryData.date).toLocaleDateString('en-us', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}</title>
        
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
      <g onMouseOver={()=> {
          dispatch({ type: 'HOVER_OVER_ACTIVITY', hoverActivity: entryData});
        }}>
        <g transform={`translate(${angledLineWidth + straightLineWidth}, 0)`}>
          {entryData.files.map((t, i) => {
            return (
              <rect
                key={`${entryData.title}-artifact-${i}`}
                x={i * (squareWidth + squarePadding)}
                y={entryData.y - squareWidth}
                width={squareWidth}
                height={squareWidth}
                // fill={getColor(t)}
                fill={'gray'}
                onClick={setEntryAsSelected}
              >
                <title>{t.title}</title>
              </rect>
            );
          })}
        </g>

        <g
          transform={`translate(${
            angledLineWidth +
            straightLineWidth +
            entryData.files.length * (squareWidth + squarePadding)
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
  filteredActivites: EntryType[];
  boundingWidth:number | null;
  setSelectedEntryIndex: (entryIndex: number) => void;
}

const TimelinePlot = (props: TimelinePlotProps) => {
  const { projectData, setSelectedEntryIndex, filteredActivites, boundingWidth } = props;

  const entries = filteredActivites.map((e:EntryType) => ({
    ...e,
    date: new Date(e.date),
  }));

  const deadlines = projectData.deadlines ? projectData.deadlines : [];
  const deadlineDates = deadlines.map((d) => new Date(d.date));

  const dates = entries.map((e) => e.date);

  const height = Math.max(40 * entries.length, 600);

  //NEED TO MAKE THIS DYNAMIC
  const y = scaleTime()
    .range([0, (height - 70)])
    .domain(extent([...dates, ...deadlineDates]).reverse());

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

  const width = (boundingWidth - 50);
  const dateLabelWidth = 50;
  const tickWidth = 10;
  const ticks = y.ticks();

  const formatTime =  timeFormat('%x');//timeFormat('%Y-%m-%d (%a)');

  return (
    <svg height={height} width={width}>
      <g transform="translate(20,20)">
        {ticks.map((t) => (
          <React.Fragment key={`tick-${t}`}>
            <text x={0} y={y(t)} style={{fontSize:10}}>
              {formatTime(t)}
            </text>
            <line
              x1={dateLabelWidth}
              x2={dateLabelWidth + tickWidth}
              y1={y(t)}
              y2={y(t)}
              stroke="black"
            />
          </React.Fragment>
        ))}
      </g>

      <g transform={`translate(${20 + dateLabelWidth + tickWidth}, 20)`}>
        <line x1={0} x2={0} y1={y.range()[0]} y2={y.range()[1]} stroke="grey" />

        {positionEntries.map((e) => (
          <EntryPlot
            key={`en-${e.entryIndex}`}
            y={y}
            entryData={e}
            tags={projectData.tags}
            setEntryAsSelected={() => {
              console.log('click')
              setSelectedEntryIndex(e.entryIndex)}}
          />
        ))}
      </g>
    </svg>
  );
};

const ProjectTimelineView = (ProjectPropValues: ProjectViewProps) => {
  const { projectData, filteredActivites, selectedEntryIndex, setSelectedEntryIndex } = ProjectPropValues;
 

  const [{}, dispatch] = useProjectState();

  // TODO - these are duplicated from ProjectListView
  const updateEntryField = (
    entryIndex: number,
    fieldName: string,
    newValue: any
  ) => {
    dispatch({ type: 'UPDATE_ENTRY_FIELD', entryIndex, fieldName, newValue });
  };

  const [width, setWidth] = useState(null);
  const div = useCallback(node => {
    if (node !== null) {
      setWidth(node.getBoundingClientRect().width);
    }
  }, []);

  return (
    <div ref={div} style={{width:'100%'}}>
      {/* <DateFilter /> */}
        <div style={{overflowY:"auto", height:"calc(100vh - 250px)", width:'100%'}}>
          <TimelinePlot
            projectData={projectData}
            filteredActivites={filteredActivites}
            setSelectedEntryIndex={setSelectedEntryIndex}
            boundingWidth={width}
          />
        </div>
    </div>
  );
};

export default ProjectTimelineView;