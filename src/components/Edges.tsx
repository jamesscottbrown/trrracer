import React from 'react';
import { useState } from 'react';
import { useProjectState } from './ProjectContext';
import { EdgeType } from './types';
import { Grid, Heading, Button } from '@chakra-ui/react';

const generateUniqueId = require('generate-unique-id');


interface EdgeProps {
    edges: EdgeType[]
}

const EdgeControl = (props:EdgeProps) => {

    const {edges} = props; 
    const [{ projectData }, dispatch] = useProjectState(); 

    const [showForm, setShowForm] = useState(false);

    let toName = "to";
    let fromName = "from";
    let edgeDes = "";

    function handleChangeTo(event: any){
      toName = event.target.value;
    }

    function handleChangeFrom(event: any){
        fromName = event.target.value;
    }

    function handleChangeDescription(event: any){
        edgeDes = event.target.value;
    }

    const createEdge = ()=>{
        dispatch({ type: 'CREATE_EDGE', to: toName, from: fromName, description: edgeDes, key: generateUniqueId() })
    }

    return(
        <>
        <div>
            <h2>Associations Between Concepts</h2>
            {showForm ? 
            <div>
            <Button onClick={() => {
                setShowForm(false)}}
            >Cancel</Button>
             <form>
            <label>To:
                <input onChange={handleChangeTo} type="text" />
            </label>
            <label>From:
                <input onChange={handleChangeFrom} type="text" />
            </label>
            <label>What:
                <input onChange={handleChangeDescription} type="text" />
            </label>
            </form>
            <Button onClick={()=> {
                createEdge()
                setShowForm(false)
                }}>Add</Button>
            </div>
             :
            <Button onClick={() => {
                setShowForm(true)}}
            >Add New Edge</Button>
            }
            
            {edges ? edges.filter(f=>{
                let actionlist = f.actions.map(m=> m.action);
                return actionlist.indexOf('deleted') === -1;
            }).map((con: EdgeType,  i) => (
                <div
                    key={con.key}
                    style={{
                    display: 'grid',
                    gridTemplateColumns: '200px 100px 100px',
                    }}
                    >
                        <h3>{`${con.from} --> ${con.to}`}</h3>
                        <h5>{con.description}</h5>
                        {/* <Button>Merge</Button> */}
                        <Button onClick={()=> dispatch({ type: 'DELETE_EDGE', key: con.key })}>Delete</Button>
                    </div>
            )) : <div>no concepts</div>}
        </div>
        </>
    )
};

export default EdgeControl;