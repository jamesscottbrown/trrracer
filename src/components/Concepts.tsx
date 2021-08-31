import { Button } from '@material-ui/core';
import React from 'react';
import { ConceptType, ProjectType, ProjectViewProps} from './types';

interface ConceptProps {
    concepts: ConceptType[];
}

const ConceptNav = (props:ConceptProps) => {

    const {concepts} = props;

    return(
        <>
        <div>
            <h2>Concepts</h2>
            <Button>Add New Concept</Button>
            {concepts ? concepts.map((con: ConceptType, i) => (
                <div
                    key={con.name}
                    style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 100px 100px',
                    }}
                    >
                        <h3>{con.name}</h3>
                        <Button>Merge</Button><Button>Delete</Button>
                    </div>
            )) : <div>no concepts</div>}
        </div>
        </>
    )

    // console.log('PROJECT DATA in concepts', this.projectData, this.projectData.concepts)

    // if(this.projectData){

    //     return(
    //         <div>CONCEPTS
        
    //         {this.projectData.map(con=> {
    //                     return <div>Test{con.name}</div>
    //                 })}
    //          </div>
    //     )
    // }else{
    //     return(
    //         <div>CONCEPTS DONT EXIST</div>
    //     )
    // }

};

export default ConceptNav;