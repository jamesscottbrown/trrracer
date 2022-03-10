import React, { useEffect, useState } from 'react';
import { useProjectState } from './ProjectContext';

const EmailRender = (props:any)=> {

  const {title, setFragSelected} = props;

  const [state, dispatch] = useProjectState();
  const [emailData, setEmailData]= useState([""]);


  const sendToFlask = async() =>{

    const response = await fetch(`http://127.0.0.1:5000/parse_eml/${title}/${state.projectData.title}`);
    let newData = await response.text();
    setEmailData(newData.split('>').filter(f=> f != ""));
  } 

  sendToFlask()

  return(

    <div 
    style={{ height:'90%', overflow:'auto'}}>
    {emailData.map((m, i)=> (
        <div 
            key={`email-${i}`} 
            style={{display:'block'}}
            onMouseUp={()=> {
                if(setFragSelected){
                  let selObj = window.getSelection();
                  console.log('test',selObj)
                  setFragSelected(selObj?.toString())
                }else{
                  console.log('mouseup');
                }
              }}
        >{m}</div>
    ))}
    </div>

  )

}

export default EmailRender;

