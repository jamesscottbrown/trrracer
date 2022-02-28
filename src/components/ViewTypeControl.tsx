import React from 'react';
import { FormControl, FormLabel, Select } from '@chakra-ui/react';

interface ViewTypeControlProps {
  viewType: string;
  setViewType: (viewType: string) => void;
}

const ViewTypeControl = (props: ViewTypeControlProps) => {

  const { viewType, setViewType } = props;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
    <FormControl>
      <Select
        onChange={(ev) => setViewType(ev.target.value)}
        value={viewType}
        width="max-content"
      >
        <option id="activity view">activity view</option>
        {/* <option id="tag view">tag view</option> */}
        <option id="research threads">research threads</option>

      </Select>
    </FormControl>
    </>

  );
};



export default ViewTypeControl;
