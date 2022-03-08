import {Popover, PopoverTrigger, PopoverArrow, PopoverBody, PopoverContent } from '@chakra-ui/react';
import React, { useState } from 'react';

const colorConvert = (codes: Object) => {
    return `rgb(${255 * (codes.red ? codes.red : 0)},${255 * (codes.green ? codes.green : 0)},${255 * (codes.blue ? codes.blue : 0)})`;
};

const GoogInline = (googProps:any) => {

    const {sectionData} = googProps;

    console.log('section data', sectionData.inlineObjectElement.inlineObjectId)

    return (
        <div>{` picture here! ${sectionData.inlineObjectElement.inlineObjectId} `}</div>
    )

}

const styleSection = (sectionData:any, commentedOn:any) => {

    let styleOb = {display: "inline"}

        if(sectionData.textRun.textStyle){
            Object.keys(sectionData.textRun.textStyle).forEach((m, i) => {
            
            if(m === "italic") styleOb.fontStyle = 'italic';
            if(m === "bold") styleOb.fontWeight = 'bold';
            if(m === "backgroundColor"){
                    styleOb.backgroundColor = colorConvert(sectionData.textRun.textStyle[m].color.rgbColor)
            }
            if(m === "foregroundColor"){
                    styleOb.color = colorConvert(sectionData.textRun.textStyle[m].color.rgbColor)
            }
        })
        if(commentedOn) styleOb.backgroundColor = '#FFFCBB';
      }
    
    
    return styleOb;
}

const GoogDriveSpans = (googProps:any) => {

    const { googEl, index, comments } = googProps;

    let temp = comments.filter((f:any)=> googEl.textRun.content.includes(f.quotedFileContent.value))

    console.log('TEMP IN MOD', temp);
   

    return (
       
        temp.length > 0 ?
        <Popover>
            <PopoverTrigger>
                <div key={`elem-${index}`} style={styleSection(googEl, true)}>
                    <span>{googEl.textRun.content}</span>
                </div>
            </PopoverTrigger>
            
            <PopoverContent bg="white" color="gray">
            <PopoverArrow bg="white" />

            <PopoverBody>
                <div>{'TESTING THIS OUT'}</div>
            </PopoverBody>
            </PopoverContent>
        </Popover> :
        <div key={`elem-${index}`} style={styleSection(googEl, false)}>
        <span>{googEl.textRun.content}</span>
        </div>
        
    )
}

const GoogDriveParagraph = (parProps: any)  => {

    const {parData, index, comments} = parProps;
    // console.log(parData)

    const getHeading = (styling:any, content:any) => {
       
        if(styling.namedStyleType.includes('1')) return <span style={{fontSize:30, fontWeight:800, display:'block', marginBottom:10, marginTop:6}}>{content.elements[0].textRun.content}</span>;
        if(styling.namedStyleType.includes('2')) return <span style={{fontSize:24, fontWeight:700, display:'block', marginBottom:10, marginTop:6}}>{content.elements[0].textRun.content}</span>;
        if(styling.namedStyleType.includes('3')) return <span style={{fontSize:18, fontWeight:600, display:'block', marginBottom:10, marginTop:6}}>{content.elements[0].textRun.content}</span>;
    }

    return (
        parData.paragraph.paragraphStyle.namedStyleType.includes('HEADING') ? 
        <div>{getHeading(parData.paragraph.paragraphStyle, parData.paragraph)}</div> :
        <div key={`sections-${index}`}>
            {
                parData.paragraph.elements && (
                    parData.paragraph.elements.map((elem:any, j:number) => (
                        <React.Fragment key={`span-${j}`}>
                        {elem.textRun ?
                        <GoogDriveSpans googEl={elem} index={j} comments={comments}/>
                        : <GoogInline sectionData={elem}/>}
                        </React.Fragment>
                    )) 
                )
            }
        </div>
        
    )
}

export default GoogDriveParagraph;



