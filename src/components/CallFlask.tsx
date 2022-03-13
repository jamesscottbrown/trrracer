import React, { useEffect, useState } from 'react';

const DataDisplayer = (props: any) => {
  const [data, setData] = useState(null);
  //   get_all_google_extract
  console.log(props.user.projectData.title);
  const query = props.user.projectData.title;

  console.log('query', query);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `http://127.0.0.1:5000/get_all_sig_blobs/${query}`
      );
      //const response = await fetch(`http://127.0.0.1:5000/get_all_sig_blobs/evo`)

      const newData = await response.json();

      setData(newData);
    };
    fetchData();
  }, [props]);

  return data != null ? <div>has data</div> : <div></div>;
};

export default DataDisplayer;
