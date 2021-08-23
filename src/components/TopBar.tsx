import React, { useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { EntryType, FileObj, ProjectViewProps } from './types';

import ViewTypeControl from './ViewTypeControl';


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
        display:'flex',
        flexGrow: 1,
        flexDirection: 'row'
    },

    list:{
        position:'relative',
        right:0
    },
   
    h6: {
      alignItems:'flex-start',
      paddingRight: '150px'
    },
  }),
);

const TopBar = (ProjectPropValues: ProjectViewProps) =>{

const { projectData, folderPath, viewType, setViewType } = ProjectPropValues;


const classes = useStyles();

let splitTitle = (title)=>{
    let t = title.split('/');
    return t[t.length - 1];
}

return (
  <AppBar position="static">
      <Toolbar className={classes.root}>

        <Typography variant="h6" className={classes.h6}>
            {splitTitle(projectData.title)}
        </Typography>

        <ViewTypeControl viewType={viewType} setViewType={setViewType} />
     
      </Toolbar>
    </AppBar> 
)

}

export default TopBar;
      
     