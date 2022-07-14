import React, { useEffect, useMemo, useState } from 'react';
import { Image } from '@chakra-ui/react';
import { InView, useInView } from 'react-intersection-observer';
import { URL } from 'url';
import { readFileSync } from '../fileUtil';
import { readProjectFile, useProjectState } from './ProjectContext';

const ImageRender = (props:any) => {

    const { src, onClick } = props;
    const [{isReadOnly, selectedActivityURL, selectedArtifactEntry}] = useProjectState();

    const [imgData, setImgData] = useState<any>(null);

    return (
        <InView onChange={(inView, entry) => {
          
          if((isReadOnly && inView) || (isReadOnly && selectedActivityURL) || (isReadOnly && selectedArtifactEntry)){
          readFileSync(src)
          .then((res) => res.text())
          .then((img) => {
          
            setImgData(img)
          })
          }else{
            setImgData(src);
          }
        }}>
        {({ inView, ref, entry }) => (
          <div ref={ref}>
           {
            (inView && imgData) && (
            <img src={isReadOnly ? `data:image/png;base64,${imgData}` : src} />
            )
           }
            
          </div>
        )}
      </InView>
        
    );
};

export default ImageRender;