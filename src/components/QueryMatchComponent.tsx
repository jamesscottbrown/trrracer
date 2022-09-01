import React, { useState } from 'react';

import { Button } from '@chakra-ui/react';

import { HoverTitle } from './QueryView';
import type { QueryMatchType } from './types';

type QueryMatchComponentProps = {
  m: QueryMatchType;
  tm: any;
  setViewType: (viewType: string) => void;
  j: number;
};

const QueryMatchComponent = (props: QueryMatchComponentProps) => {
  const { m, tm, j, setViewType } = props;
  const [show, setShow] = useState(false);

  return (

    <div style={{ marginTop: 10 }} key={`tm-${j}`}>
      <div>
        <HoverTitle
          title={tm['file-title'] ? tm['file-title'] : tm.title}
          entry={m.entry}
          setViewType={setViewType}
        />
        <Button
          size="xs"
          onClick={() => (show ? setShow(false) : setShow(true))}
        >
          {show ? 'Hide ' : 'Show '} text
        </Button>
      </div>
      {show && (
        <div>
          {tm.query_context.map((c, ci) => (
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
                  {m.query_context}
                  {m.style ? '' : '. '}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
    //   ))
    //   }
  );
};

export default QueryMatchComponent;
