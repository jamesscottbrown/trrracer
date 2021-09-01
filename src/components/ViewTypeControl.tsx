import React from 'react';
import { FormControl, FormLabel, Select } from '@chakra-ui/react';

interface ViewTypeControlProps {
  viewType: string;
  setViewType: (viewType: string) => void;
}

const ViewTypeControl = (props: ViewTypeControlProps) => {
  const { viewType, setViewType } = props;
  return (
    <>
      <FormControl>
        <FormLabel> View type: </FormLabel>
        <Select
          onChange={(ev) => setViewType(ev.target.value)}
          value={viewType}
          width="max-content"
        >
          <option id="list">list</option>
          <option id="timeline">timeline</option>
        </Select>
      </FormControl>
    </>
  );
};

export default ViewTypeControl;
