import React, { useEffect, useState } from 'react';
import ReactMde from 'react-mde';
import * as Showdown from 'showdown';
import { readFileSync } from '../fileUtil';
// import * as fs from 'fs';
// import path from 'path';

const EmailRender = (props: any) => {
  const { title, setFragSelected, artifactData, activityData } = props;
  const [{folderPath}] = useProjectState();

  console.log('artifactData', artifactData, activityData);

  const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,
  });


  const [emailData, setEmailData] = useState('Email failed to load');

  useEffect(() => {
    // if (activityData.description) {
    //   setEmailData(activityData.description);
    // }
    console.log(`${folderPath} ${title}`)
    readFileSync(`${folderPath}/${title}`).then((eml)=> {
      
      let test = eml.split('Date:').filter((f, i)=> i != 0);

      let parsed = test.map((m, i)=> {
        let stringTemp = `Date: ${m}`
        // console.log('ST',stringTemp);
        let temp = stringTemp.split('/[\n\r]+[\-a-zA-Z]+:/')
        console.log('tempppp',temp)
        return stringTemp;
    })
      console.log('split email',test)
      setEmailData(parsed);
    })
  }, [title]);

  return (
    // <div
    // style={{ height: '95%', overflow: 'auto' }}
    // dangerouslySetInnerHTML={{__html: emailData}}
    // />
    emailData && (
      <div style={{width:'700px', overflow:'auto', marginRight:'60px', margin:'10px'}}>
        {/* <div dangerouslySetInnerHTML={{__html: emailData}} /> */}
        {emailData.map(em => (
          <div>{em}</div>
        ))}
      </div>
      
    )

    // <ReactMde
    //   value={emailData}
    //   // onChange={setValue}
    //   selectedTab={'preview'}
    //   onTabChange={() => null}
    //   generateMarkdownPreview={(markdown) =>
    //     Promise.resolve(converter.makeHtml(markdown))
    //   }
    //   readOnly={true}
    //   style={{ height: '100%', overflowY: 'scroll' }}
    // />
    // <div style={{ height: '90%', overflow: 'auto' }}>
    //   {emailData.map((m, i) => (
    //     <div
    //       key={`email-${i}`}
    //       style={{ display: 'block' }}
    //       onMouseUp={() => {
    //         if (setFragSelected) {
    //           const selObj = window.getSelection();
    //           console.log('test', selObj);
    //           setFragSelected(selObj?.toString());
    //         } else {
    //           console.log('mouseup');
    //         }
    //       }}
    //     >
    //       {m}
    //     </div>
    //   ))}
    // </div>
  );
};

export default EmailRender;
