import * as d3 from 'd3';
import { extent } from 'd3-array';
import { scaleTime } from 'd3-scale';

class ForceMagic {
  circleScale: any;
  yScale: any;
  nodes: any;
  simulation: any;
  margin: any;

  constructor(
    projectEntries: any,
    width: number,
    height: number,
    splitBool: boolean
  ) {
    this.circleScale = splitBool
      ? null
      : d3
          .scaleLinear()
          .domain(d3.extent(projectEntries.map((m: any) => m.files.length)))
          .range([2, 20]);

    this.margin = height * .15;

    this.yScale = scaleTime()
      .range([0, height - this.margin])
      .domain(extent(projectEntries.map((e: any) => new Date(e.date))));

    this.nodes = projectEntries.map((a: any) => {
      const node = {};
      node.date = a.date;
      node.description = a.description;
      node.files = splitBool ? null : a.files;
      node.index = a.index;
      node.key_txt = a.key_txt;
      node.month = a.month;
      node.tags = a.tags;
      node.title = a.title;
      node.activityTitle = splitBool ? a.activityTitle : null;
      node.artifactType = splitBool ? a.artifactType : null;
      node.urls = a.urls;
      node.year = a.year;
      node.radius = splitBool ? 5 : this.circleScale(a.files.length);
      return node;
    });

    this.simulation = d3
      .forceSimulation(this.nodes)
      .force('x', d3.forceX().x(width))
      .force(
        'y',
        d3.forceY().y((d) => this.yScale(new Date(d.date)))
      )
      .force(
        'collision',
        d3.forceCollide().radius((d: any) => d.radius + 3)
      );

    for (let i = 0; i < 120; ++i) this.simulation.tick();
  }
}

export default ForceMagic;
