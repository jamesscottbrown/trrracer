import { extent } from 'd3-array';
import { forceCollide, forceSimulation, forceX, forceY } from 'd3-force';
import { scaleLinear, scaleTime } from 'd3-scale';
import { EntryType } from './components/types';

class ForceMagic {
  circleScale: any;

  yScale: any;

  nodes: any;

  simulation: any;

  margin: any;

  constructor(projectEntries: any, width: number, height: number) {
    const ex = extent(projectEntries.map((m: any) => m.files.length));
    this.circleScale = scaleLinear()
      .domain([+(ex[0] || 0), +(ex[1] || 0)])
      .range([2, 20]);

    this.margin = height * 0.15;

    const ex2 = extent(projectEntries.map((e: any) => new Date(e.date)));
    this.yScale = scaleTime()
      .range([0, height - this.margin])
      .domain([(ex2[0] || new Date()) as Date, (ex2[1] || new Date()) as Date]);

    const filtered = projectEntries; // .filter(f => f.files && f.files.length > 0);

    this.nodes = filtered.map((a: any) => {
      return {
        date: a.date,
        description: a.description,
        files: a.files,
        index: a.index,
        key_txt: a.key_txt,
        month: a.month,
        tags: a.tags,
        title: a.title,
        activity_uid: a.activity_uid,
        // node.activityTitle = splitBool ? a.activityTitle : null;
        // node.artifactType = splitBool ? a.artifactType : null;
        activityTitle: null,
        artifactType: null,
        urls: a.urls,
        year: a.year,
        // node.radius = a.r//splitBool ? 5 : this.circleScale(a.files.length);
        radius: a.r,
        true_y: this.yScale(new Date(a.date)),
        true_x: 0,
        y: this.yScale(new Date(a.date)),
        x: 0,
      };
    });

    this.simulation = forceSimulation(this.nodes)
      .force('x', forceX().x(width / 2))
      .force(
        'y',
        forceY()
          .y((d) => this.yScale(new Date((d as EntryType).date)))
          .strength(1)
      )
      .force(
        'collision',
        forceCollide().radius((d: any) => d.radius + 2)
      )
      .stop();

    for (let i = 0; i < 120; i += 1) this.simulation.tick();
  }
}

export default ForceMagic;
