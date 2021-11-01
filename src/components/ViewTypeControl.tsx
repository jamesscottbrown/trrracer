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
      <FormLabel> View type: </FormLabel>
      <Select
        onChange={(ev) => setViewType(ev.target.value)}
        value={viewType}
        width="max-content"
      >
        <option id="concepts/list">concepts/list</option>
        <option id="topics/list">topics/list</option>
        <option id="timeline">timeline</option>
        <option id="concept-evolution">concept evolution</option>
      </Select>
    </FormControl>
    </>

  );
};



export default ViewTypeControl;
