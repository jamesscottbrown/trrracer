import React from 'react';

export const EventRect = (props) => {
  const { event, yScale } = props;

  const startY = yScale(new Date(event.time[0]));
  const endY = yScale(new Date(event.time[1]));

  const height = endY - startY;
  return (
    <g className="event" transform={`translate(-70, ${startY})`}>
      <rect height={height} width={1000} fillOpacity={0.01} />

      <line
        className="start"
        x1={0}
        x2={400}
        y1={0}
        y2={0}
        stroke="gray"
        strokeDasharray="5,5"
        strokeWidth="0.4"
      />
      <line
        className="end"
        x1={0}
        x2={400}
        y1={height}
        y2={height}
        stroke="gray"
        strokeDasharray="5,5"
        strokeWidth="0.4"
      />
      <line
        className="line"
        x1={400}
        x2={400}
        y1={0}
        y2={height}
        stroke="gray"
        strokeWidth="1"
      />

      <text x={405} y={height / 2} fontSize="10" fill="grey">
        {event.event}
      </text>
    </g>
  );
};
