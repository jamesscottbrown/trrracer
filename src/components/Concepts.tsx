import { Button } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import React from 'react';
import { useState } from 'react';
import { useProjectState } from './ProjectContext';
import { ConceptType, ProjectType, ProjectViewProps} from './types';

interface ConceptProps {
    concepts: ConceptType[];
}

const ConceptNav = (props:ConceptProps) => {

    const {concepts} = props; 
    const [{ projectData }, dispatch] = useProjectState(); 

    const [showForm, setShowForm] = useState(false);

    let fileName = "New Concept";

    function handleChange(event){
      fileName = event.target.value;
    }

    const addConceptForm = ()=>{
        console.log("TESTING");
    }

    const createConcept = ()=>{
        console.log('TEST THIS OUT');
        dispatch({ type: 'CREATE_CONCEPT', title: fileName })
    }

    return(
        <>
        <div>
            <h2>Concepts</h2>
            {showForm ? 
            <div>
            <Button
            onClick={() => {
                setShowForm(false)
                addConceptForm()}}
            >Cancel</Button>
            <TextField onChange={handleChange}></TextField><Button onClick={()=> createConcept()}>Add</Button>
            </div>
             :
            <Button
            onClick={() => {
                setShowForm(true)
                addConceptForm()}}
            >Add New Concept</Button>
        }
            
            {concepts ? concepts.map((con: ConceptType) => (
                <div
                    key={con.name}
                    style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 100px 100px',
                    }}
                    >
                        <h3>{con.name}</h3>
                        {/* <Button>Merge</Button> */}
                        <Button onClick={()=> dispatch({ type: 'DELETE_CONCEPT', title: con })}>Delete</Button>
                    </div>
            )) : <div>no concepts</div>}
        </div>
        </>
    )
};

export default ConceptNav;