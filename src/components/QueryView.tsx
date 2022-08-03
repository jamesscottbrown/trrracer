import React, { useState } from 'react';
import { MdCancel } from 'react-icons/md';
import { useProjectState } from './ProjectContext';
import QueryMatchComponent from './QueryMatchComponent';


interface QueryViewProps {
  setViewType: (viewType: string) => void;
}

const QueryView = (props: QueryViewProps) => {
  const { setViewType } = props;
  const [{ query }, dispatch] = useProjectState();

  console.log('query matchessss', query.matches);

  return (
    <div>
      <div
        style={{
          padding: 5,
          position: 'absolute',
          top: '0px',
          right: '10px',
          zIndex: '1000',
          cursor: 'pointer',
        }}
        onClick={() => {
          setViewType('overview');
          dispatch({
            type: 'UPDATE_GO_BACK',
            goBackView: 'overview',
            filterQuery: null,
          });
        }}
      >
        <MdCancel size={30} />
      </div>
      {query.matches.length > 0 ? (
        <div style={{ padding: 5, overflowY: 'auto' }}>
          {query.matches.map((m: any, i: number) => (
            <div key={`match-${i}`}>
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 30 }}>
                {m.entry.title}
              </div>

              {m.textMatch.length > 0 &&
                m.textMatch.map((tm, j) => (
                  <React.Fragment
                  key={`rf-${j}`}
                  >
                    <QueryMatchComponent
                      m={m}
                      tm={tm}
                      setViewType={setViewType}
                      j={j}
                    />
                  </React.Fragment>
               
                ))}

              {m.googMatch.length > 0 &&
                m.googMatch.map((gm, j) => (
                  <React.Fragment
                  key={`gf-${j}`}
                  >
                  <QueryMatchComponent
                    m={m}
                    tm={gm}
                    setViewType={setViewType}
                    j={j}
                  />
                  </React.Fragment>
                ))}
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            borderRadius: 6,
            padding: 30,
            width: 250,
            backgroundColor: '#d3d3d3',
            position: 'absolute',
            right: 50,
            textAlign: 'center',
          }}
        >
          No matches found
        </div>
      )}
    </div>
  );
};

export default QueryView;
