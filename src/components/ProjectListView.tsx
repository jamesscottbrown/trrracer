import React, { useState, useEffect, lazy, Suspense } from 'react';
import { EntryTypeWithIndex } from './types';
const isElectron = true;
// let ActivityWrap;//import ActivityWrap from './ActivityWrap';
import { useProjectState } from './ProjectContext';

// if(isElectron){
//   import('./ActivityWrap').then((act) => ActivityWrap = act);
// }else{
//   import('./webComponents/ActivityWrap').then((act) => ActivityWrap = act);
// }

const ProjectListView = (ProjectPropValues: any) => {
  const { setViewType, viewType, width } = ProjectPropValues;
  const [{ 
    projectData, 
    selectedActivityURL, 
    filteredActivities,
    isReadOnly }] =
    useProjectState();

  const [usedEntries, setUsedEntries] = useState(filteredActivities);

  useEffect(() => {
    if (selectedActivityURL) {
      setUsedEntries(
        projectData.entries.filter(
          (f) => f.activity_uid === selectedActivityURL
        )
      );
    } else {
      setUsedEntries(filteredActivities);
    }
  }, [
    selectedActivityURL,
    projectData.entries.length,
    filteredActivities.length,
  ]);

  const [editable, setEditable] = useState<boolean[]>(
    Array.from(Array(projectData.entries.length), () => false)
  );

  useEffect(() => {
    if (editable.length === projectData.entries.length - 1) {
      // one more entry was added
      setEditable([...editable, true]);
    } else if (editable.length !== projectData.entries.length) {
      setEditable(Array.from(Array(projectData.entries.length), () => false));
    }
  }, [projectData.entries.length, filteredActivities.length]);

  const setEditableStatus = (index: number, isEditable: boolean) => {
    setEditable((oldEditable) =>
      oldEditable.map((d, i) => (i === index ? isEditable : d))
    );
  };

  const ActivityWrap = lazy(() => isReadOnly ? import("./webComponents/ActivityWrap") : import("./desktopComponents/ActivityWrap"));
  if(usedEntries.length === 1){
    return(
      <div style={{ 
        padding: '10px', 
        marginTop: '20px', 
        width: width ? width : '100%',
        float: 'right'
        }}>
            <div style={{width:50, height:50, float:'right'}}>{'x'}</div>
          <ActivityWrap
          key={`fr-${usedEntries[0].title}`}
          activityData={usedEntries[0]}
          editable={editable}
          setEditableStatus={setEditableStatus}
          setViewType={setViewType}
          viewType={viewType}
          index={0}
          /></div>
    )
   
  }
  return (
    <div style={{ 
      padding: '10px', 
      marginTop: '20px', 
      width: width ? width : '100%',
      float: 'right'
      }}>
        <Suspense fallback={<div>Loading... </div>}>
      { usedEntries.map((activityData: EntryTypeWithIndex, i: number) => (
          <ActivityWrap
          key={`fr-${activityData.title}-${activityData.index}-${i}`}
          activityData={activityData}
          editable={editable}
          setEditableStatus={setEditableStatus}
          setViewType={setViewType}
          viewType={viewType}
          index={i}
        />
      ))}
      
 </Suspense>
    </div>
  );
};
export default ProjectListView;
