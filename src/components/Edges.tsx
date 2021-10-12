import React from 'react';
import { useState } from 'react';
import { useProjectState } from './ProjectContext';
import { EdgeType } from './types';
import { Grid, Heading, Button, Badge } from '@chakra-ui/react';
import { FaEye, FaEyeSlash, FaPlus } from 'react-icons/fa';

const generateUniqueId = require('generate-unique-id');


interface EdgeProps {
    edges: EdgeType[]
}

const EdgeControl = (props:EdgeProps) => {

    const {edges} = props; 
    const [{ projectData }, dispatch] = useProjectState(); 

    const [showEdges, setShowEdges] = useState(false);

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
        {showEdges ? 
        
        <div>
        <Heading as="h5" >Associations Between Concepts<FaEyeSlash onClick={()=>{
          if(showEdges){ 
            setShowEdges(false);
          }else{ 
            setShowEdges(true);
          };
        }} style={{display:"inline"}}/></Heading>
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
            
            <div key={con.key}>
                <div style={{display:"inline"}}>
                    <Badge variant={"outline"}>{con.from}</Badge> ---> <Badge variant={"outline"}>{con.to}</Badge><br />
                    <span style={{fontSize: '10px'}}>{con.description}</span>
                    {/* <Button>Merge</Button> */}
                   
                </div> <Button onClick={()=> dispatch({ type: 'DELETE_EDGE', key: con.key })}>Delete</Button>

            </div>
      
        )) : <div>No Edges</div>}
    </div>

    : 

    <div>
        <Heading as="h5">Associations Between Concepts <FaEye onClick={()=>{
          if(showEdges){ 
            setShowEdges(false);
          }else{ 
            setShowEdges(true);
          };
        }} style={{display:"inline"}}/></Heading>
    </div>
    
    }

        </>
    )
};

export default EdgeControl;