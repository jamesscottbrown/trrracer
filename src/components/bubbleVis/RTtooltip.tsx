import * as d3 from 'd3';
import React from 'react';

export const RTtooltip = (toolProp: any) => {
  // This component displays a tooltip for an Activity when a Research Thread is selected.

  const {
    activityData,
    position,
    researchThreads,
    filterRT,
    mousedOverActivity,
  } = toolProp;

  const whatData = () => {
    if (filterRT) {
      return researchThreads.research_threads.filter(
        (f) => f.title === filterRT.title
      )[0];
    }
    if (activityData.rt_id) {
      return researchThreads.research_threads.filter(
        (f) => f.rt_id === activityData.rt_id
      )[0];
    }
    return researchThreads.research_threads[0];
  };
  const threadData = whatData();

  // let threadData = researchThreads.research_threads.filter(f=> f.title === compare)[0];
  const evidence = threadData.evidence.filter(
    (e) => e.activityTitle === activityData.title
  );

  let activityEv = evidence.filter((e) => e.type === 'activity');
  let artifactEv = Array.from(
    d3.group(
      evidence.filter((e) => e.type === 'artifact' || 'fragment'),
      (d) => d.artifactTitle
    )
  );

  return (
    <div
      id="tooltip"
      style={{
        position: 'absolute',
        left: position[0],
        top: -30, // evidence.length > 0 ? position[1] - 150 : position[1] - 50,
        textAlign: 'center',
        minWidth: 100,
        maxWidth: 450,
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
      {activityEv.length > 0 &&
        activityEv.map((ae, ai) => (
          <div
            key={`activity-ev-${ai}`}
            style={{
              padding: 10,
              backgroundColor: '#d3d3d340',
              borderRadius: 5,
              fontSize: 10,
            }}
          >
            <span>{`Whole activity threaded because:  `}</span>
            <span>{ae.rationale}</span>
          </div>
        ))}
      {artifactEv.length > 0 && (
        <React.Fragment>
          <div style={{ fontSize: 12 }}>Threaded artifacts:</div>
          {artifactEv.map((ae, ai) => (
            <div
              key={`artifact-${ai}`}
              style={{
                border: '1px solid #d3d3d3',
                borderRadius: 6,
                marginBottom: 5,
              }}
            >
              <div
                style={{
                  backgroundColor: '#d3d3d340',
                  padding: 5,
                  fontSize: 11,
                }}
              >
                {ae[0]}
              </div>
              {ae[1].map((m, j) => (
                <div key={`art-ev-${j}`}>
                  <div
                    style={{
                      fontSize: 12,
                      backgroundColor: `${m.color}40`,
                      padding: 5,
                    }}
                  >
                    {m.mergedFrom && (
                      <span
                        style={{ marginRight: 10 }}
                      >{`* Merged from ${m.mergedFrom} thread`}</span>
                    )}
                    <span style={{ fontWeight: 800 }}>{m.rationale}</span>
                  </div>
                  {m.type === 'fragment' && (
                    <React.Fragment>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          lineHeight: 0.9,
                        }}
                      >{`Threaded ${m.type}: `}</span>
                      <span
                        style={{ fontSize: 11, fontStyle: 'italic' }}
                      >{`"${m.anchors[0].frag_type}"`}</span>
                    </React.Fragment>
                  )}
                </div>
              ))}
            </div>
          ))}
        </React.Fragment>
      )}
    </div>
  );
};
