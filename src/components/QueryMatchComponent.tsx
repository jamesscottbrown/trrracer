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

const HoverTitle = (props: any) => {
    const { title, entry, match, setViewType } = props;
  
    const [{query}, dispatch] = useProjectState();
  
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
              <div
              style={{display:'inline', marginRight:10}}
              >{title}</div>
            </PopoverTrigger>
            <PopoverContent bg="white" color="gray">
              <PopoverArrow bg="white" />
              <PopoverBody>
                <Button
                  onClick={() => {
  
                    console.log('matches??',match)
                    setViewType('detail view');
                    dispatch({
                      type: 'SELECTED_ARTIFACT',
                      selectedArtifactEntry: entry,
                      selectedArtifactIndex: fileIndex,
                      hopArray: [ 
                        { activity: 
                          entry, 
                          artifactUid: entry.files[fileIndex] ? entry.files[fileIndex].artifact_uid : null,
                          hopReason: 'first hop',
                        }]
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
          style={{display:'inline', marginRight:10}}
          onMouseEnter={() => setShowPopover(true)}>{title}</div>
        )}
      </>
    );
  };


const QueryMatchComponent = (props:any) => {
    const {m, tm, j, setViewType} = props;
    const [show, setShow] = useState(false);

    console.log(m, tm);

    return (
    // {matchArray.map((tm, j) => (
        <div style={{ marginTop: 10 }} key={`tm-${j}`}>
          <div>
          <HoverTitle
            title={tm['file-title'] ? tm['file-title'] : tm.title}
            entry={m.entry}
            match={tm}
            setViewType={setViewType}
          />
          <Button
            size={'xs'}
            onClick={() => show? setShow(false) : setShow(true)}
          >{'show text'}</Button>
          </div>
          { show && (
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
          )
        }
        </div>
    //   ))
    //   }
    )


}

export default QueryMatchComponent;