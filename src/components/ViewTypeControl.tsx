import React from 'react';

interface ViewTypeControlProps {
  viewType: string;
  setViewType: (viewType: string) => void;
}

const ViewTypeControl = (props: ViewTypeControlProps) => {
  const { viewType, setViewType } = props;
  return (
    <>
      View type:{' '}
      <select onChange={(ev) => setViewType(ev.target.value)} value={viewType}>
        <option id="list">list</option>
        <option id="timeline">timeline</option>
      </select>
    </>
  );
};

export default ViewTypeControl;
