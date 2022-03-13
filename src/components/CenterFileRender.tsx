import React from 'react';

import * as d3 from 'd3';
import path from 'path';

const CenterFileRender = (fileArrayProps: any) => {
  const { fileArray, folderPath, bgColor, numRendered } = fileArrayProps;

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

  const getHeight = (previousValue, currentValue) =>
    ++previousValue + ++currentValue;

  const getSvgHeight = () => {
    // let fileH = fileArray.map(m => getRectHeight(m))
    const fileH = fileArray.map((m) => dimensionCheck('height', m.fileType));
    const fa = fileH.reduce(getHeight, 0);
    return fa;
  };

  React.useEffect(() => {
    const svgEl = d3.select(svgRef.current);
    // svgEl.selectAll("*").remove(); // Clear svg content before adding new elements

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

    // let gdocG = typeGroups.filter(g => g.fileType === 'gdoc');

    // if(!gdocG.empty()){

    //     let emR = gdocG.selectAll('rect.em').data(d => {
    //         return d.emphasized}).join('rect').classed('em', true);
    //
    //     // emR.attr('width', 30).attr('height', 3);
    // }
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
};

export default CenterFileRender;
