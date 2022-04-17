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

interface QueryViewProps {
  setViewType: (viewType: string) => void;
  filteredActivites: any;
}

const HoverTitle = (props: any) => {
  const { title, entry, match, setViewType, matches } = props;

  const fileIndex =
    match.fileType === 'gdoc'
      ? entry.files.map((m) => m.title).indexOf(match.title)
      : match['file-index'];

  const [showPopover, setShowPopover] = useState(false);
  const [{}, dispatch] = useProjectState();

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
                  setViewType('detail view');
                  dispatch({
                    type: 'SELECTED_ARTIFACT',
                    selectedArtifactEntry: entry,
                    selectedArtifactIndex: fileIndex,
                  });
                  dispatch({
                    type: 'UPDATE_GO_BACK',
                    goBackView: 'query',
                    filterQuery: matches.map((m) => m.entry.title),
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

const QueryView = (props: any) => {
  const { setViewType } = props;
  const [{ query }, dispatch] = useProjectState();

  console.log('query', query);

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
      <div style={{ padding: 5, overflowY: 'auto' }}>
        {query.matches.map((m: any, i: number) => (
          <div key={`match-${i}`}>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 30 }}>
              {m.entry.title}
            </div>
            {m.textMatch.length > 0 &&
              m.textMatch.map((tm, j) => (
                <div style={{ marginTop: 10 }} key={`tm-${j}`}>
                  <HoverTitle
                    title={tm['file-title']}
                    entry={m.entry}
                    match={tm}
                    setViewType={setViewType}
                    matches={query.matches}
                  />

                  <div>
                    {tm.context.map((c, ci) => (
                      <div key={`div-cont-${ci}`}>
                        {c.map((m, mi) => (
                          <span
                            key={`span-con-${mi}`}
                            style={{
                              fontSize: 11,
                              fontWeight: m.style ? 700 : 400,
                              fontStyle: 'italic',
                              backgroundColor: m.style ? 'yellow' : '#ffffff',
                            }}
                          >
                            {m.context}
                            {m.style ? '' : '. '}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            {m.googMatch.length > 0 &&
              m.googMatch.map((gm, j) => (
                <div style={{ marginTop: 10 }} key={`gm-${j}`}>
                  <HoverTitle
                    title={gm.title}
                    entry={m.entry}
                    match={gm}
                    setViewType={setViewType}
                  />
                  <div>
                    {gm.context.map((c, k) => (
                      <div key={`in-gm-${k}`}>
                        {c.map((m, l) => (
                          <span
                            key={`span-${l}`}
                            style={{
                              fontSize: 11,
                              fontWeight: m.style ? 700 : 400,
                              fontStyle: 'italic',
                              backgroundColor: m.style ? 'yellow' : '#ffffff',
                            }}
                          >
                            {m.context}
                            {'. '}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QueryView;
