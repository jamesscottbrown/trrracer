class Bubbles {
  parent: any;
  bubbles: any;
  artifactTypes: any;

  constructor(
    parentGroup: any,
    artifactTypes: any,
    className: any,
  ) {
    this.parent = parentGroup;
    let backgroundBubbs = parentGroup
      .selectAll(`circle.background`)
      .data((d: any) => [d])
      .join('circle').classed(`background`, true);
      
      backgroundBubbs.attr('fill', '#fff')
      .attr('r', (d:any) => d.radius)
      .attr('cy', 0)
      .attr('cx', 0)
      .attr('fill-opacity', .1);

    this.bubbles = parentGroup
      .selectAll(`circle.${className}`)
      .data((d: any) => [d])
      .join('circle').classed(`${className}`, true);

    this.artifactTypes = artifactTypes;

    this.bubbles
      .attr('r', (d:any) => d.radius)
      // .attr('cy', (d: any) => d.y)
      // .attr('cx', (d: any) => d.x);
      .attr('cy', 0)
      .attr('cx', 0);

  }
}

export default Bubbles;
