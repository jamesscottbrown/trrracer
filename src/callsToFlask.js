import React, { useEffect, useState } from 'react';

export default function DataDisplayer(props) {
  const [data, setData] = useState(null);
//   get_all_google_extract

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`http://127.0.0.1:5000/get_all_google_extract/${props.user}/`);
      const newData = await response.json();
      console.log('NEWDAT', newData);
      setData(newData);
    };
    fetchData();
  }, [props.user]);
  if (data) {
    return <div>{data}</div>;
  } else {
    return null;
  }
}