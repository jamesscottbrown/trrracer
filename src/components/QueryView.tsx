import React, { useState } from 'react';

import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
} from '@chakra-ui/react';

import { MdCancel } from 'react-icons/md';
import { useProjectState } from './ProjectContext';
import QueryMatchComponent from './QueryMatchComponent';

const HoverTitle = (props: any) => {
  const { title, entry, match, setViewType } = props;

  const [{ query }, dispatch] = useProjectState();

  const fileIndex =
    match.fileType === 'gdoc'
      ? entry.files.map((m) => m.title).indexOf(match.title)
      : match['file-index'];

  const [showPopover, setShowPopover] = useState(false);

  const closePopover = () => {
    setShowPopover(false);
  };

  return (
    <>
      {showPopover ? (
        <Popover isOpen={showPopover} onClose={closePopover}>
          <PopoverTrigger>
            <div>{title}</div>
          </PopoverTrigger>
          <PopoverContent bg="white" color="gray">
            <PopoverArrow bg="white" />
            <PopoverBody>
              <Button
                onClick={() => {
                  console.log('matches??', match);
                  setViewType('detail view');
                  dispatch({
                    type: 'SELECTED_ARTIFACT',
                    activity: entry,
                    artifactIndex: fileIndex,
                    hopselArray: [
                      {
                        activity: entry,
                        artifactUid: entry.files[fileIndex]
                          ? entry.files[fileIndex].artifact_uid
                          : null,
                        hopReason: 'first hop',
                      },
                    ],
                  });
                  dispatch({
                    type: 'UPDATE_GO_BACK',
                    goBackView: 'query',
                    filterQuery: query.matches.map((m) => m.entry.title),
                  });
                }}
              >
                See artifact in detail.
              </Button>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      ) : (
        <div onMouseEnter={() => setShowPopover(true)}>{title}</div>
      )}
    </>
  );
};

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
          top: '-20px',
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
                  <QueryMatchComponent
                    m={m}
                    tm={tm}
                    setViewType={setViewType}
                    j={j}
                  />
                ))}

              {m.googMatch.length > 0 &&
                m.googMatch.map((gm, j) => (
                  <QueryMatchComponent
                    m={m}
                    tm={gm}
                    setViewType={setViewType}
                    j={j}
                  />
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
