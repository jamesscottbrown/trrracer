import React from 'react';
import { FormControl, Select } from '@chakra-ui/react';

interface ViewTypeControlProps {
  viewType: string;
  setViewType: (viewType: string) => void;
}

const ViewTypeControl = (props: ViewTypeControlProps) => {
  const { viewType, setViewType } = props;

  return (
    <>
      <FormControl>
        <Select
          onChange={(ev) => setViewType(ev.target.value)}
          value={viewType}
          width="max-content"
        >
          {/* <option id="activity view">activity view</option> */}
          <option id="timeline">timeline</option>
          <option id="research threads">research threads</option>
        </Select>
      </FormControl>
    </>
  );
};

export default ViewTypeControl;
