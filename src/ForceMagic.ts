import * as d3 from 'd3';
import { extent } from 'd3-array';
import { scaleTime } from 'd3-scale';
import {quadtree} from 'd3-quadtree';


const tickingAlgo = (nodes:any, xerr:any, yerr:any) => {
  var q,
    node,
    i = 0,
    n = nodes.length;

  var q = quadtree().addAll(nodes);

  // while (++i < n) {
  //   node = nodes[i];
  //   q.visit(collide(node));
  //   xerr = node.x - node.true_x;
  //   yerr = node.y - node.true_y;
  //   node.x -= xerr*0.005;
  //   node.y -= yerr*0.9;
  // }
  nodes = nodes.map((node:any) => {
    q.visit(collide(node));
    // console.log('node y', node.y)
    xerr = node.x - node.true_x;
    yerr = node.y - node.true_y;
    node.x -= xerr*0.005;
    node.y -= yerr*0.9;
    return node;
  })

  // svg.selectAll("circle")
  //     .attr("cx", function(d) { return d.x; })
  //     .attr("cy", function(d) { return d.y; });
  // console.log('nodes', nodes);
  return nodes;
}

function collide(node) {
  var r = node.radius,
    nx1,
    nx2,
    ny1,
    ny2,
    xerr,
    yerr;

  nx1 = node.x - r;
  nx2 = node.x + r;
  ny1 = node.y - r;
  ny2 = node.y + r;

  return function(quad, x1, y1, x2, y2) {
    console.log('quad',quad)
    if (quad.point && (quad.point !== node)) {
      var x = node.x - quad.point.x,
          y = node.y - quad.point.y,
          l = Math.sqrt(x * x + y * y),
          r = node.radius + quad.point.radius;
      if (l < r) {
        // we're colliding.
        var xnudge, ynudge, nudge_factor;
        nudge_factor = (l - r) / l * .4;
        xnudge = x*nudge_factor;
        ynudge = y*nudge_factor;
        node.x -= xnudge;
        node.y -= ynudge;
        quad.point.x += xnudge;
        quad.point.y += ynudge;
      }
    }
    return x1 > nx2
        || x2 < nx1
        || y1 > ny2
        || y2 < ny1;
  };
}

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

    let filtered = projectEntries.filter(f => f.files && f.files.length > 0);

    this.nodes = filtered.map((a: any) => {
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
      node.radius = a.r//splitBool ? 5 : this.circleScale(a.files.length);
      node.true_x = 0;
      node.true_y = this.yScale(new Date(a.date));
      node.x = 100;
      node.y = this.yScale(new Date(a.date));
      return node;
    });

    // this.simulation = d3
    //   .forceSimulation(this.nodes)
    //   .force('x', d3.forceX().x(width))
    //   .force(
    //     'y',
    //     d3.forceY().y((d) => this.yScale(new Date(d.date)))
    //   )
    //   .force(
    //     'collision',
    //     d3.forceCollide().radius((d: any) => d.radius + 3)
    //   );
    let errX = 0;
    let errY = 0;
    for (let i = 0; i < 500; ++i) this.nodes = tickingAlgo(this.nodes, errX, errY);
  }
}

export default ForceMagic;
