import React from 'react';
import * as d3 from 'd3';
import path from 'path';
import AttachmentPreview from './AttachmentPreview';
import { openFile } from '../fileUtil';

const LargeFileRender = (props:any) => {
  const { fileArray, folderPath, bgColor, numRendered, activity } = props;

  return (
    <div>
       {activity && (<div style={{fontSize:13, fontWeight:600, width: 250}}>{activity.title}</div>)}
      <div
      style={{
        backgroundColor: bgColor,
        width: 250,
        borderRightWidth: 1,
        borderRightColor: 'black',
        paddingRight: 5,
      }}
      >
       
        {
          fileArray.map((fa:any, i:number)=> (
            <div
            key={`file-${i}`} style={{marginBottom:10}}>
              {/* <span>{fa.title}</span> */}
              <AttachmentPreview folderPath={folderPath} title={fa.title} openFile={openFile}/>
            </div>
          ))
        }
      </div>

    </div>

  )
}

const SmallFileRender = (props:any) => {
  const { fileArray, folderPath, bgColor, numRendered } = props;
  const dimensionCheck = (dim: string, fType: string) => {
    if (dim === 'width') {
      if (fType === 'url') {

        return numRendered > 60 ? 45 : 67;
      }
      return numRendered > 60 ? 40 : 60;
    }
    if (fType === 'eml') {
      return numRendered > 60 ? 15 : 22;
    }
    if (fType === 'url') {
      return numRendered > 60 ? 5 : 7;
    }
    return numRendered > 60 ? 30 : 45;
  };

  const svgRef = React.useRef(null);

  const getRectHeight = (fileD: any) => {
    if (fileD.fileType === 'eml') {
      return 15;
    }
    if (fileD.fileType === 'url') {
      return 5;
    }
    return 30;
  };

  const getHeight = (previousValue:any, currentValue:any) =>
    ++previousValue + ++currentValue;

  const getSvgHeight = () => {
    // let fileH = fileArray.map(m => getRectHeight(m))
    const fileH = fileArray.map((m) => dimensionCheck('height', m.fileType));
    const fa = fileH.reduce(getHeight, 0);
    return fa;
  };

  React.useEffect(() => {
    const svgEl = d3.select(svgRef.current);

    const typeData = d3
      .groups(fileArray, (f) => f.fileType)
      .flatMap((m) => m[1]);

    const typeGroups = svgEl
      .selectAll('g')
      .data(typeData)
      .enter()
      .append('g')
      .attr('class', (c) => c.fileType);

    const rects = typeGroups
      .selectAll('rect')
      .data((d) => [d])
      .join('rect');
    rects
      .attr('width', (d) => dimensionCheck('width', d.fileType))
      .attr('height', (h) => dimensionCheck('height', h.fileType));

    rects.attr('fill', (d) => (d.fileType === 'url' ? '#3A9BDC' : '#AAAAAA'));
    rects.attr('x', (d) => (d.fileType === 'url' ? 0 : 20));

    typeGroups.attr('transform', (d, i, n) => {
      const space = n
        .filter((f, j) => j < i)
        .map((m) => d3.select(m).select('rect').attr('height'));
      if (space.length > 0) {
        return `translate(0, ${space.reduce(getHeight, 0)})`;
      }
      return `translate(0, 0)`;
    });
    const imageTypes = ['png', 'jpg', 'gif'];

    const imagesPng = typeGroups.filter(
      (f) => imageTypes.indexOf(f.fileType) > -1
    );
    if (!imagesPng.empty()) {
      imagesPng.each((im, i, n) => {
        const extension = im.fileType;
        const newName = im.title.split(`.${extension}`);

        const newPath = `thumbs/${newName[0]}.png`;

        const defs = d3
          .select(n[i])
          .append('defs')
          .append('pattern')
          .attr('id', `image${im.title}`)
          .attr('width', 10)
          .attr('height', 10)
          .append('image')
          .attr('xlink:href', `file://${path.join(folderPath, newPath)}`)
          .attr('width', 30)
          .attr('height', 30);

        d3.select(n[i])
          .select('rect')
          .attr('fill', `url(#image${im.title})`)
          .style('width', '100%')
          .style('padding-bottom', '92%');
      });
    }

  }, [fileArray]);

  return (
    <div
      style={{
        backgroundColor: bgColor,
        width: 50,
        borderRightWidth: 1,
        borderRightColor: 'black',
        paddingRight: 5,
      }}
    >
      <svg width={44} height={getSvgHeight()} ref={svgRef} />
    </div>
  );

}

const CenterFileRender = (fileArrayProps: any) => {
  const { fileArray, folderPath, bgColor, numRendered, activity } = fileArrayProps;
  
  return (
    numRendered > 50 ? 
    <SmallFileRender fileArray={fileArray} folderPath={folderPath} bgColor={bgColor} numRendered={numRendered}/>
    :<LargeFileRender activity={activity} fileArray={fileArray} folderPath={folderPath} bgColor={bgColor} numRendered={numRendered} />
  )};

export default CenterFileRender;
