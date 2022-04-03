import React, {useState} from 'react';

import { 
    Input, 
    InputGroup, 
    InputRightElement, 
    Button, 
    Popover,
    PopoverTrigger, 
    PopoverContent, 
    PopoverArrow, 
    PopoverBody } from '@chakra-ui/react';

import { Search2Icon } from '@chakra-ui/icons';
import { useProjectState } from './ProjectContext';
import { MdCancel } from "react-icons/md";



interface QueryViewProps{
  setViewType: (viewType: string) => void;
  filteredActivites: any;
}

const HoverTitle = (props:any) => {

    const {title, entry, match, setViewType, matches} = props;

    // console.log('match',match)

    const fileIndex = match.fileType === 'gdoc' ? entry.files.map(m=> m.title).indexOf(match.title) : match['file-index'];

    const [showPopover, setShowPopover] = useState(false);
    const [{}, dispatch] = useProjectState();

    const closePopover = () => {
      setShowPopover(false);
    };

    return (
        <React.Fragment>
               {showPopover ? (
                <Popover isOpen={showPopover} onClose={closePopover}>
                    <PopoverTrigger>
                        <div>
                        {title}
                        </div>
                  </PopoverTrigger>
                  <PopoverContent bg="white" color="gray">
                    <PopoverArrow bg="white" />
                    <PopoverBody>
                      <Button
                        onClick={() => {
                          setViewType('detail view');
                          dispatch({
                            type: 'SELECTED_ARTIFACT',
                            selectedArtifactEntry: entry,
                            selectedArtifactIndex: fileIndex,
                          });
                          dispatch({
                              type:'UPDATE_GO_BACK',
                              goBackView: 'query',
                              filterQuery: matches.map(m=> m.entry.title)
                          })
                        }}
                      >
                        See artifact in detail.
                      </Button>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              ) : (
                
                <div
                onMouseEnter={() => setShowPopover(true)}
                >
                {title}
                </div>
              )}
        </React.Fragment>
    )

}

const QueryView = (props: any) => {
    const {setViewType, projectData} = props;
    const [{query}, dispatch] = useProjectState();

    const matches = [];
    projectData.entries.forEach((ent:any) => {
        let tempText = query.textMatch.filter(t => t['entry-title'] === ent.title);
        if(tempText.length > 0){
            tempText.map((tt)=> {
                let txtArray = tt.text.split('. ')
                let indexArray = [];
                txtArray.forEach((t, i)=> {
                    if(t.includes(query.term)){
                        let con = []
                        if(i > 0){
                            con.push({style:null, context:txtArray[(i-1)]})
                        }
                        con.push({style:'bold', context:txtArray[i]})
                        if(i < txtArray.length - 1){
                            con.push({style:null, context:txtArray[(i+1)]})
                        }
                        indexArray.push(con)
                    }
                });
                tt.context = indexArray;
                return tt;
            })
        }
        
        let tempG = ent.files.filter((fg:any) => fg.fileType === 'gdoc' && query.googMatch.map(gm => gm.fileId).includes(fg.fileId))
        
        if(tempG.length > 0){
            tempG.map((tt)=> {
                
                let test = query.googMatch.filter(f=> f.fileId === tt.fileId)[0];
                let txtArray = test.textBlock.split('. ');
                let indexArray = [];

                txtArray.forEach((t, i)=> {
                    if(t.includes(query.term)){
                        let con = []
                        if(i > 0){
                            con.push({style:null, context:txtArray[(i-1)]})
                        }
                        con.push({style:'bold', context:txtArray[i]})
                        if(i < txtArray.length - 1){
                            con.push({style:null, context:txtArray[(i+1)]})
                        }
                        indexArray.push(con)
                    }
                });
                tt.context = indexArray;
               
                return tt;
            })
        }
       
        if(tempText.length > 0 || tempG.length > 0){
            const entM = {entry: ent, textMatch:tempText, googMatch:tempG}
            matches.push(entM);
        }        
    });


    console.log('matches', matches, matches.map(m=> m.entry.title))


    // dispatch({
    //     type:'UPDATE_FILTER_QUERY',
    //     filterQuery: matches.map(m=> m.entry.title)
    // })

    return (

        <div>
            <div
            style={{padding:5, position:'absolute', top:'-20px', right:'10px', zIndex:'1000', cursor:'pointer'}}
            onClick={()=> {
                setViewType('overview')
                dispatch({
                    type:'UPDATE_GO_BACK',
                    goBackView: 'overview',
                    filterQuery: null
                })
            }}
            >
            <MdCancel size={30}/>
            </div>
            <div style={{padding:5, overflowY:'auto'}}>
                {
                matches.map((m:any, i:number)=> (
                    <div key={`match-${i}`}>
                      
                        <div style={{fontSize:18, fontWeight:700, marginTop:30}}>
                            {m.entry.title}
                            </div>
                        {
                            m.textMatch.length > 0 && (
                                m.textMatch.map((tm, j) => (
                                    <div
                                    style={{marginTop:10}} 
                                    key={`tm-${j}`}>
                                        <HoverTitle title={tm['file-title']} entry={m.entry} match={tm} setViewType={setViewType} matches={matches} />
                                       
                                        <div>
                                            {
                                                tm.context.map(c=> (
                                                    <div>
                                                        {
                                                            c.map(m=> (
                                                                <span style={{
                                                                    fontSize:11,
                                                                    fontWeight: m.style ? 700 : 400,
                                                                    fontStyle:'italic',
                                                                    backgroundColor: m.style ? 'yellow' : '#ffffff',
                                                                }}>{m.context}{'. '}</span>
                                                            ))
                                                        }
                                                    </div>
                                                   
                                                ))
                                            }
                                        </div>
                                    </div>
                                ))
                        )}
                        {
                            m.googMatch.length > 0 && (
                                m.googMatch.map((gm, j)=> (
                                    <div 
                                    style={{marginTop:10}}
                                    key={`gm-${j}`}>
                                        <HoverTitle title={gm.title} entry={m.entry} match={gm} setViewType={setViewType} />
                                        <div>
                                            {
                                                gm.context.map((c, k)=> (
                                                    <div key={`in-gm-${k}`}>
                                                        {
                                                            c.map((m, l)=> (
                                                                <span 
                                                                key={`span-${l}`}
                                                                style={{
                                                                    fontSize:11,
                                                                    fontWeight: m.style ? 700 : 400,
                                                                    fontStyle:'italic',
                                                                    backgroundColor: m.style ? 'yellow' : '#ffffff',
                                                                }}>{m.context}{'. '}</span>
                                                            ))
                                                        }
                                                    </div>
                                                    
                                                ))
                                                }
                                        </div>
                                    </div>
                                ))
                            )
                        }
                    </div>
                ))
                }
            </div>
            
        </div>
    );
};

export default QueryView;
