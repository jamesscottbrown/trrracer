import React, { useState } from 'react';
import { MdCancel } from 'react-icons/md';
import { useProjectState } from './ProjectContext';
import QueryMatchComponent from './QueryMatchComponent';
import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
} from '@chakra-ui/react';

interface QueryViewProps {
  setViewType: (viewType: string) => void;
}

export const HoverTitle = (props: any) => {
  const { title, entry, match, setViewType } = props;

  const [{ query, projectData }, dispatch] = useProjectState();

  let fileIndex: number = 0; 

  projectData.entries.forEach(f => {
    f.files.forEach((fi, i) => {
      if(fi.title === title){
        console.log('FOUND FILE HERE');
        fileIndex = i};
    });
  })

  // if(entry && entry.files && entry.files.map(m => m.title).indexOf(title) > -1){
  //   fileIndex = entry.files.map(m => m.title).indexOf(title);
  // }else if(match.artifactIndex){
  //   console.log('NO INDEX??',entry, match)
  //   fileIndex = match.artifactIndex;
  // }else{
  //   fileIndex = match['file-index'];
  // }

  const [showPopover, setShowPopover] = useState(false);

  const closePopover = () => {
    setShowPopover(false);
  };

  return (
    <>
      {showPopover ? (
        <Popover isOpen={showPopover} onClose={closePopover}>
          <PopoverTrigger>
            <div style={{ display: 'inline', marginRight: 10 }}>{title}</div>
          </PopoverTrigger>
          <PopoverContent bg="white" color="gray">
            <PopoverArrow bg="white" />
            <PopoverBody>
              <Button
                onClick={() => {

                  setViewType('detail view');
                  dispatch({
                    type: 'SELECTED_ARTIFACT',
                    activity: entry,
                    artifactIndex: fileIndex,
                    hopArray: [
                      {
                        activity: entry,
                        artifactUid: entry && entry.files[fileIndex]
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
        <div
          style={{ display: 'inline', marginRight: 10 }}
          onMouseEnter={() => setShowPopover(true)}
        >
          {title}
        </div>
      )}
    </>
  );
};

const QueryView = (props: QueryViewProps) => {
  const { setViewType } = props;
  const [{ query }, dispatch] = useProjectState();

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

              {m.titleMatch.length > 0 && (
                <div
                style={{fontWeight: 700}}
                >Matches in Titles :</div>
              )}
              {
                m.titleMatch.length > 0 && (
                  m.titleMatch.map((tm, j)=> (
                    <React.Fragment
                    key={`title-match-${j}`}
                    >{
                      Object.keys(tm).includes('fileTitle') ? 
                      <div><span
                      style={{fontWeight: 700}}
                      >{'File title match: '}</span>
                      <HoverTitle title={tm.fileTitle} entry={m} match={tm} setViewType={setViewType}/>
                      </div> 
                      : 
                      <div></div>
                    }
                      
                    </React.Fragment>
                  ))
                )
              }
              {
                m.descriptionMatch.length > 0 && (
                  <div
                  style={{fontWeight: 700}}
                  >Matches for description: </div>
                )
              }
              {
                m.descriptionMatch.length > 0 && (
                  m.descriptionMatch.map((d, j) => (
                    <React.Fragment
                    key={`title-match-${j}`}
                    >{
                      Object.keys(d).includes('fileTitle') ? 
                      <div><span
                      style={{fontWeight: 700}}
                      >{'File context match: '}</span>
                      <HoverTitle title={d.fileTitle} entry={m} match={d} setViewType={setViewType}/>
                      </div> 
                      : 
                      <div></div>
                    }
                      
                    </React.Fragment>
                  ))
                )
              }
              {m.textMatch.length > 0 && (
                <div
                style={{fontWeight: 700}}
                >Matches in Text files :</div>
              )}
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
              {m.googMatch.length > 0 && (
                <div
                style={{fontWeight: 700}}
                >Matches in google docs :</div>
              )}
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
