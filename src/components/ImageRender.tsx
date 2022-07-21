import React, { useEffect, useState } from 'react';
import { InView } from 'react-intersection-observer';
import { readFileSync } from '../fileUtil';
import { useProjectState } from './ProjectContext';

const ImageRender = (props: any) => {
  const { src, autoLoad } = props;
  const [ { isReadOnly, selectedActivityURL, selectedArtifactEntry }, ] = useProjectState();
  const [imgData, setImgData] = useState<any>(null);

  useEffect(() => {
    if (autoLoad) {
      if (isReadOnly) {
        readFileSync(src)
          .then((res) => res.text())
          .then((img) => {
            setImgData(img);
          });
      } else {
        setImgData(src);
      }
    }
  }, [src]);

  return autoLoad ? (
    <>
      {imgData && (
        <div
          style={{
            display: 'inline-block',
            marginLeft: '20px',
            width: '750px',
            height: 'auto',
          }}
        >
          <img src={isReadOnly ? `data:image/png;base64,${imgData}` : src} alt="An attached image." />
        </div>
      )}
    </>
  ) : (
    <InView
      onChange={(inView, entry) => {
        if (
          (isReadOnly && inView) ||
          (isReadOnly && selectedActivityURL) ||
          (isReadOnly && selectedArtifactEntry)
        ) {
          readFileSync(src)
            .then((res) => res.text())
            .then((img) => {
              setImgData(img);
            });
        } else {
          setImgData(src);
        }
      }}
    >
      {({ inView, ref, entry }) => (
        <div ref={ref}>
          {inView && imgData && (
            <img src={isReadOnly ? `data:image/png;base64,${imgData}` : src} alt="An attached image." />
          )}
        </div>
      )}
    </InView>
  );
};

export default ImageRender;
