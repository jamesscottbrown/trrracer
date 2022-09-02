class Bubbles {
  parent: any;

  bubbles: any;

  artifactTypes: any;

  constructor(parentGroup: any, artifactTypes: any, className: any) {
    this.parent = parentGroup;

    this.bubbles = parentGroup
      .selectAll(`circle.${className}`)
      .data((d: any) => [d])
      .join('circle')
      .classed(`${className}`, true);

    this.artifactTypes = artifactTypes;

    this.bubbles
      .attr('r', (d: any) => d.radius)
      .attr('cy', 0)
      .attr('cx', 0);
  }
}

export default Bubbles;
