import React, { useState } from 'react';
import {
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Button,
  UnorderedList,
  ListItem,
  Textarea,
} from '@chakra-ui/react';

import * as d3 from "d3";
import CenterFileRender from './centerFileRender';
import { useProjectState } from './ProjectContext';

const ActivitytoThread = (props:any) => {

    const [{ researchThreads }, dispatch] = useProjectState();

    const {thread, threadIndex, activity, activityIndex} = props;
    const [showDesc, setShowDesc] = useState(false);
    const [threadRat, setThreadRat] = useState(null);

    let handleDescriptionChange = (e) => {
        let inputValue = e.target.value
        setThreadRat(inputValue)
    }

    return(
        <Box key={`t-${threadIndex}`} 
            style={{border:"1px solid gray", borderRadius:"5px", cursor:"pointer", textAlign:"center"}}>
            <div onClick={()=> setShowDesc(true)}>{`Add to "${thread.title}"`}</div>
            {
                showDesc && (
                    <>
                    <Textarea
                        placeholder='Why are you including this?'
                        onChange={handleDescriptionChange}
                    ></Textarea>
                    <Button
                    onClick={()=> {
                        setShowDesc(false);
                        dispatch({type: "ADD_ACTIVITY_TO_THREAD", activity: activity, rationale:threadRat, activityIndex: activityIndex, threadIndex: threadIndex})}}
                    >{"Add"}</Button>
                    </>
                )
            }
        </Box>
    )
}

const Activity = (activityProps: any) => {

    const { activity, folderPath, index } = activityProps;
    const [{ projectData, highlightedTag, researchThreads }, dispatch] = useProjectState();

    const [seeThreadAssign, setSeeThreadAssign] = useState(false);

    const colorVar = activity.tags.indexOf(highlightedTag) > -1 ? '#FFFCBB' : '#F5F5F5';
   
    return(
        <Popover trigger="hover">
            <PopoverTrigger>
                <Box key={`${activity.title}-${index}`} w={50} marginTop={2} className={`activity`}>
                    <CenterFileRender key={`cfr-${activity.title}-${index}`} fileArray={activity.files} folderPath={folderPath} bgColor={colorVar}></CenterFileRender>
                </Box>
            </PopoverTrigger>
            <PopoverContent bg='white' color='gray'>
                <PopoverArrow bg='white' />
                <PopoverHeader><span style={{fontWeight:600}}>{`${activity.title}`}</span>
                <span style={{display:'block'}}>{activity.date}</span>
                </PopoverHeader>
                <PopoverBody>

                   { seeThreadAssign ?
                    <div>
                    {
                        (researchThreads && researchThreads.research_threads.length > 0) ?
                        researchThreads.research_threads.map((rt:any, tIndex:number)=> (
                            <React.Fragment key={`rt-${tIndex}`}>
                                <ActivitytoThread thread={rt} threadIndex={tIndex} activity={activity} activityIndex={index}/>
                            </React.Fragment>
                            
                        ))
                        : <span>{"no threads yet"}</span>
                    }
                    </div> :
                    <div>
                    <span style={{display:'block'}}>{"Artifacts:"}</span>
                    <UnorderedList>
                        {
                        activity.files.map((f, i)=>(
                            <ListItem key={`f-${f.title}-${i}`}>{f.title}</ListItem>
                        ))
                        }
                    </UnorderedList>
                    </div>
}
                  
                </PopoverBody>
                <PopoverFooter>
                    {
                        seeThreadAssign ? 
                        <Box>
                            <Button onClick={()=> setSeeThreadAssign(false)}>{"cancel"}</Button>
                        </Box> :
                        <Button onClick={()=> setSeeThreadAssign(true)}>{"Add this tag to a thread."}</Button>
                    }
                </PopoverFooter>
            </PopoverContent>
        </Popover>
       
    )
}

export default Activity;