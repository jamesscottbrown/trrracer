export const sendToFlask = async (call, path) => {
  const response = await fetch(`http://127.0.0.1:5000/${call}/${path}`);

  return response.json();

  // dispatch({ type: 'CREATED_GOOGLE_IN_ENTRY', newProjectData: newData });
};
