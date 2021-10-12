import React, { useState, useEffect } from 'react';
import { useProjectState } from './ProjectContext';
import { ConceptType, ProjectType, ProjectViewProps} from './types';
import Merger from './MergeConceptForm';

import {
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Input,
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
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

    const [value, setValue] = React.useState("New Concept")
    const handleChange = (event) => setValue(event.target.value)
   
    let conceptList = concepts ? concepts.filter(f=>{
        let actionlist = f.actions.map(m=> m.action);
        return (actionlist.indexOf('deleted') === -1 && actionlist.indexOf('merged') === -1);
    }) : [];



    const addConceptForm = ()=>{
        console.log("TESTING");
    }

    const createConcept = ()=>{
        console.log('TEST THIS OUT');
        dispatch({ type: 'CREATE_CONCEPT', title: value })
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
                    <Input value={value} placeholder={value} onChange={handleChange}/>
                    <Button onClick={()=> {
                    createConcept()
                    setShowForm(false)
                }}>Add</Button>
                </label>
                </form>
                
            </div>
             :
            <Button bg="blue.400" onClick={() => {
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
                        bg="gray.100"
                        margin="3px"
                        _hover={{ bg: "gray.300" }}
                        _expanded={{ bg: "blue.400" }}
                        _focus={{ boxShadow: "outline" }}
                        >{con.name}</MenuButton>
                    <MenuList>
                        {/* <MenuItem><Merger conceptList={conceptList} concept={con} index={i} ></Merger></MenuItem> */}
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