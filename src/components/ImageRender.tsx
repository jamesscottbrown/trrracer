import React, { useEffect, useMemo, useState } from 'react';
import { Image } from '@chakra-ui/react';
import { InView, useInView } from 'react-intersection-observer';
import { URL } from 'url';
import { readFileSync } from '../fileUtil';
import { readProjectFile, useProjectState } from './ProjectContext';

const ImageRender = (props:any) => {

    const { src, onClick, autoLoad } = props;
    const [{isReadOnly, selectedActivityURL, selectedArtifactEntry}] = useProjectState();

    const [imgData, setImgData] = useState<any>(null);

    useEffect(()=> {
      if(autoLoad){
        if(isReadOnly){
          readFileSync(src)
          .then((res) => res.text())
          .then((img) => {
            console.log('image in logic',img)
            setImgData(img);
          })
        }else{
          setImgData(src);
        }
      }
    }, [src])

    return (
        autoLoad ? <React.Fragment>{
          imgData && (<div
          style={{display:'inline-block', marginLeft:'20px', float:'right', width:'700px', height:'auto'}}
          ><img src={isReadOnly ? `data:image/png;base64,${imgData}` : src} /></div>)
          }</React.Fragment>  :
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