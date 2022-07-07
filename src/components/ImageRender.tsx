import React, { useEffect, useMemo, useState } from 'react';
import { Image } from '@chakra-ui/react';
import { InView } from 'react-intersection-observer';
import { URL } from 'url';
import { readFileSync } from '../fileUtil';
import { readProjectFile, useProjectState } from './ProjectContext';


const ImageRender = (props:any) => {

    const { src, onClick } = props;
    const [{folderPath, isReadOnly}] = useProjectState();

    const [imgData, setImgData] = useState<any>(null);

    let end = src.split('.').at(-1);

    // if(isReadOnly){
    //   useEffect(() => {
    //     readProjectFile(folderPath, src, end).then((img) => {
    //       console.log('img',img);
    //       setImgData(img)
    //     })
    //   }, [src]);
    // }
  
  
    return (
        <InView>
        {({ inView, ref, entry }) => (
          <div ref={ref}>
           {
            inView && (
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