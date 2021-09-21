import { Button } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import React, { useState, useEffect } from 'react';
import { useProjectState } from './ProjectContext';
import { ConceptType, ProjectType, ProjectViewProps} from './types';
import Merger from './MergeConceptForm';

interface ConceptProps {
    concepts: ConceptType[];
}

const ConceptNav = (props:ConceptProps) => {

    const {concepts} = props; 
    const [{ projectData }, dispatch] = useProjectState(); 

    const [showForm, setShowForm] = useState(false);
   
    let conceptList = concepts ? concepts.filter(f=>{
        let actionlist = f.actions.map(m=> m.action);
        return (actionlist.indexOf('deleted') === -1 && actionlist.indexOf('merged') === -1);
    }) : [];

    let fileName = "New Concept";
    let mergeName = "";
    let toName = "";

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
            <Button color="primary" onClick={() => {
                setShowForm(false)
                addConceptForm()}}
            >Cancel</Button>
            <TextField onChange={handleChange}>
                </TextField><Button onClick={()=> {
                    createConcept()
                    setShowForm(false)
                }}>Add</Button>
            </div>
             :
            <Button color="primary" onClick={() => {
                setShowForm(true)
                addConceptForm()}}
            >Add New Concept</Button>
            }
            
            {concepts ? concepts.filter(f=>{
                let actionlist = f.actions.map(m=> m.action);
                return (actionlist.indexOf('deleted') === -1 && actionlist.indexOf('merged') === -1);
            }).map((con: ConceptType, i) => (
                <div
                    key={con.name}
                    style={{
                    display: 'grid',
                    gridTemplateColumns: '200px 100px 100px',
                    }}
                    >
                    <h3>{con.name}</h3>
                    {/* <Button>Merge</Button> */}
                    <Button onClick={()=> dispatch({ type: 'DELETE_CONCEPT', title: con })}>Delete</Button>
                    <Merger conceptList={conceptList} concept={con} index={i} ></Merger>
                    
                </div>
            )) : <div>no concepts</div>}
        </div>
        </>
    )
};

export default ConceptNav;