import React, { useEffect, useMemo, useState } from 'react';
import { Image } from '@chakra-ui/react';
import { InView, useInView } from 'react-intersection-observer';
import { URL } from 'url';
import { readFileSync } from '../fileUtil';
import { readProjectFile, useProjectState } from './ProjectContext';


const ImageRender = (props:any) => {

    const { src, onClick } = props;
    const [{folderPath, isReadOnly}] = useProjectState();

    const [imgData, setImgData] = useState<any>(null);

    let end = src.split('.').at(-1);

    return (
        <InView onChange={(inView, entry) => {
          console.log(inView)
          if(isReadOnly){
          readFileSync(src).then((img) => {
            console.log('img', img.body);
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
            <img src={src} />
            )
           }
            
          </div>
        )}
      </InView>
        
    );
};

// const ImageRenderer = ({ url, thumb, width, height }) => {
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [isInView, setIsInView] = useState(false);
//   const imgRef = useRef();
//   useIntersection(imgRef, () => {
//     setIsInView(true);
//   });

//   const handleOnLoad = () => {
//     setIsLoaded(true);
//   };
//   return (
//     <div
//       className="image-container"
//       ref={imgRef}
//       style={{
//         paddingBottom: `${(height / width) * 100}%`,
//         width: '100%'
//       }}
//     >
//       {isInView && (
//         <>
//           <img
//             className={classnames('image', 'thumb', {
//               ['isLoaded']: !!isLoaded
//             })}
//             src={thumb}
//           />
//           <img
//             className={classnames('image', {
//               ['isLoaded']: !!isLoaded
//             })}
//             src={url}
//             onLoad={handleOnLoad}
//           />
//         </>
//       )}
//     </div>
//   );
// };

export default ImageRender;