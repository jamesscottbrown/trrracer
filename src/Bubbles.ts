import { useProjectState } from "./components/ProjectContext";

class Bubbles {
  
    parent:any;
    bubbles:any;
    artifactTypes: any;
   
    constructor(parentGroup: any, highlighted:Boolean, splitBubbs:Boolean, artifactTypes:any) {
        
        this.parent = parentGroup;
        this.bubbles =  parentGroup.selectAll('circle').data(d => [d]).join('circle');
       
        this.artifactTypes = artifactTypes;
            
        this.bubbles
        .attr('r', (d:any)=> d.radius)
        .attr('cy', (d:any)=> d.y)
        .attr('cx', (d:any)=> d.x)

        if(highlighted){
            this.bubbles.attr('fill', (d:any)=> d.color);
         
        }else{
          this.bubbles.attr('fill', 'gray').attr('fill-opacity', .25);
        }
    }
    
  
    
    
  }

  export default Bubbles;