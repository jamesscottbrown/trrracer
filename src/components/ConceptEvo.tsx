import React from 'react';
import { ConceptType } from "./types";

interface ConceptProps {
    concepts: ConceptType[];
}

const ConceptEvo = (props: ConceptProps) => {

    const {concepts} = props

    return (
        <div>THIS WHERE CONCEPTS GO</div>
     )
}

export default ConceptEvo