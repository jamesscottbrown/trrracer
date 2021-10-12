import React, { useState, useEffect } from 'react';
import { useProjectState } from './ProjectContext';
import { ConceptType, ProjectType, ProjectViewProps} from './types';
import Merger from './MergeConceptForm';

import {
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Input
  } from "@chakra-ui/react"

  import {Button, Heading} from "@chakra-ui/react"

  import ChevronDownIcon from "@chakra-ui/icon"


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
            <Heading as="h3">Concepts</Heading>
            {showForm ? 
            <div>
       
                <form>
                <Button onClick={() => {
                setShowForm(false)
                addConceptForm()}}
            >Cancel</Button>
                <label>
                    {/* <input type="text" onChange={handleChange}/> */}
                    <Input id="name" placeholder="Concept Name" onChange={handleChange}/>
                    <Button onClick={()=> {
                    createConcept()
                    setShowForm(false)
                }}>Add</Button>
                </label>
                </form>
                
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
                    >
                    {/* <h3>{con.name}</h3>
                    {/* <button>Merge</button> */}
                    {/* <button onClick={()=> dispatch({ type: 'DELETE_CONCEPT', title: con })}>Delete</button>
                    <Merger conceptList={conceptList} concept={con} index={i} ></Merger> */} 
                    
                    <Menu>
                    <MenuButton    
                    px={4}
                    py={2}
                    transition="all 0.2s"
                    borderRadius="md"
                    borderWidth="1px"
                    bg="gray.200"
                    margin="3px"
                    _hover={{ bg: "gray.300" }}
                    _expanded={{ bg: "blue.400" }}
                    _focus={{ boxShadow: "outline" }}
                    >{con.name}</MenuButton>
                    <MenuList>
                        <MenuItem><Merger conceptList={conceptList} concept={con} index={i} ></Merger></MenuItem>
                        <MenuItem onClick={()=> dispatch({ type: 'DELETE_CONCEPT', title: con })}>Delete</MenuItem>
                    </MenuList>
                    </Menu>


                </div>

       
            )) : <div>no concepts</div>}
        </div>
        </>
    )
};

export default ConceptNav;