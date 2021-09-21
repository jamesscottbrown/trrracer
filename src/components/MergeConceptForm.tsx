import { Button } from '@mui/material'//'@material-ui/core';
import React, { useState } from 'react';
import { useProjectState } from './ProjectContext';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { ConceptType } from './types';

const Merger = (props: any) => {
   
    const {conceptList, concept, index} = props;
    const [{ projectData }, dispatch] = useProjectState();

    const [showMerge, setShowMerge] = useState(false);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
      console.log('SET ANCHOR EL', anchorEl);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };

    const [buttonText, setButtonText] = useState("Merge With"); //same as creating your state variable where "Next" is the default value for buttonText and setButtonText is the setter function for your state variable instead of setState
    const changeText = (text:string) => setButtonText(text);

    const [selectedConcept, setSelectedConcept] = useState(null);

    function handleChange(test: any){
        let  text = test != null ? test.name : "Merge With";
        changeText(text);
        setSelectedConcept(test);
        console.log('mergeNameChanged',test)
      }

    const mergeConceptInto = (fromCon: ConceptType)=>{
        console.log('MERGEEE new TEST', buttonText, selectedConcept, fromCon);
        let nameToMerge  = selectedConcept != null ? selectedConcept.name : null;
        if(nameToMerge  != null){
            setShowMerge(false);
            dispatch({ type: 'MERGE_CONCEPT', mergeName: nameToMerge, fromName: fromCon.name })

        }else{
            window.alert("Choose concept to merge with")
        }
        
    }

    return(
        <>
          { showMerge ? 
                <div>
                <Button color="primary" onClick={() => {
                    setShowMerge(false)
                    handleChange(null)
                    // addConceptForm()
                }
                }
                >Cancel</Button>
                <div>
                <Button
                    id="basic-button"
                    aria-controls="basic-menu"
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                >
                    {buttonText}
                </Button>
                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                    'aria-labelledby': 'basic-button',
                    }}
                >
                   { conceptList.map((c)=>  (
                        <MenuItem onClick={()=>{
                            handleChange(c);
                            handleClose()
                            }}>{c.name}</MenuItem>
                   ))
                    }
                </Menu>
                </div>
                
                <Button onClick={()=> {
                  //  setShowMerge(false)
                    mergeConceptInto(concept);
                    }}>Add</Button>
                </div>
                :
               
                    <Button 
                    color="primary" 
                    onClick={() => {
                        setShowMerge(true);
                    }}
                    >Merge Into</Button>
                }
        </>
    )
}

export default Merger;