import React from 'react';
import { Image } from '@chakra-ui/react';
import { InView } from 'react-intersection-observer';

const ImageRender = (props:any) => {

    const { src, onClick } = props;

    return (
        <InView>
        {({ inView, ref, entry }) => (
          <div ref={ref}>
           {
            inView && (
            <Image
                src={src}
                onClick={() => onClick}
            />
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