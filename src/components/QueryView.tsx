import React from 'react';

import { Input, InputGroup, InputRightElement, Button } from '@chakra-ui/react';

import { Search2Icon } from '@chakra-ui/icons';
import { useProjectState } from './ProjectContext';
import { MdCancel } from "react-icons/md";
import { relative } from 'path';


interface QueryViewProps{
  setViewType: (viewType: string) => void;
  filteredActivites: any;
}

const QueryView = (props: any) => {
    const {setViewType, projectData} = props;
    const [{query}] = useProjectState();
    console.log(projectData.entries, query.textMatch, query.googMatch);

    const matches = [];
    projectData.entries.forEach((ent:any) => {
        let tempText = query.textMatch.filter(t => t['entry-title'] === ent.title);
        if(tempText.length > 0){
            tempText.map((tt)=> {
                let txtArray = tt.text.split('. ')
                let indexArray = [];
                txtArray.forEach((t, i)=> {
                    if(t.includes(query.term)){
                        
                        let con = []
                        if(i > 0){
                            
                            con.push({style:null, context:txtArray[(i-1)]})
                        }
                        
                        con.push({style:'bold', context:txtArray[i]})
                        if(i < txtArray.length - 1){
                            
                            con.push({style:null, context:txtArray[(i+1)]})
                        }
                        indexArray.push(con)
                    }
                });
                tt.context = indexArray;
                return tt;
            })
        }
        let tempG = ent.files.filter((fg:any) => fg.fileType === 'gdoc' && query.googMatch.map(gm => gm[0]).includes(fg.fileId))
       
        if(tempText.length > 0 || tempG.length > 0){
            const entM = {entry: ent, textMatch:tempText, googMatch:tempG}
            matches.push(entM);
        }        
    });

    console.log('mat',matches);

    return (
        <div>
            <div
            style={{padding:5, float:'right'}}
            onClick={()=> setViewType('timeline')}
            >
            <MdCancel size={30}/>
            </div>
            <div style={{padding:5}}>
                {
                matches.map((m:any, i:number)=> (
                    <div key={`match-${i}`}>
                        <div style={{fontSize:18, fontWeight:700}}>
                            {m.entry.title}
                            </div>
                        {
                            m.textMatch.length > 0 && (
                                m.textMatch.map((tm, j) => (
                                    <div key={`tm-${j}`}>
                                        <div>{tm['file-title']}</div>
                                        <div>
                                            {
                                                tm.context.map(c=> (
                                                    <div>
                                                        {
                                                            c.map(m=> (
                                                                <span style={{
                                                                    fontSize:11,
                                                                    fontWeight: m.style ? 700 : 400,
                                                                    fontStyle:'italic',
                                                                    backgroundColor: m.style ? 'yellow' : '#ffffff',
                                                                }}>{m.context}{'. '}</span>
                                                            ))
                                                        }
                                                    </div>
                                                   
                                                ))
                                            }
                                        </div>
                                    </div>
                                ))
                        )}
                        {
                            m.googMatch.length > 0 && (
                                m.googMatch.map((gm, j)=> (
                                    <div key={`gm-${j}`}>
                                        <div>{gm.title}</div>
                                        <div>
                                            {
                                                "test"
                                            }
                                        </div>
                                    </div>
                                ))
                            )
                        }
                    </div>
                ))
                }
            </div>
            
        </div>
    );
};

export default QueryView;
