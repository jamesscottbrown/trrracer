import React from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

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
    // <>
    //   View type:{' '}
    //   <select onChange={(ev) => setViewType(ev.target.value)} value={viewType}>
    //     <option id="list">list</option>
    //     <option id="timeline">timeline</option>
    //   </select>
    // </>
    <div>
      View Type: 
    <Button color="primary" aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
      {viewType}
    </Button>
    <Menu
      id="simple-menu"
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleClose}
    >
      <MenuItem 
      value={'list'}
      onClick={()=> {
        setViewType('list')
        handleClose}}>List</MenuItem>
      <MenuItem   
      value={'timeline'}
      onClick={()=> {
        setViewType('timeline')
        handleClose}}>Timeline</MenuItem>
    </Menu>
    </div>

  );
};



export default ViewTypeControl;
