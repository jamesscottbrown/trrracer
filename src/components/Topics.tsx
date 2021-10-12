import { Badge, Heading } from '@chakra-ui/layout';
import React, { useState, useEffect } from 'react';


const Topics = (props:any) => { 

    const {topics} = props;

    const splitTops = (topicBlob) => {
        let vals = topicBlob.split(" + ").map(m=>{
            return m.split('*');
        });
        console.log(vals);
        
        return vals;
    }

    return(
        <div>
            <Heading as="h5">Topics</Heading>
            {topics.map(top => (
                <div key={`top-${top[0]}`} style={{padding:"10px"}}>
                    <Heading as="h6" size="md">Topic {top[0]+1}</Heading>
                    {splitTops(top[1]).map(t=>(
                        <Badge style={{margin:"5px"}}>{t[1]}</Badge>
                    ))
                    }</div>
            ))}
        </div>
    )

}

export default Topics;