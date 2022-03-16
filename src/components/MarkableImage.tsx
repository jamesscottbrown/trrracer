import path from 'path';
import React, { useEffect, useState } from 'react';


import {
  Image,
  Box,
  Textarea,
  Button
} from '@chakra-ui/react';
import {IoIosFlag} from 'react-icons/fa'

import ImageMarker, { Marker, MarkerComponentProps } from 'react-image-marker';
import { useProjectState } from './ProjectContext';

 
const CustomMarker = (props: MarkerComponentProps) => {
    return (
        <div><div style={{width:10, height:10, borderRadius:10, backgroundColor:'red'}}></div>
        <div style={{marginLeft:6, backgroundColor:'rgba(255, 255, 255, .6)', padding:5, borderRadius:5, display:'inline'}} className="custom-marker">{`${props.note}`}</div></div>
    );
};

const MarkableImage = (props:any) => {
    const [{}, dispatch] = useProjectState();
    const {imgPath, activity, artifactIndex} = props;
   console.log(imgPath, activity, artifactIndex)
    const [markers, setMarkers] = useState([])
    
    let artifactId = `${artifactIndex}-${activity.title}`;
    console.log('testing', artifactId);

    useEffect(() => {
        if(artifactIndex && activity.files[artifactIndex].markers){
            console.log('this is going to run forever');
            setMarkers(activity.files[artifactIndex].markers)
        }
    }, [artifactId])

    
    const [markerCoor, setMarkerCoor] = useState([0, 0])
    const [note, setNote] = useState('add note');
    const [showNote, setShowNote] = useState(false);

    return (
        <div>
            <ImageMarker
                src={imgPath}
                markers={markers}
                onAddMarker={(marker: Marker) => {
                    setShowNote(true)
                    setMarkerCoor([marker.left, marker.top])
                }}
                markerComponent={CustomMarker}
            />

            {
                showNote && (<div>
                    <Textarea 
                    placeholder='Add note for marker' 
                    onChange={(e)=>{
                        let inputValue = e.target.value
                        setNote(inputValue);
                    }}/>
                    <Button onClick={()=>{
                        let marker = {}
                        marker.left = markerCoor[0];
                        marker.top = markerCoor[1];
                        marker.note = note;
                        let newMarkers = [...markers, marker];
                        setMarkers(newMarkers)
                        setNote('add note')
                        setShowNote(false)
                        dispatch({type:'ADD_MARKS_TO_ARTIFACT', markers:newMarkers, activity:activity, artifactIndex:artifactIndex})
                    }}>{'ADD MARKER'}</Button>
                    
                </div>)

            }

        </div>
    )
}

export default MarkableImage;