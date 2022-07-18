import React from 'react';
import { FormControl, Select } from '@chakra-ui/react';
import { useProjectState } from './ProjectContext';

interface ViewTypeControlProps {
  viewType: string;
  setViewType: (viewType: string) => void;
}

const ViewTypeControl = (props: ViewTypeControlProps) => {
  const { viewType, setViewType } = props;
  const [{isReadOnly}, dispatch] = useProjectState();

  console.log('history',window.history);

  return (
    <>
      <FormControl>
        <Select
          onChange={(ev) => {
            if(isReadOnly){ 
              window.history.pushState("object or string", "Title", "/" );
              dispatch({
                type: 'VIEW_PARAMS',
                viewParams: null,
              });
            }
            if(viewType === 'overview'){
              dispatch({ type: 'THREAD_FILTER', filterRT: null, selectedThread: null });
            }
            setViewType(ev.target.value);
           
          }}
          value={viewType}
          width="max-content"
        >
          <option id="overview">overview</option>
          <option id="paper">paper</option>
        </Select>
      </FormControl>
    </>
  );
};

export default ViewTypeControl;
