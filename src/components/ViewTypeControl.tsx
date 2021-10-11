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
    console.log(viewType)
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (

    // <div>
    //   View Type: 
    // <button color="default" size="large" aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
    //   {viewType}
    // </button>
    // {/* <Menu
    //   id="simple-menu"
    //   anchorEl={anchorEl}
    //   keepMounted
    //   open={Boolean(anchorEl)}
    //   onClose={handleClose}
    // >
    //   <MenuItem 
    //   onClick={()=> {
    //     setViewType('list')
    //     handleClose}}>List</MenuItem>
    //   <MenuItem   
    //   onClick={()=> {
    //     setViewType('timeline')
    //     handleClose}}>Timeline</MenuItem>
    //      <MenuItem   
    //   onClick={()=> {
    //     setViewType('bin')
    //     handleClose}}>Bin by Concept</MenuItem>
    // </Menu> */}
    // </div>

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
