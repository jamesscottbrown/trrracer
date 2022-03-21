import path from 'path';

import React, { useCallback, useEffect, useState } from 'react';

import { extent } from 'd3-array';
import { scaleTime } from 'd3-scale';
import { timeFormat } from 'd3-time-format';

import { repositionPoints } from 'respacer';

import {
  EntryType,
  ProjectType,
  ProjectViewProps,
  TagType,
} from './types';
import { useProjectState } from './ProjectContext';

// import { Tooltip } from 'react-svg-tooltip';


interface EntryPlotProps {
  entryData: EntryType;
  y: (date: Date) => number;
  tags: TagType[];
  setEntryAsSelected: () => void;
  setShowTool: (bool:Boolean) => void;
  setHoverActivity: (entry:EntryType) => void;
  setPosX: (pos:number) => void;
  setPosY: (pos:number) => void;
}

const imageTypes = ['png', 'jpg', 'gif'];

const angledLineWidth = 100;
const straightLineWidth = 30;
const squareWidth = 30;
const squarePadding = 2;

const MagicRect = (props:any) => {

  const {fileData, entryData, folderPath, setEntryAsSelected, index} = props;
  const rectRef = React.createRef<SVGRectElement>();
  
  return(
    <g>
    {
    imageTypes.includes(fileData.fileType) ?
    <RenderImage fileData={fileData} entryData={entryData} index={index} setEntryAsSelected={setEntryAsSelected} folderPath={folderPath}/> 
    :
    <rect
      ref={rectRef}
      x={index * (squareWidth + squarePadding)}
      y={entryData.y - (squareWidth/2)}
      width={squareWidth}
      height={squareWidth}
      fill={'gray'}
      onClick={setEntryAsSelected}
    >
      <title>{fileData.title}</title>
    </rect>

    }
   
    </g>
  )
}

const RenderImage = (props:any) => {

  const {fileData, entryData, folderPath, setEntryAsSelected, index} = props
  const extension = fileData.fileType;
  const newName = fileData.title.split(`.${extension}`);

  const newPath = `thumbs/${newName[0]}.png`;
   
    return(
      <g>
        <defs>
          <pattern
            id={`image${fileData.title}`}
            patternUnits="userSpaceOnUse"
            width={10}
            height={10}
          >                             {/* <---- these attributes needed here */}
          <image
            href={`file://${path.join(folderPath, newPath)}`}
            height={30}
            width={30}
            x={0}
            y={0}
          />
          </pattern>
        </defs>
        <rect 
          key={`${entryData.title}-artifact-${index}`}
          x={index * (squareWidth + squarePadding)}
          y={entryData.y - (squareWidth/2)}
          width={squareWidth}
          height={squareWidth}
          fill={`url(#image${fileData.title})`}
          stroke={'gray'}
          onClick={setEntryAsSelected}
        />
      </g>
      
    )
}

const EntryPlot = (props: EntryPlotProps) => {
  const { entryData, y, tags, setEntryAsSelected, setHoverActivity, setShowTool, setPosX, setPosY } = props;

  const [hoverState, setHoverState] = useState(false);

  const [{ highlightedTag, researchThreadHover, folderPath }] =
  useProjectState();

  useEffect(()=> {
    setHoverState(false)
    if(highlightedTag){
      entryData.tags.indexOf(highlightedTag) > -1 ? setHoverState(true) : setHoverState(false)
    }
    if(researchThreadHover){
      researchThreadHover.evidence.map(m=> m.activityTitle).indexOf(entryData.title) > -1 ? setHoverState(true) : setHoverState(false)
    }
  }, [highlightedTag, researchThreadHover])

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
        stroke={(hoverState ? 'yellow' : 'gray')}
        strokeWidth={(hoverState ? 3 : 1)}
      />
      <line
        x1={angledLineWidth}
        x2={angledLineWidth + straightLineWidth}
        y1={entryData.y}
        y2={entryData.y}
        stroke={(hoverState ? 'yellow' : 'gray')}
        strokeWidth={(hoverState ? 3 : 1)}
      />
      <g 
      style={{cursor:'pointer'}}
      onMouseOver={(event)=> {
          console.log('event', event)
          const {clientX, clientY} = event;
          // setPosX(clientX);
          // setPosY(clientY);
          //dispatch({ type: 'HOVER_OVER_ACTIVITY', hoverActivity: entryData});
          setShowTool(true)
          setHoverActivity(entryData)
          setHoverState(true)
        }}
        onMouseOut={()=> {
          setShowTool(false);
          setHoverState(false);
        }}
        >
       
        <g transform={`translate(${angledLineWidth + straightLineWidth}, 0)`}>
        <rect 
          width={((entryData.files.length * (squareWidth + squarePadding) + (squareWidth/2)) + (8*entryData.title.length))}
          height={squareWidth+ 10}
          fill={(hoverState ? 'yellow' : 'white')}
          y={entryData.y - (squareWidth - 10)}
          x={-5}
        />
          {entryData.files.map((t, i) => {
            return(
            <MagicRect 
              key={`${entryData.title}-artifact-${i}`}
              fileData={t} 
              entryData={entryData} 
              index={i} 
              setEntryAsSelected={setEntryAsSelected} 
              folderPath={folderPath} />
              )
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
            y={entryData.y + (squareWidth/4)}
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

interface TimelinePlotProps {
  projectData: ProjectType;
  filteredActivites: EntryType[];
  boundingWidth: number | null;
  setSelectedEntryIndex: (entryIndex: number) => void;
  setHoverActivity: (entryIndex: any) => void;
  setShowTool: (boo: Boolean) => void;
  setPosX: (pos:number) => void;
  setPosY: (pos:number) => void;
}

const TimelinePlot = (props: TimelinePlotProps) => {
  const { projectData, 
    setSelectedEntryIndex, 
    filteredActivites, 
    boundingWidth, 
    setHoverActivity, 
    setShowTool,
    setPosX,
    setPosY
  } = props;

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
              setSelectedEntryIndex(e.entryIndex)
            }}
            setHoverActivity={setHoverActivity}
            setShowTool={setShowTool}
            setPosX={setPosX} 
            setPosY={setPosY}
          />
        ))}
      </g>
    </svg>
  );
};

const ProjectTimelineView = (ProjectPropValues: ProjectViewProps) => {
  const { 
    projectData, 
    filteredActivites, 
    selectedEntryIndex, 
    setSelectedEntryIndex, 
    setHoverActivity,
    setShowTool,
    setPosX, 
    setPosY
  } = ProjectPropValues;
 
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
        <div style={{overflowY:"auto", height:"calc(100vh - 250px)", width:'100%'}}>
          <TimelinePlot
            projectData={projectData}
            filteredActivites={filteredActivites}
            setSelectedEntryIndex={setSelectedEntryIndex}
            boundingWidth={width}
            setHoverActivity={setHoverActivity}
            setShowTool={setShowTool}
            setPosX={setPosX} 
            setPosY={setPosY}
          />
        </div>
    </div>
  );
};

export default ProjectTimelineView;