import { Heading } from '@chakra-ui/react';
import React, { useState } from 'react';


const GoogDriveSpans = (googProps:any) => {

    const { googEl, index } = googProps;
    const [bgColor, setBgColor] = useState('#ffffff');

    const styleSection = (sectionData:any) => {
        
        let styleOb = {display: "inline", backgroundColor: bgColor}
        if(sectionData.textRun){
          if(sectionData.textRun.textStyle){
            Object.keys(sectionData.textRun.textStyle).forEach((m, i) => {
              console.log('google', m, i, sectionData);
              if(m === "italic") styleOb.fontStyle = 'italic';
              if(m === "bold") styleOb.fontWeight = 'bold';
              
            })
          }
        }
        return styleOb;
    }
    return (
        <div key={`elem-${index}`} style={styleSection(googEl)} 
            onMouseOver={()=> setBgColor('#FFFCBB')}
            onMouseOut={()=> setBgColor('#ffffff')}>
            <span>{googEl.textRun ? googEl.textRun.content : <span>{'PICTURE'}</span>}</span>
        </div> 
    )
}

const GoogDriveParagraph = (parProps: any)  => {

    const {parData, index} = parProps;

    const getHeading = (styling:any, content:any) => {
       
        if(styling.namedStyleType.includes('1')) return <Heading as={'h1'}>{parData.paragraph.elements[0].textRun.content}</Heading>;
        if(styling.namedStyleType.includes('2')) return <Heading as={'h2'}>{parData.paragraph.elements[0].textRun.content}</Heading>;
        if(styling.namedStyleType.includes('3')) return <Heading as={'h3'}>{parData.paragraph.elements[0].textRun.content}</Heading>;
    }

    return (
        parData.paragraph.paragraphStyle.namedStyleType.includes('HEADING') ? 
        <div>{getHeading(parData.paragraph.paragraphStyle, parData.paragraph)}</div> :
        <div key={`sections-${index}`}>
            {
                parData.paragraph.elements ? parData.paragraph.elements.map((elem:any, j:number) => (

                  <GoogDriveSpans key={`span-${j}`} googEl={elem} index={j}/>
                )) : "no words"
            }
        </div>
        
    )
}

export default GoogDriveParagraph;



