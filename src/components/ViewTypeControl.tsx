import React from 'react';

interface ViewTypeControlProps {
  setViewType: (viewType: string) => void;
}

const ViewTypeControl = (props: ViewTypeControlProps) => {
  const { setViewType } = props;
  return (
    <>
      View type:{' '}
      <select onChange={(ev) => setViewType(ev.target.value)}>
        <option id="list">list</option>
        <option id="timeline">timeline</option>
      </select>
    </>
  );
};

export default ViewTypeControl;
