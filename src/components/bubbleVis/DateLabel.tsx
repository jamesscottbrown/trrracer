import React from 'react';

export const DateLabel = (props) => {
  const { hoverData, forced } = props;

  if (!hoverData) {
    return <></>;
  }

  const text = new Date(hoverData.date).toLocaleDateString('en-us', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <g
      id="label-group"
      transform={`translate(0, ${
        hoverData ? forced.yScale(new Date(hoverData.date)) : 0
      })`}
      opacity={1}
    >
      <rect
        width={50}
        height={15}
        fill="#fff"
        fillOpacity={0.9}
        x={-50}
        y={-12}
      />
      <text style={{ fontSize: '9', textAnchor: 'end', fontWeight: 600 }}>
        {text}
      </text>
    </g>
  );
};
