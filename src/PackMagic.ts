import * as d3 from 'd3';

export const calcCircles = (activityData: any) => {
  const nodes = activityData.map((ad: any) => {
    const filesWithRadius =
      ad.files.length > 0
        ? ad.files.map((f: any) => {
            f.r = 3 + 2 * Math.random();
            return f;
          })
        : [{ r: 3 + 2 * Math.random(), title: ad.title }];

    const packedSibs = d3.packSiblings(filesWithRadius);
    const parent = d3.packEnclose(packedSibs);

    ad.r = parent ? parent.r + 3 : 5;
    ad.x = parent ? parent.x : 0;
    ad.y = parent ? parent.y : 0;

    return ad;
  });

  return nodes;
};
