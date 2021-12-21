import React, { useEffect, useState } from 'react';

const DataDisplayer = (props:any) => {
  const [data, setData] = useState(null);
//   get_all_google_extract

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`http://127.0.0.1:5000/get_all_sig_blobs/${props.user}`);
      //console.log('NEWDAT', response);
      const newData = await response.json();
      console.log('NEWDAT', newData);
      setData(newData);
    };
    fetchData();
  }, [props]);

  return (
    data != null ?
    <div>has data</div>
    : <div></div>
  
  )
}

export default DataDisplayer;