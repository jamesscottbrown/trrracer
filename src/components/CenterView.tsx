import React, { useState } from 'react';
import {
  Box,
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverArrow,
  PopoverBody,
  PopoverHeader
} from '@chakra-ui/react';

import * as d3 from "d3";

import CenterFileRender from './centerFileRender';
import { getIndexOfMonth } from '../timeHelperFunctions';
import Activity from "./Activity"


const CenterView = (projectProps: any) => {
  const {projectEntries, folderPath, timeFilter, setTimeFilter} = projectProps;
  
  let years = d3.groups(projectEntries, y => new Date(y.date).getFullYear())

  let yearMonth = years.sort((a, b) => a[0] - b[0]).map((year, yi) => {

    let mon = d3.groups(year[1], m => new Date(m.date).getMonth())

    let wrapper = new Array(12).fill({}).map((m, i)=> {
      let activ = mon.filter(f => f[0] === i);
      let activity = activ.length > 0 ? activ.flatMap(f => {
        f[1] = f[1].map(a => {
          a.month = i
          a.year = year[0]
        return a})
        return f[1]}) : [];
      if(activity.length > 0){ 
        activity[0].firstMonth = true;
      }
      return { month: i, year: year[0], activities: activity }
    });

    return {year: year[0], months: wrapper}
  });

/**
 * Trim the empty months in beginnign and end of timeline
 */ 
  let startIndex = getIndexOfMonth(yearMonth[0].months, 'first');
  let endIndex = getIndexOfMonth(yearMonth[yearMonth.length - 1].months, 'last')
  yearMonth[0].months = yearMonth[0].months.filter((f, i)=> i > startIndex - 1)
  yearMonth[yearMonth.length - 1].months = yearMonth[yearMonth.length - 1].months.filter((f, i)=> i < endIndex)

  let flatActivities = yearMonth.flatMap(yr => yr.months.flatMap(mo => mo.activities))

  let getMonth = (activity: Object) => {
    let monthDict = [ "Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return monthDict[activity.month]
  }

    let fAct = timeFilter != null ? flatActivities.filter(f => new Date(f.date) >= timeFilter[0] && new Date(f.date) <= timeFilter[1]) : flatActivities;
   
    return(
        
        <Box flex='3' h='calc(100vh - 150px)' overflowY='auto'>
          <div style={{display: 'flex', flexFlow: 'column wrap', height: 'calc(100vh - 250px)'}}>
            {fAct.map((fa:any, i:number) => (
              <>
                { fa.firstMonth ? (<Box key={`first-${fa.title}-${i}`} marginTop={7} textAlign={'right'} paddingRight={2}>{`${getMonth(fa)}`}</Box>) : ("") }
                <Popover trigger="hover">
                <PopoverTrigger>
                <Activity activity={fa} folderPath={folderPath} index={i}></Activity>
                </PopoverTrigger>
                <PopoverContent bg='white' color='gray'>
                    <PopoverArrow bg='white' />
            
                  <PopoverBody>
                  {'HIIIII'}
                  </PopoverBody>
                  
                  </PopoverContent>
                  </Popover>
           
            
              </>
            ))
            }
            
          </div>
        </Box>
    )
}

export default CenterView;

