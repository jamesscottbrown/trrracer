import React, { createContext, useContext, useReducer } from 'react';
import { ProjectViewProps } from './types';

const ConceptNav = (ProjectPropValues: ProjectViewProps) => {

    const {projectData} = ProjectPropValues;

console.log('projectData in concepts', projectData)
return(
    <div id="concepts">
        {projectData.concepts[0]}
    </div>
)
}

export default ConceptNav;