import * as d3 from 'd3';
import { extent } from 'd3-array';
import { scaleTime } from 'd3-scale';

class ForceMagic {

    circleScale: any;
    yScale:any;
    nodes:any;
    simulation:any;
   
    constructor(projectEntries: any, width:number, height:number, splitBool:Boolean) {

        this.circleScale = splitBool? null : d3.scaleLinear()
                                .domain(d3.extent(projectEntries.map((m:any)=> m.files.length)))
                                .range([5, 20]);

        this.yScale = scaleTime()
                        .range([0, (height - 70)])
                        .domain(extent(projectEntries.map((e:any) => new Date(e.date))));

        this.nodes = projectEntries.map((a:any, i:number)=> {
          let node = {}
          node.date = a.date;
          node.description = a.description;
          node.files = a.files;
          node.index = a.index;
          node.key_txt = a.key_txt;
          node.month = a.month;
          node.tags = a.tags;
          node.title = a.title;
          node.urls = a.urls;
          node.year = a.year;
          node.radius = splitBool? 5 : this.circleScale(a.files.length);
          return node;
      });

        this.simulation = d3.forceSimulation(this.nodes)
            .force('x', d3.forceX().x(width / 2))
            .force('y', d3.forceY().y(d => this.yScale(new Date(d.date))))
            .force('collision', d3.forceCollide().radius((d:any) => d.radius + 1))

        for (var i = 0; i < 120; ++i) this.simulation.tick();


    }
   


  }
   


  export default ForceMagic;