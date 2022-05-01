import * as d3 from 'd3';


export const calcCircles = (activityData:any) => {
    
    let nodes = activityData.map((ad:any) => {
        
        let filesWithRadius = ad.files.map(f => {
            f.r = 5;
            return f;
        });

        let packedSibs = d3.packSiblings(filesWithRadius)
                    
        let parent = d3.packEnclose(packedSibs);

        

        ad.r = parent ? (parent.r + 3) : 5;
        ad.x = parent ? parent.x : 0;
        ad.y = parent ? parent.y : 0;

        if(packedSibs.length > 3){

            let simulation = d3
            .forceSimulation(packedSibs)
            .force('x', d3.forceX().x(ad.r/2))
            .force("y", d3.forceY(ad.r/2))
            .force("collide", d3.forceCollide(7))
            .stop();

            for (let i = 0; i < packedSibs.length; ++i) {
                simulation.tick(20);
            }

            packedSibs.forEach(p => {
                p.x = p.x - (ad.r/2);
                p.y = p.y - (ad.r/2);
            })
        }
        
       
        return ad;
    });

    
    return nodes;

}