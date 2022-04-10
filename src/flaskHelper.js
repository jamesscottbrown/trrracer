export const sendToFlask = async (path) => {

    const response = await fetch(
      `http://127.0.0.1:5000/get_all_sig_blobs/${path}`
    );
    
    return response.json();

    

   // dispatch({ type: 'CREATED_GOOGLE_IN_ENTRY', newProjectData: newData });
  };