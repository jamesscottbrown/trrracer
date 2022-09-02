import React, { useEffect, useState } from 'react';
import { Textarea, Button } from '@chakra-ui/react';
import ImageMarker, { Marker, MarkerComponentProps } from 'react-image-marker';
import { useProjectState } from './ProjectContext';
import { EntryType } from './types';

const CustomMarker = (props: MarkerComponentProps) => {
  const { note } = props;

  return (
    <div>
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: 10,
          backgroundColor: 'red',
        }}
      />
      <div
        style={{
          marginLeft: 6,
          backgroundColor: 'rgba(255, 255, 255, .6)',
          padding: 5,
          borderRadius: 5,
          display: 'inline',
        }}
        className="custom-marker"
      >
        {note}
      </div>
    </div>
  );
};

type MarkableImageProps = {
  imgPath: string;
  activity: EntryType;
  artifactIndex: number;
};

const MarkableImage = (props: MarkableImageProps) => {
  const [, dispatch] = useProjectState();
  const { imgPath, activity, artifactIndex } = props;

  const [markers, setMarkers] = useState([]);

  const artifactId = `${artifactIndex}-${activity.title}`;

  useEffect(() => {
    if (artifactIndex && activity.files[artifactIndex].markers) {
      setMarkers(activity.files[artifactIndex].markers);
    }
  }, [artifactId]);

  const [markerCoor, setMarkerCoor] = useState([0, 0]);
  const [note, setNote] = useState('add note');
  const [showNote, setShowNote] = useState(false);

  return (
    <div>
      <ImageMarker
        src={imgPath}
        markers={markers}
        onAddMarker={(marker: Marker) => {
          setShowNote(true);
          setMarkerCoor([marker.left, marker.top]);
        }}
        markerComponent={CustomMarker}
      />

      {showNote && (
        <div>
          <Textarea
            placeholder="Add note for marker"
            onChange={(e) => {
              const inputValue = e.target.value;
              setNote(inputValue);
            }}
          />
          <Button
            onClick={() => {
              const marker = {
                left: markerCoor[0],
                top: markerCoor[1],
                note,
              };
              const newMarkers = [...markers, marker];
              setMarkers(newMarkers);
              setNote('add note');
              setShowNote(false);
              dispatch({
                type: 'ADD_MARKS_TO_ARTIFACT',
                markers: newMarkers,
                activity,
                artifactIndex,
              });
            }}
          >
            ADD MARKER
          </Button>
        </div>
      )}
    </div>
  );
};

export default MarkableImage;
