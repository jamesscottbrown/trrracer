import path from 'path';
import React, { useState } from 'react';

import {
  Image,
  Box
} from '@chakra-ui/react';
import ImageMarker, { Marker } from 'react-image-marker';


const MarkableImage = (props:any) => {

    const {imgPath} = props;

    //Define the markers
const [markers, setMarkers] = useState(
    [{top: 10, //10% of the image relative size from top
        left: 50, //50% of the image relative size from left
    },]);

    return (
        <div>
            <ImageMarker
                src={imgPath}
                markers={markers}
                onAddMarker={(marker: Marker) => setMarkers([...markers, marker])}
            />      
        </div>
    )
}

export default MarkableImage;