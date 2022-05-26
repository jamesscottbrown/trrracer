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
          <option id="overview">overview</option>
          <option id="explore paper">explore paper</option>
        </Select>
      </FormControl>
    </>
  );
};

export default ViewTypeControl;
