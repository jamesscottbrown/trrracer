import * as d3co from 'd3-color';
import React from 'react';

export const HiddenActivity = (props) => {
  const { event } = props;

  const color = d3co.hsl('#d3d3d3').copy({ l: 0.94 }) as string;

  return (
    <g
      className="hidden-activity"
      transform={`translate(${event.x}, ${event.y})`}
      style={{cursor: 'pointer' }}
    >
      <circle
        className="hidden"
        fill={color}
        stroke="#d3d3d3"
        strokeWidth={0.4}
        r={event.radius}
        cx={0}
        cy={0}
      />
      {event.files.map((f, i) => (
        <circle key={`bubb-${i}`} className="artifact" r={3} cx={f.x} cy={f.y} fill="#d3d3d3" />
      ))}
    </g>
  );
};
