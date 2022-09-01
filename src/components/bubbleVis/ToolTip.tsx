import React from 'react';
import { ToolIcon } from '../Project';

export const ToolTip = (toolProp: any) => {
  const { activityData, position, mousedOverActivity } = toolProp;

  return (
    <div
      id="tooltip"
      style={{
        position: 'absolute',
        left: position[0],
        top: position[1] - 50,
        textAlign: 'center',
        minWidth: 100,
        minHeight: 50,
        padding: 10,
        backgroundColor: '#fff',
        border: '2px solid gray',
        borderRadius: 10,
        pointerEvents: 'none',
        zIndex: 6000,
        opacity: mousedOverActivity ? 1 : 0,
      }}
    >
      <span
        style={{
          font: '15px sans-serif',
          fontWeight: 600,
        }}
      >
        {activityData.title}
      </span>
      <div>
        {activityData.files.map((fi: any, i: any) => (
          <div
            key={`act-data-${i}`}
            style={{ display: 'inline-block', margin: 5 }}
          >
            <ToolIcon artifactType={fi.artifactType} size={28} />
            <span style={{ fontSize: 10 }}>{fi.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
