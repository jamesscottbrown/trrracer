import * as d3 from 'd3';


export const calcCircles = (activityData:any) => {
    
    let nodes = activityData.map((ad:any) => {
        
        let filesWithRadius = ad.files.map(f => {
            f.r = (5 + (2 * Math.random()));
            return f;
        });

        let packedSibs = d3.packSiblings(filesWithRadius)
                    
        let parent = d3.packEnclose(packedSibs);


        // ad.r = parent ? (parent.r + 3) : 5;
        ad.x = parent ? parent.x : 0;
        ad.y = parent ? parent.y : 0;
           
        return ad;
    });

    
    return nodes;

}